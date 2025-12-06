import { spiHelperSettings } from '../options.ts';
import { ParsedArchiveNotice, type SectionEntry } from '../types/spi.ts';
import {
  spiHelperConfigurePendingChanges, spiHelperDeletePage,
  spiHelperEditPage, spiHelperGetPageRev, spiHelperGetPageText,
  spiHelperGetProtectionInformation, spiHelperGetSiteRestrictionInformation, spiHelperGetSPIBacklinks,
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
        false, spiHelperSettings.watchArchive, spiHelperSettings.watchArchiveExpiry);
      await spiHelperDeletePage(oldArchiveName, 'Deleting copied archive');
      archivesCopied = true;
    }
    // Now get existing protection levels on the target and existing page.
    const oldPageNameProtection = await spiHelperGetProtectionInformation(oldPageName);
    const newPageNameProtection = await spiHelperGetProtectionInformation(context.pageName);
    const newProtectionValues: Protection[] = [];
    const siteProtectionInformation = await spiHelperGetSiteRestrictionInformation();
    // First find if both the old page and new page had the same protection type enabled
    siteProtectionInformation.types.forEach((type: string) => {
      const oldPageNameEntry = oldPageNameProtection.find((dict) => {
        return dict.type === type;
      });
      const newPageNameEntry = newPageNameProtection.find((dict) => {
        return dict.type === type;
      });
      if (oldPageNameEntry && newPageNameEntry) {
        let expiry = newPageNameEntry.expiry;
        if (newPageNameEntry.expiry === 'infinity' || oldPageNameEntry.expiry === 'infinity' || newPageNameEntry.expiry === 'infinite' || oldPageNameEntry.expiry === 'infinite') {
          expiry = 'infinite';
        }
        else if (newPageNameEntry.expiry < oldPageNameEntry.expiry) {
          expiry = oldPageNameEntry.expiry;
        }
        const oldPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(oldPageNameEntry.level);
        const newPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(newPageNameEntry.level);
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
    const oldPageNameStabilisation = await spiHelperGetStabilisationSettings(oldPageName);
    const newPageNameStabilisation = await spiHelperGetStabilisationSettings(context.pageName);
    let newStabilisationSettings: NewPendingChanges = { level: '' };
    if (oldPageNameStabilisation && newPageNameStabilisation) {
      // Pending changes is used on both pages
      if (newPageNameStabilisation.protection_expiry === 'infinity' || oldPageNameStabilisation.protection_expiry === 'infinity' || newPageNameStabilisation.protection_expiry === 'infinite' || oldPageNameStabilisation.protection_expiry === 'infinite') {
        newStabilisationSettings.expiry = 'infinite';
      }
      else if (newPageNameStabilisation.protection_expiry < oldPageNameStabilisation.protection_expiry) {
        newStabilisationSettings.expiry = oldPageNameStabilisation.protection_expiry;
      }
      else {
        newStabilisationSettings.expiry = newPageNameStabilisation.protection_expiry;
      }
      const oldPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(oldPageNameStabilisation.protection_level);
      const newPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(newPageNameStabilisation.protection_level);
      if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
        console.error('Invalid protection information provided from API');
        return;
      }
      else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = oldPageNameStabilisation.protection_level;
      }
      else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = newPageNameStabilisation.protection_level;
      }
    }
    else if (oldPageNameStabilisation) {
      newStabilisationSettings = {
        level: oldPageNameStabilisation.protection_level,
        expiry: oldPageNameStabilisation.protection_expiry,
      };
    }
    else if (newPageNameStabilisation) {
      newStabilisationSettings = {
        level: newPageNameStabilisation.protection_level,
        expiry: newPageNameStabilisation.protection_expiry,
      };
    }
    // Ignore warnings on the move, we're going to get one since we're stomping an existing page
    await spiHelperDeletePage(context.pageName, 'Deleting as part of case merge');
    await spiHelperMovePage(oldPageName, context.pageName, 'Merging case to [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]', true);
    await spiHelperUndeletePage(context.pageName, 'Restoring page history after merge');
    if (archivesCopied) {
      // Create a redirect
      await spiHelperEditPage(oldArchiveName, '#REDIRECT [[' + context.archiveName + ']]', 'Redirecting old archive to new archive',
        false, spiHelperSettings.watchArchive, spiHelperSettings.watchArchiveExpiry);
    }
    // Now to protect both the oldPageName and newPageName with the protection settings in newProtectionDict, unless it is empty (i.e. no protection needed)
    // Also apply any pending changes needed (i.e. if newStabilisationSettings has a non-empty protection_level)
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
 * @param mergeTarget The username portion of the case this section should be merged into (pre-normalized)
 * @param section The section of this case that should be moved/merged
 */
export async function spiHelperMoveCaseSection(mergeTarget: string, section: SectionEntry) {
  const newPageName = context.pageName.replace(context.caseName, mergeTarget);
  let targetPageText = await spiHelperGetPageText(newPageName, false);
  let sectionText = await section.getText();
  // SOCK_SECTION_RE_WITH_NEWLINE cleans up extraneous whitespace at the top of the section
  // Have to do this transform before concatenating with targetPageText so that the
  // "originally filed" goes in the correct section
  sectionText = sectionText.replace(spiHelperSockSectionWithNewlineRegex, '====Suspected sockpuppets====' + '\n* {{checkuser|1=' + context.caseName + '}} ({{clerknote}} originally filed under this user)\n');

  if (targetPageText === '') {
    // Preload the split mergeTarget with the SPI templates if it's empty
    targetPageText = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|' + mergeTarget + '}}\n{{SPIpriorcases}}';
  }
  targetPageText += '\n' + sectionText;

  // Intentionally not async - doesn't matter when this edit finishes
  void spiHelperEditPage(newPageName, targetPageText, 'Moving case section from [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']], see page history for attribution',
    false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
  // Blank the section we moved
  await spiHelperEditPage(context.pageName, '', 'Moving case section to [[' + spiHelperGetInterwikiPrefix() + newPageName + ']]',
    false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry, context.startingRevId, section.id);
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
async function spiHelperPostRenameCleanup(oldCasePage: string, archiveNotice: ParsedArchiveNotice): Promise<void> {
  archiveNotice.username = context.caseName;
  const replacementArchiveNotice = archiveNotice.generateWikitext();
  const oldCaseName = oldCasePage.replace(/Wikipedia:Sockpuppet investigations\//g, '');

  // Update previous SPI redirects to this location
  const pagesChecked = [];
  const pagesToCheck = [oldCasePage];
  let currentPageToCheck = null;
  while (pagesToCheck.length !== 0) {
    currentPageToCheck = pagesToCheck.pop();
    if (!currentPageToCheck || currentPageToCheck === context.pageName || currentPageToCheck === oldCasePage) {
      continue;
    }
    pagesChecked.push(currentPageToCheck);
    const backlinks = await spiHelperGetSPIBacklinks(currentPageToCheck);
    for (let i = 0; i < backlinks.length; i++) {
      const archiveNotice = await spiHelperParseArchiveNotice(backlinks[i].title);
      if (!archiveNotice) {
        continue;
      }
      if (archiveNotice.username === currentPageToCheck.replace(/Wikipedia:Sockpuppet investigations\//g, '')) {
        void spiHelperEditPage(backlinks[i].title, replacementArchiveNotice, 'Updating case following page move', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
        if (pagesChecked.indexOf(backlinks[i].title) !== -1) {
          pagesToCheck.push(backlinks[i]);
        }
      }
    }
  }

  // The old case should just be the archivenotice template and point to the new case
  await spiHelperEditPage(oldCasePage, replacementArchiveNotice, 'Updating case following page move', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);

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

  await context.edit({ newText: newPageText, summary: 'Updating case following page move', watch: spiHelperSettings.watchCase, watchExpiry: spiHelperSettings.watchCaseExpiry });
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
  await context.edit({ newText: newText, summary: 'Re-adding previous cases following merge', watch: spiHelperSettings.watchCase, watchExpiry: spiHelperSettings.watchCaseExpiry });
  // Update to the latest revision ID
  await context.refreshRevId();
}
