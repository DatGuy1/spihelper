import { spiHelperSettings } from '../options.ts';
import { ParsedArchiveNotice, type SectionEntry } from '../types/spi.ts';
import {
  spiHelperConfigurePendingChanges, spiHelperDeletePage,
  spiHelperEditPage, spiHelperGetPageRev, spiHelperGetPageText,
  spiHelperGetProtectionInformation, spiHelperGetSiteRestrictionInformation,
  spiHelperGetSPIBacklinks,
  spiHelperGetStabilisationSettings, spiHelperMovePage, spiHelperProtectPage,
  spiHelperUndeletePage,
} from '../api.ts';
import {
  spiHelperArchiveNoticeRegex,
  spiHelperPriorCasesRegex,
  spiHelperSockSectionWithNewlineRegex,
} from '../constants/regex.ts';
import { context, setContext } from '../context.ts';
import { spiHelperGetInterwikiPrefix } from '../utils.ts';
import { spiHelperIsAdmin } from '../role.ts';
import type { NewPendingChanges, Protection } from '../types/api.ts';
import { spiHelperParseArchiveNotice } from '../archivenotice.ts';

/**
 * Move or merge the selected case into a different case
 *
 * @param {string} target The username portion of the case this section should be merged into
 *                        (should have been normalized before getting passed in)
 * @param archiveNotice
 */
export async function spiHelperMoveCase(target: string, archiveNotice: ParsedArchiveNotice) {
  // Move or merge an entire case
  // Normalize: change underscores to spaces
  // target = target
  const newPageName = context.pageName.replace(context.caseName, target);
  const targetPageText = await spiHelperGetPageText(newPageName, false);
  if (targetPageText) {
    if (spiHelperIsAdmin()) {
      const proceed = confirm('Target page exists, do you want to histmerge the cases?');
      if (!proceed) {
        // Build out the error line
        $('<li>')
          .append($('<div>').addClass('spihelper-errortext')
            .append($('<b>').text('Aborted merge.')))
          .appendTo($('#spiHelper_status', document));
        return;
      }
    }
    else {
      $('<li>')
        .append($('<div>').addClass('spihelper-errortext')
          .append($('<b>').text('Target page exists and you are not an admin, aborting merge.')))
        .appendTo($('#spiHelper_status', document));
      return;
    }
  }
  const oldPageName = context.pageName;
  if (newPageName === oldPageName) {
    $('<li>')
      .append($('<div>').addClass('spihelper-errortext')
        .append($('<b>').text('Target page is the current page, aborting merge.')))
      .appendTo($('#spiHelper_status', document));
    return;
  }
  // TODO: Do I even want to change the context?
  // Housekeeping to update all the var names following the rename
  const oldArchiveName = context.archiveName;
  setContext(target);
  let archivesCopied = false;
  if (targetPageText) {
    // There's already a page there, we're going to merge
    // First, check if there's an archive; if so, copy its text over
    let sourceArchiveText = await spiHelperGetPageText(oldArchiveName, false);
    let targetArchiveText = await spiHelperGetPageText(context.archiveName, false);
    if (sourceArchiveText && targetArchiveText) {
      $('<li>')
        .append($('<div>').text('Archive detected on both source and target cases, manually copying archive.'))
        .appendTo($('#spiHelper_status', document));

      // Normalize the source archive text
      sourceArchiveText = sourceArchiveText.replace(/^\s*__TOC__\s*$\n/gm, '');
      sourceArchiveText = sourceArchiveText.replace(spiHelperArchiveNoticeRegex, '');
      sourceArchiveText = sourceArchiveText.replace(spiHelperPriorCasesRegex, '');
      // Strip leading newlines
      sourceArchiveText = sourceArchiveText.replace(/^\n*/, '');
      targetArchiveText += '\n' + sourceArchiveText;
      await spiHelperEditPage(context.archiveName, targetArchiveText, 'Copying archives from [[' + spiHelperGetInterwikiPrefix() + oldArchiveName + ']], see page history for attribution',
        false, spiHelperSettings.watch.archive, spiHelperSettings.expiry.archive);
      await spiHelperDeletePage(oldArchiveName, 'Deleting copied archive');
      archivesCopied = true;
    }
    // Now get existing protection levels on the target and existing page.
    const oldPageNameProtection = await spiHelperGetProtectionInformation(oldPageName);
    const newPageNameProtection = await spiHelperGetProtectionInformation(context.pageName);
    const newProtectionValues: Protection[] = [];
    const siteRestrictions = await spiHelperGetSiteRestrictionInformation();
    // First find if both the old page and new page had the same protection type enabled
    siteRestrictions.types.forEach((type: string) => {
      const oldPageNameEntry = oldPageNameProtection.find(dict => dict.type === type);
      const newPageNameEntry = newPageNameProtection.find(dict => dict.type === type);
      if (oldPageNameEntry && newPageNameEntry) {
        let expiry = newPageNameEntry.expiry;
        if (newPageNameEntry.expiry === 'infinity' || oldPageNameEntry.expiry === 'infinity' || newPageNameEntry.expiry === 'infinite' || oldPageNameEntry.expiry === 'infinite') {
          expiry = 'infinite';
        }
        else if (newPageNameEntry.expiry < oldPageNameEntry.expiry) {
          expiry = oldPageNameEntry.expiry;
        }
        const oldPageNameEntryLevelIndex = siteRestrictions.levels.indexOf(oldPageNameEntry.level);
        const newPageNameEntryLevelIndex = siteRestrictions.levels.indexOf(newPageNameEntry.level);
        let level: string;
        if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
          console.error('Invalid protection information provided from API');
          return;
        }
        else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
          level = oldPageNameEntry.level;
        }
        else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
          level = newPageNameEntry.level;
        }
        else {
          return;
        }
        newProtectionValues.push({ type: oldPageNameEntry.type, expiry: expiry, level: level });
      }
      else if (oldPageNameEntry) {
        newProtectionValues.push(oldPageNameEntry);
      }
      else if (newPageNameEntry) {
        newProtectionValues.push(newPageNameEntry);
      }
    });
    // Now handle pending changes protection
    const oldPageStabilisation = await spiHelperGetStabilisationSettings(oldPageName);
    const newPageStabilisation = await spiHelperGetStabilisationSettings(context.pageName);
    let newStabilisationSettings: NewPendingChanges = { level: '' };
    if (oldPageStabilisation && newPageStabilisation) {
      // Pending changes is used on both pages
      if (
        newPageStabilisation.protection_expiry.startsWith('infinit')
        || oldPageStabilisation.protection_expiry.startsWith('infinit')
      ) {
        newStabilisationSettings.expiry = 'infinite';
      }
      else if (newPageStabilisation.protection_expiry < oldPageStabilisation.protection_expiry) {
        newStabilisationSettings.expiry = oldPageStabilisation.protection_expiry;
      }
      else {
        newStabilisationSettings.expiry = newPageStabilisation.protection_expiry;
      }
      const oldPageNameEntryLevelIndex = siteRestrictions.levels
        .indexOf(oldPageStabilisation.protection_level);
      const newPageNameEntryLevelIndex = siteRestrictions.levels
        .indexOf(newPageStabilisation.protection_level);
      if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
        console.error('Invalid protection information provided from API');
        return;
      }
      else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = oldPageStabilisation.protection_level;
      }
      else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = newPageStabilisation.protection_level;
      }
    }
    else if (oldPageStabilisation) {
      newStabilisationSettings = {
        level: oldPageStabilisation.protection_level,
        expiry: oldPageStabilisation.protection_expiry,
      };
    }
    else if (newPageStabilisation) {
      newStabilisationSettings = {
        level: newPageStabilisation.protection_level,
        expiry: newPageStabilisation.protection_expiry,
      };
    }
    // Ignore warnings on the move, we're going to get one since we're stomping an existing page
    await spiHelperDeletePage(context.pageName, 'Deleting as part of case merge');
    await spiHelperMovePage(oldPageName, context.pageName, 'Merging case to [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]', true);
    await spiHelperUndeletePage(context.pageName, 'Restoring page history after merge');
    if (archivesCopied) {
      // Create a redirect
      await spiHelperEditPage(oldArchiveName, '#REDIRECT [[' + context.archiveName + ']]', 'Redirecting old archive to new archive',
        false, spiHelperSettings.watch.archive, spiHelperSettings.expiry.archive);
    }
    // Now to protect both the oldPageName and newPageName with the protection
    // settings in newProtectionDict, unless it is empty (i.e. no protection needed)
    // Also apply any pending changes needed
    // (when newStabilisationSettings has a non-empty protection_level)
    if (newProtectionValues.length !== 0) {
      await spiHelperProtectPage(context.pageName, newProtectionValues);
      await spiHelperProtectPage(oldPageName, newProtectionValues);
    }
    if (newStabilisationSettings.level !== '') {
      await spiHelperConfigurePendingChanges(context.pageName, newStabilisationSettings);
      await spiHelperConfigurePendingChanges(oldPageName, newStabilisationSettings);
    }
  }
  else {
    await spiHelperMovePage(oldPageName, context.pageName, 'Moving case to [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]', false);
  }
  context.startingRevId = await spiHelperGetPageRev(context.pageName);
  await spiHelperPostRenameCleanup(oldPageName, archiveNotice);
  if (targetPageText) {
    // If there was a page there before, also need to do post-merge cleanup
    await spiHelperPostMergeCleanup(targetPageText);
  }
  if (archivesCopied) {
    alert('Archives were merged during the case move, please reorder the archive sections');
  }
}

/**
 * Move or merge a specific section of a case into a different case
 *
 * @param mergeTarget The username portion of the case this section should be merged into
 * @param section The section of this case that should be moved/merged
 */
export async function spiHelperMoveCaseSection(mergeTarget: string, section: SectionEntry) {
  const newPageName = context.pageName.replace(context.caseName, mergeTarget);
  let targetPageText = await spiHelperGetPageText(newPageName, false);
  let sectionText = await section.getText();
  sectionText = sectionText.replace(
    /\n*----(?!(\n|.)*----)/,
    '\n* {{clerknote}} originally filed under [[Wikipedia:Sockpuppet investigations/' + context.caseName + ']]. ~~~~\n----',
  );

  if (targetPageText === '') {
    // Preload the split mergeTarget with the SPI templates if it's empty
    targetPageText = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|' + mergeTarget + '}}\n{{SPIpriorcases}}';
  }
  targetPageText += '\n' + sectionText;

  // Intentionally not async - doesn't matter when this edit finishes
  void spiHelperEditPage(
    newPageName, targetPageText,
    'Moving case section from [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']], see page history for attribution',
    false, spiHelperSettings.watch.case, spiHelperSettings.expiry.case,
  );
  // Blank the section we moved
  await spiHelperEditPage(
    context.pageName, '',
    'Moving case section to [[' + spiHelperGetInterwikiPrefix() + newPageName + ']]',
    false, spiHelperSettings.watch.case, spiHelperSettings.expiry.case,
    context.startingRevId, section.id,
  );
  // Update to the latest revision ID
  context.startingRevId = await spiHelperGetPageRev(context.pageName);
}

/**
 * Cleanups following a rename - update the archive notice, add an archive notice to the
 * old case name, add the original sockmaster to the sock list for reference
 *
 * @param {string} oldCasePage Title of the previous case page
 * @param archiveNotice Archive notice for the new page
 */
async function spiHelperPostRenameCleanup(
  oldCasePage: string, archiveNotice: ParsedArchiveNotice,
): Promise<void> {
  archiveNotice.username = context.caseName;
  const replacementArchiveNotice = archiveNotice.generateWikitext();
  const oldCaseName = oldCasePage.replace(/Wikipedia:Sockpuppet investigations\//g, '');

  // Update previous SPI redirects to this location
  const pagesChecked = [];
  const pagesToCheck = [oldCasePage];
  let currentPageToCheck = null;
  while (pagesToCheck.length !== 0) {
    currentPageToCheck = pagesToCheck.pop();
    if (
      !currentPageToCheck
      || currentPageToCheck === context.pageName
      || currentPageToCheck === oldCasePage
    ) {
      continue;
    }
    pagesChecked.push(currentPageToCheck);
    const backlinks = await spiHelperGetSPIBacklinks(currentPageToCheck);
    for (const backlink of backlinks) {
      const archiveNotice = await spiHelperParseArchiveNotice(backlink.title);
      if (!archiveNotice) {
        continue;
      }
      if (archiveNotice.username === currentPageToCheck.replace(/Wikipedia:Sockpuppet investigations\//g, '')) {
        void spiHelperEditPage(backlink.title, replacementArchiveNotice, 'Updating case following page move', false, spiHelperSettings.watch.case, spiHelperSettings.expiry.case);
        if (pagesChecked.indexOf(backlink.title) !== -1) {
          pagesToCheck.push(backlink.title);
        }
      }
    }
  }

  // The old case should just be the archivenotice template and point to the new case
  await spiHelperEditPage(oldCasePage, replacementArchiveNotice, 'Updating case following page move', false, spiHelperSettings.watch.case, spiHelperSettings.expiry.case);

  // The new case's archivenotice should be updated with the new name
  let newPageText = await context.getText(false, true);
  newPageText = newPageText.replace(spiHelperArchiveNoticeRegex, '{{SPI archive notice|1=' + context.caseName + '$2}}');
  // We also want to add the previous master to the sock list
  // We use SOCK_SECTION_RE_WITH_NEWLINE to clean up any extraneous whitespace
  newPageText = newPageText.replace(spiHelperSockSectionWithNewlineRegex, '====Suspected sockpuppets====' + '\n* {{checkuser|1=' + oldCaseName + '}} ({{clerknote}} original case name)\n');
  // Also remove the new master if they're in the sock list
  // This RE is kind of ugly. The idea is that we find everything from the level 4 heading
  // ending with "sockpuppets" to the level 4 heading beginning with <big> and pull the checkuser
  // template matching the current case name out. This keeps us from accidentally replacing a
  // checkuser entry in the admin section
  const newMasterReString = '(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?' + context.caseName + '(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)';
  const newMasterRe = new RegExp(newMasterReString, 'sm');
  newPageText = newPageText.replace(newMasterRe, '$1\n$2');

  await context.edit({ newText: newPageText, summary: 'Updating case following page move', watch: spiHelperSettings.watch.case, watchExpiry: spiHelperSettings.expiry.case });
  // Update to the latest revision ID
  await context.refreshRevId();
}

/**
 * Cleanups following a merge - re-insert the original page text
 *
 * @param {string} originalText Text of the page pre-merge
 */
async function spiHelperPostMergeCleanup(originalText: string): Promise<void> {
  let newText = await context.getText(true);
  // Remove the SPI header templates from the page
  newText = newText.replace(/\n*<noinclude>__TOC__.*\n/ig, '');
  newText = newText.replace(spiHelperArchiveNoticeRegex, '');
  newText = newText.replace(spiHelperPriorCasesRegex, '');
  newText = originalText + '\n' + newText;

  // Write the updated case
  await context.edit({ newText: newText, summary: 'Re-adding previous cases following merge', watch: spiHelperSettings.watch.case, watchExpiry: spiHelperSettings.expiry.case });
  // Update to the latest revision ID
  await context.refreshRevId();
}
