import { type CaseState, SectionEntry, loadCaseText, loadSectionText, refreshSections } from '../state.ts';
import { context } from '../context.ts';
import { spiHelperGetInterwikiPrefix, spiHelperGetMaxPostExpandSize } from '../utils.ts';
import { spiHelperCaseClosedRegex, spiHelperCaseStatusRegex, spiHelperSectionRegex } from '../constants/regex.ts';
import {
  spiHelperEditPage,
  spiHelperGetPageText,
  spiHelperGetPostExpandSize,
  spiHelperMovePage,
} from '../api.ts';
import { spiHelperSettings } from '../options';
import { VueMessage } from '../ui/messages.ts';

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
  // A running concern with the SPI archives is whether they exceed the post-expand
  // include size. Calculate what percent of that size the archive will be if we
  // add the current page to it - if >1, we need to archive the archive
  const postExpandPercent = (
    await spiHelperGetPostExpandSize(context.pageName)
    + await spiHelperGetPostExpandSize(context.archiveName)
  ) / spiHelperGetMaxPostExpandSize();
  if (postExpandPercent >= 1) {
    // We'd overflow the archive, so move it and then archive the current page
    // Find the first empty archive page
    let archiveId = 0;
    while (newArchiveText !== '') {
      newArchiveText = await spiHelperGetPageText(`${context.archiveName}/${++archiveId}`, true);
    }
    const newArchiveName = `${context.archiveName}/${archiveId}`;
    await spiHelperMovePage({
      sourcePage: context.archiveName,
      destPage: newArchiveName,
      summary: 'Moving archive to avoid exceeding post expand size limit',
      ignoreWarnings: false,
      moveSubpages: false,
    });
    await spiHelperEditPage({
      title: context.archiveName,
      newText: '',
      summary: 'Removing redirect',
      createonly: false,
      watch: 'nochange',
    });
  }
  // Update the archive
  if (newArchiveText === '') {
    newArchiveText = `__TOC__\n{{SPI archive notice|1=${context.caseName}}}\n{{SPIpriorcases}}\n`;
  }
  else {
    newArchiveText = newArchiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}');
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
    newArchiveText += '\n';
    newArchiveText += cleanSectionText;
    sectionsAdded++;
  }
  if (sectionsAdded === 0) {
    new VueMessage({ type: 'warning', content: 'Nothing to archive' }).show();
    return;
  }

  const usePlural = sectionsAdded > 1;
  const summaryPrefix = `Archiving ${sectionsAdded} section${usePlural ? 's' : ''}`;
  const archiveSuccess = await spiHelperEditPage({
    title: context.archiveName,
    newText: newArchiveText,
    summary: `${summaryPrefix} from [[${context.prefixedName}]]`,
    watch: spiHelperSettings.watch.archive,
    watchExpiry: spiHelperSettings.expiry.archive,
  });

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
  // Update to the latest revision ID
  void context.refreshRevId();
  void refreshSections(state);
}

/**
 * Archive a specific section of a case
 *
 * @param section The section to archive
 */
export async function spiHelperArchiveCaseSection(section: SectionEntry): Promise<void> {
  let sectionText = await loadSectionText(section);
  sectionText = sectionText.replace(spiHelperCaseStatusRegex, '');
  const newArchiveText = sectionText.slice(sectionText.search(spiHelperSectionRegex));
  let archiveText = await spiHelperGetPageText(context.archiveName, true);

  const message = new VueMessage({ type: 'error', content: '' });
  // Edit conflict check
  if (archiveText.includes(sectionText)) {
    message.type = 'warning';
    message.content = 'Looks like the page has been archived already';
    message.show();
    return;
  }

  // Update the archive
  if (archiveText === '') {
    archiveText = '__TOC__\n{{SPI archive notice|1=' + context.caseName + '}}\n{{SPIpriorcases}}\n';
  }
  else {
    archiveText = archiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}');
  }
  archiveText += '\n' + newArchiveText;
  const archiveSuccess = await spiHelperEditPage({
    title: context.archiveName,
    newText: archiveText,
    summary: `Archiving case section from [[${context.prefixedName}]]`,
    createonly: false,
    watch: spiHelperSettings.watch.archive,
    watchExpiry: spiHelperSettings.expiry.archive,
  });

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
  // Update to the latest revision ID
  await context.refreshRevId();
}
