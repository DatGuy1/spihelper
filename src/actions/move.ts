import { spiHelperSettings } from '../options';
import {
  spiHelperConfigurePendingChanges,
  spiHelperDeletePage,
  spiHelperEditPage,
  spiHelperGetBulkPageRestrictions,
  spiHelperGetBulkPageText,
  spiHelperGetInvestigationSections,
  spiHelperGetPageText,
  spiHelperGetPostExpandSizeFromText,
  spiHelperGetSPIBacklinks,
  spiHelperGetSiteRestrictionInformation,
  spiHelperMovePage,
  spiHelperProtectPage,
  spiHelperUndeletePage,
} from '../api.ts';
import {
  spiHelperArchiveNoticeRegex,
  spiHelperSectionRegex,
  spiHelperSockSectionWithNewlineRegex,
} from '../constants';
import { SpiPageContext, context } from '../context.ts';
import { spiHelperCanSuppressRedirect, spiHelperIsAdmin } from '../role.ts';
import {
  type NewPendingChanges,
  ParsedArchiveNotice,
  type PendingChanges,
  type Protection,
  type Restrictions,
} from '../types';
import { spiHelperParseArchiveNoticeText } from '../archivenotice.ts';
import { type SectionEntry, loadSectionText } from '../state.ts';
import { VueMessage } from '../ui/messages.ts';
import {
  addAdminSectionNote,
  getContentStartIndex,
  isAbsoluteExpiry,
  parseArchiveSections,
  rebuildArchiveText,
  spiHelperGetMaxPostExpandSize,
} from '../utils.ts';
import { findTemplateSpans, parseTemplate, parseTemplates } from '../template.ts';
import { findArchiveSplitPoint, findFirstEmptySubArchive } from './archive.ts';

function getNewProtection(
  oldPageNameProtection: Protection[],
  newPageNameProtection: Protection[],
  siteRestrictions: Restrictions,
) {
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

function getNewPendingChanges(
  oldPageStabilisation: PendingChanges | null,
  newPageStabilisation: PendingChanges | null,
  siteRestrictions: Restrictions,
) {
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
    content: 'Archives detected on both source and target cases, copying it manually',
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
      section.fullText = addAdminSectionNote(`* {{clerknote}} originally filed under [[${oldContext.pageName}]]. ~~~~`, section.fullText);
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
  const newContext = new SpiPageContext(context.pageName.replace(context.caseName, () => target));

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

    // Existing protection and pending changes on both the target and existing page
    const [siteRestrictions, restrictions] = await Promise.all([
      spiHelperGetSiteRestrictionInformation(),
      spiHelperGetBulkPageRestrictions([oldContext.pageName, newContext.pageName]),
    ]);
    const oldRestrictions = restrictions.get(oldContext.pageName);
    const newRestrictions = restrictions.get(newContext.pageName);
    const newProtection = getNewProtection(
      oldRestrictions?.protection ?? [], newRestrictions?.protection ?? [], siteRestrictions,
    );
    const newPendingChanges = getNewPendingChanges(
      oldRestrictions?.pendingChanges ?? null,
      newRestrictions?.pendingChanges ?? null,
      siteRestrictions,
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
  const newContext = new SpiPageContext(
    context.pageName.replace(context.caseName, () => mergeTarget),
  );
  let targetPageText = await spiHelperGetPageText(newContext.pageName, false);
  let sectionText = await loadSectionText(section);
  sectionText = addAdminSectionNote(`* {{clerknote}} originally filed under [[${context.pageName}]]. ~~~~`, sectionText);

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
  const sockListSpan = findTemplateSpans('sock list', pageText)[0];
  if (!sockListSpan) {
    return pageText.replace(
      spiHelperSockSectionWithNewlineRegex,
      () => '====Suspected sockpuppets====\n* {{checkuser|1=' + oldMasterName + '}} ({{clerknote}} original case name)\n',
    );
  }
  const sockListMatch = sockListSpan.text;

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
        ? sockListMatch.replace(
            entryStr,
            () => entryStr + `|note${entryIndex}=({{clerknote}} original case name)`,
          )
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

  return pageText.slice(0, sockListSpan.start) + newSockList + pageText.slice(sockListSpan.end);
}

/**
 * Merge the preamble (everything above the first date section)
 * of a case being merged into the destination case's preamble
 */
export function mergePreambles(destPreamble: string, sourcePreamble: string): string {
  const destLines = new Set(destPreamble.split('\n').map(line => line.trim()));
  const extras = sourcePreamble
    .replace(spiHelperArchiveNoticeRegex, '')
    .split('\n')
    .filter(line => line.trim() && !destLines.has(line.trim()));

  return extras.length ? extras.join('\n') + '\n' + destPreamble : destPreamble;
}

/**
 * Hide the new master's {{sock list}} entry via the remove_master parameter
 */
function removeMasterFromSL(sockList: string, normalisedMaster: string): string {
  const template = parseTemplate(sockList.slice(2, -2));
  if ('remove_master' in template.params) {
    return sockList;
  }
  // An explicit |master= naming somebody else would take the wrong entry out of the list
  if ('master' in template.params
    && String(template.params.master).toLowerCase() !== normalisedMaster) {
    return sockList;
  }
  const isListed = template.positional.some(sock => sock.toLowerCase() === normalisedMaster)
    || Object.entries(template.params).some(([key, value]) => (
      /^\d+$/.test(key) && value.toString().toLowerCase() === normalisedMaster
    ));
  if (!isListed) {
    return sockList;
  }

  const closingPos = sockList.lastIndexOf('}}');
  const insertPos = closingPos - (sockList[closingPos - 1] === '\n' ? 1 : 0);
  return sockList.slice(0, insertPos) + '|remove_master=yes' + sockList.slice(insertPos);
}

/**
 * Take the new master out of the suspected sockpuppet lists:
 * they're the master of the case, not a sock of themselves
 */
export function removeNewMasterFromCases(pageText: string, newMasterName: string): string {
  const normalisedMaster = newMasterName.toLowerCase();

  // Hide from {{sock list}}
  let newText = '';
  let cursor = 0;
  for (const span of findTemplateSpans('sock list', pageText)) {
    newText += pageText.slice(cursor, span.start) + removeMasterFromSL(span.text, normalisedMaster);
    cursor = span.end;
  }
  newText += pageText.slice(cursor);

  // Remove * {{checkuser|Master}} lines
  // Scoped to the suspected sockpuppets area of each section so that a {{checkuser}} in
  // the clerk/admin comments naming the master is left alone
  const sockSectionRegex = new RegExp(
    spiHelperSockSectionWithNewlineRegex.source + '[\\s\\S]*?(?=\\n====|$)', 'gi',
  );
  return newText.replace(sockSectionRegex, sockSection => (
    sockSection.split('\n').filter((line) => {
      if (!line.trim().startsWith('*')) {
        return true;
      }
      const template = parseTemplates(line)[0];
      if (template?.name !== 'checkuser') {
        return true;
      }
      const sockName = template.positional[0] ?? template.params['1'];
      return String(sockName ?? '').toLowerCase() !== normalisedMaster;
    }).join('\n')
  ));
}

/**
 * Insert a note into the clerk/admin comment area of every section of a case page
 */
export function addNoteToCaseSections(note: string, pageText: string): string {
  // spiHelperSectionRegex is single-match; we need every header to find the boundaries
  const sectionHeaderRegex = new RegExp(spiHelperSectionRegex.source, 'gm');
  const sectionStarts = [...pageText.matchAll(sectionHeaderRegex)].map(match => match.index);
  const firstSectionStart = sectionStarts[0];
  if (firstSectionStart === undefined) {
    return pageText;
  }

  let newText = pageText.slice(0, firstSectionStart);
  for (const [i, sectionStart] of sectionStarts.entries()) {
    const sectionEnd = sectionStarts[i + 1] ?? pageText.length;
    newText += addAdminSectionNote(note, pageText.slice(sectionStart, sectionEnd));
  }
  return newText;
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
    const backlinks = (await spiHelperGetSPIBacklinks(currentPageToCheck))
      .filter(backlink => backlink.title !== newContext.pageName);
    const backlinkTexts = await spiHelperGetBulkPageText(backlinks.map(({ title }) => title));
    for (const backlink of backlinks) {
      const archiveNotice = spiHelperParseArchiveNoticeText(backlinkTexts.get(backlink.title) ?? '');
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
  // Note where each section was originally filed. This runs before the target's own
  // sections are appended below, since those were never filed under the old name.
  newPageText = addNoteToCaseSections(preMergeText
    ? `* {{cnmerged}} from [[${oldContext.pageName}]]. ~~~~`
    : `* {{clerknote}} originally filed under [[${oldContext.pageName}]]. ~~~~`, newPageText);
  // Merge in our old cases. The target's preamble is merged into the moved-in case's
  // preamble rather than tacked onto the end, so only the filing sections get appended.
  if (preMergeText) {
    const sourceContentStart = getContentStartIndex(preMergeText);
    const destContentStart = getContentStartIndex(newPageText);

    const mergedPreambles = mergePreambles(
      newPageText.slice(0, destContentStart), preMergeText.slice(0, sourceContentStart),
    );
    const sourceCaseContent = preMergeText.slice(sourceContentStart);
    const mergedCaseContent = newPageText.slice(destContentStart) + (sourceCaseContent ? '\n' + sourceCaseContent : '');
    newPageText = mergedPreambles + mergedCaseContent;
  }
  newPageText = newPageText.replace(
    spiHelperArchiveNoticeRegex, () => newNotice.generateWikitext(),
  );
  // Also remove the new master if they're in the sock list
  newPageText = removeNewMasterFromCases(newPageText, newContext.caseName);

  await newContext.edit({
    newText: newPageText,
    summary: 'Updating new case following page move',
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
  });
}
