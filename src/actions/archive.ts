import { type CaseState, SectionEntry, loadCaseText, loadSectionText } from '../state.ts';
import { context } from '../context.ts';
import {
  parseArchiveSections,
  parseSectionDate,
  rebuildArchiveText,
  spiHelperGetInterwikiPrefix,
  spiHelperGetMaxPostExpandSize,
} from '../utils.ts';
import {
  spiHelperCaseClosedRegex,
  spiHelperCaseStatusRegex,
  spiHelperSectionRegex,
} from '../constants';
import {
  spiHelperEditPage,
  spiHelperGetInvestigationSections,
  spiHelperGetPageText,
  spiHelperGetPostExpandSize,
  spiHelperGetPostExpandSizeFromText,
  spiHelperMovePage,
} from '../api.ts';
import { spiHelperSettings } from '../options';
import { VueMessage } from '../ui/messages.ts';
import type { ArchiveSection } from '../types';

/**
 * Archive all closed sections of a case
 */
export async function spiHelperArchiveCase(state: CaseState): Promise<void> {
  const sectionFetchMessage = new VueMessage({ type: 'notice', content: 'Loading all sections' }).show();
  const pageTextPromise = loadCaseText(state);
  const sectionsToArchive = (await Promise.all(state.sections.map(async (section) => {
    const sectionText = await loadSectionText(section);
    const caseStatus = spiHelperCaseStatusRegex.exec(sectionText);
    if (!caseStatus?.[1]) {
      // No case status template found
      return null;
    }

    // Return the section text if it's closed, or null (which we will filter) if it isn't
    return spiHelperCaseClosedRegex.test(caseStatus[1]) ? section : null;
  }))).filter(section => section !== null);
  let newText = await pageTextPromise;
  sectionFetchMessage.update({ type: 'success', content: 'All sections loaded' });
  if (sectionsToArchive.length === 0) {
    new VueMessage({ type: 'warning', content: 'Nothing to archive' }).show();
    return;
  }

  let newArchiveText = await spiHelperGetPageText(context.archiveName, true);
  const overflowResult = await spiHelperMoveArchiveIfOverflowing(
    context.pageName, context.archiveName,
  );
  if (overflowResult === 'abort') return;
  if (overflowResult === 'moved') newArchiveText = '';
  const archiveExists = newArchiveText !== '';
  // Update the archive
  if (archiveExists) {
    newArchiveText = newArchiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}');
  }
  else {
    newArchiveText = `__TOC__\n{{SPI archive notice|1=${context.caseName}}}\n{{SPIpriorcases}}\n`;
  }

  // Get archive sections list once for efficient insertion
  const archiveSectionEntries = archiveExists
    ? await spiHelperGetInvestigationSections({ pageName: context.archiveName })
    : [];
  const parsedArchiveSections = archiveExists && archiveSectionEntries.length === 0
    ? null
    : parseArchiveSections(newArchiveText, archiveSectionEntries);
  if (!parsedArchiveSections) {
    new VueMessage({ type: 'notice', content: 'Failed to parse existing archive sections, aborting archival' }).show();
    return;
  }

  let sectionsAdded = 0;
  for (const section of sectionsToArchive) {
    // Should be instant
    const sectionText = await loadSectionText(section);
    newText = newText
      .replace(sectionText + '\n', '')
      .replace(sectionText, '');

    const cleanSectionText = sectionText.slice(sectionText.search(spiHelperSectionRegex)).replace(spiHelperCaseStatusRegex, '');
    if (newArchiveText.includes(cleanSectionText)) {
      new VueMessage({ type: 'warning', content: `Section ${section.name} already exists in the archive` }).show();
      continue;
    }
    const parsedDate = parseSectionDate(section.name);
    if (!parsedDate) {
      new VueMessage({
        type: 'error',
        content: `Failed to parse date from section header "${section.name}", aborting archival`,
      }).show();
      return;
    }
    parsedArchiveSections.push({ header: parsedDate, fullText: cleanSectionText });
    sectionsAdded++;
  }
  if (sectionsAdded === 0) {
    new VueMessage({ type: 'warning', content: 'Nothing to archive' }).show();
    return;
  }
  newArchiveText = rebuildArchiveText(newArchiveText, parsedArchiveSections);

  const usePlural = sectionsAdded > 1;
  const summaryPrefix = `Archiving ${sectionsAdded} section${usePlural ? 's' : ''}`;
  const archiveSuccess = await spiHelperEditPage({
    title: context.archiveName,
    newText: newArchiveText,
    summary: `${summaryPrefix} from [[${context.prefixedName}]]`,
    watch: spiHelperSettings.watch.archive,
    watchExpiry: spiHelperSettings.expiry.archive,
  }) !== null;

  if (!archiveSuccess) {
    new VueMessage({ type: 'error', content: 'Failed to update archive, not removing sections from case page' }).show();
    return;
  }

  // Update case page to blank the sections we archived
  await context.edit({
    newText: newText,
    summary: `${summaryPrefix} to [[${spiHelperGetInterwikiPrefix()}${context.archiveName}]]`,
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
    baseRevId: context.startingRevId,
  });
}

/**
 * Archive a specific section of a case
 *
 * @param section The section to archive
 */
export async function spiHelperArchiveCaseSection(section: SectionEntry): Promise<void> {
  let sectionText = await loadSectionText(section);
  sectionText = sectionText.replace(spiHelperCaseStatusRegex, '');
  let archiveText = await spiHelperGetPageText(context.archiveName, true);

  const message = new VueMessage({ type: 'error', content: '' });
  // Edit conflict check
  if (archiveText.includes(sectionText)) {
    message.type = 'warning';
    message.content = 'Looks like the page has been archived already';
    message.show();
    return;
  }

  const archiveExists = archiveText !== '';
  // Update the archive
  if (!archiveExists) {
    archiveText = '__TOC__\n{{SPI archive notice|1=' + context.caseName + '}}\n{{SPIpriorcases}}\n';
  }
  else {
    archiveText = archiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}');
  }
  // Insert section in chronological order, if there's an existing archive to load
  const investigationMessage = archiveExists
    ? new VueMessage({ type: 'notice', content: 'Loading archive sections' }).show()
    : null;
  const archiveSectionEntries = archiveExists
    ? await spiHelperGetInvestigationSections({ pageName: context.archiveName })
    : [];
  const parsedArchiveSections = archiveExists && archiveSectionEntries.length === 0
    ? null
    : parseArchiveSections(archiveText, archiveSectionEntries);
  if (parsedArchiveSections) {
    investigationMessage?.update({ type: 'success', content: 'Archive sections loaded' });
    const sectionDate = parseSectionDate(section.name);
    if (!sectionDate) {
      new VueMessage({ type: 'error', content: `Failed to parse date from section header '${section.name}'` }).show();
      return;
    }
    parsedArchiveSections.push({ header: sectionDate, fullText: sectionText });
  }
  else {
    investigationMessage?.update({
      type: 'error',
      content: 'Failed to parse existing archive sections, aborting archival',
    });
    return;
  }
  archiveText = rebuildArchiveText(archiveText, parsedArchiveSections);

  const archiveSuccess = await spiHelperEditPage({
    title: context.archiveName,
    newText: archiveText,
    summary: `Archiving case section from [[${context.prefixedName}]]`,
    createonly: false,
    watch: spiHelperSettings.watch.archive,
    watchExpiry: spiHelperSettings.expiry.archive,
  }) !== null;

  if (!archiveSuccess) {
    message.content = 'Failed to update archive, not removing section from case page';
    message.show();
    return;
  }

  // Blank the section we archived
  await context.edit({
    newText: '',
    summary: `Archiving case section to [[${spiHelperGetInterwikiPrefix()}${context.archiveName}]]`,
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
    baseRevId: context.startingRevId,
    sectionId: section.id,
  });
}

/**
 * If the combined post-expand size of sourcePage and archiveName would exceed the limit,
 * moves archiveName to the first available numbered sub-archive to make room.
 *
 * @returns 'ok' if no overflow, 'moved' if the archive was relocated, 'abort' if the
 *          sub-archive limit was reached and the caller should stop
 */
export async function spiHelperMoveArchiveIfOverflowing(
  sourcePage: string, archiveName: string,
): Promise<'ok' | 'moved' | 'abort'> {
  const postExpandPercent = (
    await spiHelperGetPostExpandSize(sourcePage)
    + await spiHelperGetPostExpandSize(archiveName)
  ) / spiHelperGetMaxPostExpandSize();
  if (postExpandPercent < 1) {
    return 'ok';
  }
  const subArchiveId = await findFirstEmptySubArchive(archiveName);
  if (subArchiveId === null) {
    return 'abort';
  }
  await spiHelperMovePage({
    sourcePage: archiveName,
    destPage: `${archiveName}/${subArchiveId}`,
    summary: 'Moving archive to avoid exceeding post expand size limit',
    ignoreWarnings: false,
    moveSubpages: false,
  });
  return 'moved';
}

/**
 * Finds the first empty numbered sub-archive page (caseName/1, /2, ...).
 * Returns the slot number, or null if the 30-slot limit is reached.
 */
export async function findFirstEmptySubArchive(archiveName: string): Promise<number | null> {
  let archiveId = 0;
  let slotText = 'sentinel';
  while (slotText !== '') {
    if (archiveId > 30) {
      new VueMessage({
        type: 'error',
        content: 'Reached upper bound on possible archives, something probably went catastrophically wrong.',
      }).show();
      return null;
    }
    slotText = await spiHelperGetPageText(`${archiveName}/${++archiveId}`, false);
  }
  return archiveId;
}

/**
 * Binary-searches for the smallest index into `sections` such that
 * sections[index..] fits within the post-expand size limit.
 * Returns 0 if all sections fit, sections.length if none do.
 */
export async function findArchiveSplitPoint(
  sections: ArchiveSection[],
  archiveText: string,
): Promise<number> {
  const maxSize = spiHelperGetMaxPostExpandSize();
  let lo = 0;
  let hi = sections.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidateText = rebuildArchiveText(archiveText, sections.slice(mid));
    if (await spiHelperGetPostExpandSizeFromText(candidateText) < maxSize) {
      hi = mid;
    }
    else {
      lo = mid + 1;
    }
  }
  return lo;
}
