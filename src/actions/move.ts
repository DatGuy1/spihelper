import { spiHelperSettings } from '../options';
import {
  spiHelperConfigurePendingChanges,
  spiHelperDeletePage,
  spiHelperEditPage,
  spiHelperGetInvestigationSections,
  spiHelperGetPageText,
  spiHelperGetPostExpandSizeFromText,
  spiHelperGetProtectionInformation,
  spiHelperGetSPIBacklinks,
  spiHelperGetSiteRestrictionInformation,
  spiHelperGetStabilisationSettings,
  spiHelperMovePage,
  spiHelperProtectPage,
  spiHelperUndeletePage,
} from '../api.ts';
import {
  spiHelperArchiveNoticeRegex,
  spiHelperPriorCasesRegex,
  spiHelperSockSectionWithNewlineRegex,
} from '../constants';
import { SpiPageContext, context } from '../context.ts';
import { spiHelperCanSuppressRedirect, spiHelperIsAdmin } from '../role.ts';
import { type NewPendingChanges, ParsedArchiveNotice, type Protection, type Restrictions } from '../types';
import { spiHelperParseArchiveNotice, spiHelperParseArchiveNoticeText } from '../archivenotice.ts';
import { type SectionEntry, loadSectionText } from '../state.ts';
import { VueMessage } from '../ui/messages.ts';
import {
  isAbsoluteExpiry,
  parseArchiveSections,
  rebuildArchiveText,
  spiHelperGetMaxPostExpandSize,
} from '../utils.ts';
import { parseTemplate } from '../template.ts';
import { findArchiveSplitPoint, findFirstEmptySubArchive } from './archive.ts';

async function getNewProtection(
  oldTitle: string, newTitle: string, siteRestrictions: Restrictions,
) {
  const oldPageNameProtection = await spiHelperGetProtectionInformation(oldTitle);
  const newPageNameProtection = await spiHelperGetProtectionInformation(newTitle);
  const newProtectionValues: Protection[] = [];
  // First find if both the old page and new page had the same protection type enabled
  siteRestrictions.types.forEach((type: string) => {
    const oldPageNameEntry = oldPageNameProtection.find(dict => dict.type === type);
    const newPageNameEntry = newPageNameProtection.find(dict => dict.type === type);
    if (oldPageNameEntry && newPageNameEntry) {
      let expiry = newPageNameEntry.expiry;
      if (isAbsoluteExpiry(newPageNameEntry.expiry) || isAbsoluteExpiry(oldPageNameEntry.expiry)) {
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
        // If old page level is higher than new page level, use the old page level
        level = oldPageNameEntry.level;
      }
      else {
        // If new page level is higher than new page level, or if
        // the protection levels are equal, use the new page level
        // (It doesn't really matter which level we use if it's equal)
        level = newPageNameEntry.level;
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
  return newProtectionValues;
}

async function getNewPendingChanges(
  oldTitle: string, newTitle: string, siteRestrictions: Restrictions,
) {
  const oldPageStabilisation = await spiHelperGetStabilisationSettings(oldTitle);
  const newPageStabilisation = await spiHelperGetStabilisationSettings(newTitle);
  let newStabilisationSettings: NewPendingChanges = { level: '' };
  if (oldPageStabilisation && newPageStabilisation) {
    // Pending changes is used on both pages
    if (
      isAbsoluteExpiry(oldPageStabilisation.protection_expiry)
      || isAbsoluteExpiry(newPageStabilisation.protection_expiry)
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
      return newStabilisationSettings;
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
  return newStabilisationSettings;
}

/**
 * Merge an archive from the old case into the new case's archive, splitting into a
 * numbered sub-archive if the merged result would exceed the post-expand size limit.
 *
 * @param oldContext The previous case page's context
 * @param newContext The new case page's context
 * @param addNote Whether to prepend a note to each merged-in section noting its origin
 * @returns 'copied' if the archives were merged, 'skipped' if there was nothing to merge
 * or the source/target archive couldn't be parsed, 'abort' if the caller should stop
 * the whole move (the merged archive is too large to split further)
 */
export async function mergeArchives(
  oldContext: SpiPageContext, newContext: SpiPageContext, addNote: boolean,
): Promise<'copied' | 'skipped' | 'abort'> {
  const sourceArchiveText = await spiHelperGetPageText(oldContext.archiveName, false);
  let targetArchiveText = await spiHelperGetPageText(newContext.archiveName, false);
  if (!sourceArchiveText || !targetArchiveText) {
    return 'skipped';
  }
  new VueMessage({
    type: 'notice',
    content: 'Archives detected on both source and target cases, copying it manually.',
  }).show();

  const sourceArchiveEntries = await spiHelperGetInvestigationSections(
    { pageName: oldContext.archiveName },
  );
  const targetArchiveEntries = await spiHelperGetInvestigationSections(
    { pageName: newContext.archiveName },
  );
  const sourceArchiveSections = sourceArchiveEntries.length
    ? parseArchiveSections(sourceArchiveText, sourceArchiveEntries)
    : null;
  const targetArchiveSections = targetArchiveEntries.length
    ? parseArchiveSections(targetArchiveText, targetArchiveEntries)
    : null;
  if (!sourceArchiveSections || !targetArchiveSections) {
    new VueMessage({
      type: 'error',
      content: 'Could not parse the archive. Please merge the archives manually',
    }).show();
    return 'skipped';
  }

  if (addNote) {
    for (const section of sourceArchiveSections) {
      section.fullText = section.fullText.replace(
        /\n*----(?!([\n.])*----)/,
        `\n* {{clerknote}} originally filed under [[${oldContext.pageName}]]. ~~~~\n----`,
      );
    }
  }
  const parsedSections = [...targetArchiveSections, ...sourceArchiveSections];
  targetArchiveText = rebuildArchiveText(targetArchiveText, parsedSections);

  const maxSize = spiHelperGetMaxPostExpandSize();
  if (await spiHelperGetPostExpandSizeFromText(targetArchiveText) >= maxSize) {
    new VueMessage({
      type: 'notice',
      content: 'Running binary search to find cutoff point for post-expand include size',
    }).show();
    const splitPoint = await findArchiveSplitPoint(parsedSections, targetArchiveText);

    if (splitPoint >= parsedSections.length) {
      new VueMessage({
        type: 'error',
        content: 'Archives are too large to merge without hitting post-expand size limit. Please merge manually',
      }).show();
      return 'abort';
    }

    const subArchiveId = await findFirstEmptySubArchive(newContext.archiveName);
    if (subArchiveId === null) return 'abort';

    const subArchiveHeader = `__TOC__\n{{SPI archive notice|1=${newContext.caseName}}}\n{{SPIpriorcases}}\n`;
    await spiHelperEditPage({
      title: `${newContext.archiveName}/${subArchiveId}`,
      newText: rebuildArchiveText(subArchiveHeader, parsedSections.slice(0, splitPoint)),
      summary: `Splitting archive due to post-expand size limit`,
      createonly: false,
      watch: spiHelperSettings.watch.archive,
      watchExpiry: spiHelperSettings.expiry.archive,
    });
    targetArchiveText = rebuildArchiveText(
      targetArchiveText, parsedSections.slice(splitPoint),
    );
  }

  await spiHelperEditPage({
    title: newContext.archiveName,
    newText: targetArchiveText,
    summary: `Merging archives from [[${oldContext.prefixedName}]], see page history for attribution`,
    createonly: false,
    watch: spiHelperSettings.watch.archive,
    watchExpiry: spiHelperSettings.expiry.archive,
  });
  return 'copied';
}

/**
 * Move or merge the selected case into a different case
 *
 * @param opts.target The username portion of the case this section should be merged into
 * (should have been normalized before getting passed in)
 * @param opts.suppress Whether to suppress the old case, or request deletion of it
 * @param opts.addNote Whether to add a note about the original case name
 * @param opts.archiveNotice Archivenotice used in the cleanup of the old page
 */
export async function spiHelperMoveCase(opts: {
  target: string;
  suppress: boolean;
  addNote: boolean;
  archiveNotice: ParsedArchiveNotice;
}) {
  const { target, suppress, addNote, archiveNotice } = opts;
  const oldContext = context;
  const newContext = new SpiPageContext(context.pageName.replace(context.caseName, target));

  const targetPageText = await spiHelperGetPageText(newContext.pageName, false);
  // TODO: Move this to archiveAction.ts
  if (targetPageText) {
    if (spiHelperIsAdmin()) {
      const proceed = confirm('Target page exists, do you want to histmerge the cases?');
      if (!proceed) {
        new VueMessage({ type: 'warning', content: 'Aborted merge' }).show();
        return;
      }
    }
    else {
      new VueMessage({
        type: 'warning',
        content: 'Target page exists and you are unable to histmerge, aborting merge',
      }).show();
      return;
    }
  }
  if (newContext.pageName === oldContext.pageName) {
    new VueMessage({ type: 'error', content: 'Target page is the current page, aborting merge' }).show();
    return;
  }

  if (targetPageText) {
    // This case merge branch requires the user to be an administrator
    // There's already a page there, we're going to merge
    // First, check if there's an archive; if so, copy its text over
    const mergeResult = await mergeArchives(oldContext, newContext, addNote);
    if (mergeResult === 'abort') return;

    const siteRestrictions = await spiHelperGetSiteRestrictionInformation();
    // Now get existing protection levels on the target and existing page.
    const newProtection = await getNewProtection(
      oldContext.pageName, newContext.pageName, siteRestrictions,
    );
    // Now handle pending changes protection
    const newPendingChanges = await getNewPendingChanges(
      oldContext.pageName, newContext.pageName, siteRestrictions,
    );
    // Ignore warnings on the move, we're going to get one since we're stomping an existing page
    await spiHelperDeletePage(newContext.pageName, 'Deleting as part of case merge');
    await spiHelperMovePage({
      sourcePage: oldContext.pageName,
      destPage: newContext.pageName,
      summary: `Merging case to [[${newContext.prefixedName}]]`,
      ignoreWarnings: true,
      suppressRedirect: suppress,
    });
    await spiHelperUndeletePage(newContext.pageName, 'Restoring page history after merge');
    if (mergeResult === 'copied') {
      if (suppress) {
        await spiHelperDeletePage(oldContext.archiveName, `Archives moved to [[${newContext.archiveName}]]`);
      }
      else {
        // Create a redirect
        await spiHelperEditPage({
          title: oldContext.archiveName,
          newText: `#REDIRECT [[${newContext.archiveName}]]`,
          summary: 'Redirecting old archive to new archive',
          createonly: false,
          watch: spiHelperSettings.watch.archive,
          watchExpiry: spiHelperSettings.expiry.archive,
        });
      }
    }
    // Now to protect both the oldPageName and newPageName with the protection
    // settings in newProtectionDict, unless it is empty (i.e. no protection needed)
    // Also apply any pending changes needed when
    // newStabilisationSettings has a non-empty protection_level
    if (newProtection.length !== 0) {
      await spiHelperProtectPage(newContext.pageName, newProtection);
      if (!suppress) {
        await spiHelperProtectPage(oldContext.pageName, newProtection);
      }
    }
    if (newPendingChanges.level !== '') {
      await spiHelperConfigurePendingChanges(newContext.pageName, newPendingChanges);
      if (!suppress) {
        await spiHelperConfigurePendingChanges(oldContext.pageName, newPendingChanges);
      }
    }
  }
  else {
    await spiHelperMovePage({
      sourcePage: oldContext.pageName,
      destPage: newContext.pageName,
      summary: `Moving case to [[${newContext.prefixedName}]]`,
      suppressRedirect: suppress && spiHelperCanSuppressRedirect(),
      ignoreWarnings: false,
    });
  }
  await spiHelperPostRenameCleanup({
    oldContext,
    newContext,
    oldNotice: archiveNotice,
    deleteOld: suppress,
    preMergeText: targetPageText,
  });
}

/**
 * Move or merge a single section of a case into a different case
 *
 * @param mergeTarget The username portion of the case this section should be merged into
 * @param section The section of this case that should be moved/merged
 */
export async function spiHelperMoveCaseSection(mergeTarget: string, section: SectionEntry) {
  const newContext = new SpiPageContext(context.pageName.replace(context.caseName, mergeTarget));
  let targetPageText = await spiHelperGetPageText(newContext.pageName, false);
  let sectionText = await loadSectionText(section);
  sectionText = sectionText.replace(
    /\n*----(?!([\n.])*----)/,
    `\n* {{clerknote}} originally filed under [[${context.pageName}]]. ~~~~\n----`,
  );

  if (targetPageText === '') {
    // Preload the split mergeTarget with the SPI templates if it's empty
    targetPageText = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|' + mergeTarget + '}}\n{{SPIpriorcases}}';
  }
  targetPageText += '\n' + sectionText;

  // Intentionally not async - doesn't matter when this edit finishes
  void newContext.edit({
    newText: targetPageText,
    summary: `Moving case section from [[${context.prefixedName}]], see page history for attribution`,
    createonly: false,
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
  });
  // Blank the section we moved
  await context.edit({
    newText: '',
    summary: `Moving case section to [[${newContext.prefixedName}]]`,
    createonly: false,
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
    baseRevId: context.startingRevId,
    sectionId: section.id,
  });
}

/**
 * Adds the old master as a numbered entry (with an "original case name" note) to the
 * {{sock list}} template on the new case page.  If the master is already listed, only
 * the note is added.  Falls back to a {{checkuser}} bullet when no sock list is present.
 */
export function addOldMasterToSockList(pageText: string, oldMasterName: string): string {
  const sockListMatch = /\{\{sock\s+list[\s\S]*?\}\}/i.exec(pageText)?.[0];
  if (!sockListMatch) {
    return pageText.replace(
      spiHelperSockSectionWithNewlineRegex,
      '====Suspected sockpuppets====\n* {{checkuser|1=' + oldMasterName + '}} ({{clerknote}} original case name)\n',
    );
  }

  const sockListTemplate = parseTemplate(sockListMatch.slice(2, -2));
  const isMultiLine = sockListMatch.includes('\n');
  const sep = isMultiLine ? '\n' : '';
  const escapedName = oldMasterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalizedMaster = oldMasterName.toLowerCase();

  // Check if the old master is already listed as a positional or named numbered param
  const positionalIndex = sockListTemplate.positional.findIndex(
    u => u.toLowerCase() === normalizedMaster,
  );
  let namedIndex = -1;
  for (const [key, val] of Object.entries(sockListTemplate.params)) {
    if (/^\d+$/.test(key) && val.toString().toLowerCase() === normalizedMaster) {
      namedIndex = parseInt(key);
      break;
    }
  }

  let newSockList: string;

  if (positionalIndex >= 0 || namedIndex >= 0) {
    const entryIndex = namedIndex >= 0 ? namedIndex : positionalIndex + 1;
    const noteKey = `note${entryIndex}`;

    if (noteKey in sockListTemplate.params) {
      newSockList = sockListMatch;
    }
    else {
      let entryStr: string | undefined;
      if (namedIndex >= 0) {
        const match = new RegExp(`\\|\\s*${namedIndex}\\s*=\\s*${escapedName}`, 'i').exec(sockListMatch);
        entryStr = match ? match[0] : undefined;
      }
      else {
        const match = new RegExp(`\\|(?![^|}\\n]*=)\\s*${escapedName}\\s*(?=[|}\\n])`, 'i').exec(sockListMatch);
        entryStr = match ? match[0] : undefined;
      }

      newSockList = entryStr
        ? sockListMatch.replace(entryStr, entryStr + `|note${entryIndex}=({{clerknote}} original case name)`)
        : sockListMatch;
    }
  }
  else {
    // Not listed, compute the next index and insert as a new entry
    const namedKeys = Object.keys(sockListTemplate.params)
      .filter(k => /^\d+$/.test(k))
      .map(Number);
    const effectiveMax = Math.max(0, ...namedKeys, sockListTemplate.positional.length);
    const newIndex = effectiveMax + 1;
    const newEntry = `${sep}|${newIndex}=${oldMasterName}|note${newIndex}=({{clerknote}} original case name)`;

    // Find the first non-entry named param (not |N= or |noteN=) as the insertion point
    const nonEntryKeys = Object.keys(sockListTemplate.params)
      .filter(k => !/^\d+$/.test(k) && !/^note\d+$/.test(k));

    let insertBefore: { index: number; match: RegExpExecArray } | null = null;
    for (const key of nonEntryKeys) {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = new RegExp(`(\\n?)\\|\\s*${escapedKey}\\s*=`).exec(sockListMatch);
      if (match && (insertBefore === null || match.index < insertBefore.index)) {
        insertBefore = { index: match.index, match };
      }
    }

    let insertPos: number;
    if (insertBefore) {
      insertPos = insertBefore.match.index;
    }
    else {
      const closingPos = sockListMatch.lastIndexOf('}}');
      insertPos = closingPos - (sockListMatch[closingPos - 1] === '\n' ? 1 : 0);
    }
    newSockList = sockListMatch.slice(0, insertPos) + newEntry + sockListMatch.slice(insertPos);
  }

  return pageText.replace(sockListMatch, newSockList);
}

/**
 * Cleanups following a rename - update the archive notice, add an archive notice to the
 * old case name, add the original sockmaster to the sock list for reference
 *
 * @param opts.oldContext The previous case page's context
 * @param opts.newContext The new case page's context
 * @param opts.oldNotice Base archive notice to use for the new page
 * @param opts.deleteOld Should we delete the previous case page
 * @param opts.preMergeText Text that existed in the new case prior to the rename
 */
async function spiHelperPostRenameCleanup(opts: {
  oldContext: SpiPageContext;
  newContext: SpiPageContext;
  oldNotice: ParsedArchiveNotice;
  deleteOld: boolean;
  preMergeText?: string;
}): Promise<void> {
  const { oldContext, newContext, oldNotice, deleteOld, preMergeText } = opts;
  // The old case and any redirects to it are left with only a pointer to the new name
  const replacementArchiveNotice = new ParsedArchiveNotice({
    username: newContext.caseName,
  }).generateWikitext();
  // The new case gets the union of the flags of the two cases
  const targetNotice = preMergeText ? spiHelperParseArchiveNoticeText(preMergeText) : null;
  const newNotice = new ParsedArchiveNotice({
    username: newContext.caseName,
    crosswiki: oldNotice.crosswiki || targetNotice?.crosswiki,
    deny: oldNotice.deny || targetNotice?.deny,
    notalk: oldNotice.notalk || targetNotice?.notalk,
    moot: oldNotice.moot || targetNotice?.moot,
  });

  // Update previous SPI redirects to this location
  const pagesChecked = [];
  const pagesToCheck = [oldContext.pageName];
  let currentPageToCheck = null;
  while (pagesToCheck.length !== 0) {
    currentPageToCheck = pagesToCheck.pop();
    if (!currentPageToCheck || currentPageToCheck === newContext.pageName) {
      continue;
    }
    pagesChecked.push(currentPageToCheck);
    const backlinks = await spiHelperGetSPIBacklinks(currentPageToCheck);
    for (const backlink of backlinks) {
      if (backlink.title === newContext.pageName) {
        continue;
      }
      const archiveNotice = await spiHelperParseArchiveNotice({ page: backlink.title });
      if (!archiveNotice) {
        continue;
      }
      if (archiveNotice.username === currentPageToCheck.replace(/Wikipedia:Sockpuppet investigations\//g, '')) {
        await spiHelperEditPage({
          title: backlink.title,
          newText: replacementArchiveNotice,
          summary: 'Updating backlink following page move',
          watch: spiHelperSettings.watch.case,
          watchExpiry: spiHelperSettings.expiry.case,
        });
        if (!pagesChecked.includes(backlink.title)) {
          pagesToCheck.push(backlink.title);
        }
      }
    }
  }

  if (deleteOld) {
    // If we can suppress the redirect then it's already gone
    if (!spiHelperCanSuppressRedirect()) {
      await oldContext.edit({
        newText: `{{db-g6|rationale=Case moved to [[${newContext.pageName}]], requesting deletion as non-admin SPI clerk}}`,
        summary: 'Requesting [[WP:G6|G6]] deletion after case move',
        createonly: false,
        watch: spiHelperSettings.watch.archive,
        watchExpiry: spiHelperSettings.expiry.archive,
      });
    }
  }
  else {
    // The old case should just be the archivenotice template and point to the new case
    await oldContext.edit({
      newText: replacementArchiveNotice,
      summary: 'Updating old case following page move',
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
    });
  }

  // The new case's archivenotice should be updated with the new name
  let newPageText = await spiHelperGetPageText(newContext.pageName, true);
  newPageText = addOldMasterToSockList(newPageText, oldContext.caseName);
  // Merge in our old cases
  if (preMergeText) {
    let appendText = preMergeText.replace(/\n*<noinclude>__TOC__.*\n/ig, '');
    appendText = appendText.replace(spiHelperArchiveNoticeRegex, '');
    appendText = appendText.replace(spiHelperPriorCasesRegex, '');
    newPageText = newPageText + '\n' + appendText;
  }
  newPageText = newPageText.replace(spiHelperArchiveNoticeRegex, newNotice.generateWikitext());
  // Also remove the new master if they're in the sock list
  // This RE is kind of ugly. The idea is that we find everything from the level 4 heading
  // ending with "sockpuppets" to the level 4 heading beginning with <big> and pull the checkuser
  // template matching the current case name out. This keeps us from accidentally replacing a
  // checkuser entry in the admin section
  const newMasterReString = '(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?' + newContext.caseName + '(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)';
  const newMasterRe = new RegExp(newMasterReString, 'sm');
  newPageText = newPageText.replace(newMasterRe, '$1\n$2');

  await newContext.edit({
    newText: newPageText,
    summary: 'Updating new case following page move',
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
  });
}
