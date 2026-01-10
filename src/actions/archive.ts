import { type CaseState, SectionEntry, loadSectionText, refreshSections } from '../state.ts';
import { context } from '../context.ts';
import { spiHelperGetInterwikiPrefix, spiHelperGetMaxPostExpandSize } from '../utils.ts';
import { spiHelperCaseClosedRegex, spiHelperCaseStatusRegex, spiHelperSectionRegex } from '../constants/regex.ts';
import {
  spiHelperEditPage,
  spiHelperGetPageRev,
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
  let i = 0;
  let previousRev = 0;
  while (i < state.sections.length) {
    const section = state.sections[i];
    if (!section) {
      continue;
    }
    const sectionText = await loadSectionText(section);

    const currentRev = await spiHelperGetPageRev(context.pageName);
    if (previousRev === currentRev && currentRev !== 0) {
      // Our previous archive hasn't gone through yet, wait a bit and retry
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Re-grab the case sections list since the page may have updated
      await refreshSections(state);
      continue;
    }
    i++;
    const result = spiHelperCaseStatusRegex.exec(sectionText);
    if (result === null || !result[1]) {
      // Bail out - can't find the case status template in this section
      continue;
    }
    if (spiHelperCaseClosedRegex.test(result[1])) {
      previousRev = await spiHelperGetPageRev(context.pageName);
      // A running concern with the SPI archives is whether they exceed the post-expand
      // include size. Calculate what percent of that size the archive will be if we
      // add the current page to it - if >1, we need to archive the archive
      const postExpandPercent = (
        await spiHelperGetPostExpandSize(context.pageName, section.id)
        + await spiHelperGetPostExpandSize(context.archiveName)
      ) / spiHelperGetMaxPostExpandSize();
      if (postExpandPercent >= 1) {
        // We'd overflow the archive, so move it and then archive the current page
        // Find the first empty archive page
        let archiveId = 1;
        while (await spiHelperGetPageText(context.archiveName + '/' + archiveId, false) !== '') {
          archiveId++;
        }
        const newArchiveName = context.archiveName + '/' + archiveId;
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
      // Need an await here.
      // If we have multiple sections archiving we don't want to stomp on each other
      await spiHelperArchiveCaseSection(section);
      // need to re-fetch caseSections since the section numbering probably just changed,
      // also move back our index to before this iteration
      i--;
      await refreshSections(state);
    }
  }
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
  if (!archiveText) {
    archiveText = '__TOC__\n{{SPI archive notice|1=' + context.caseName + '}}\n{{SPIpriorcases}}\n';
  }
  else {
    archiveText = archiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}'); // fmt fix whenever needed.
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
  context.startingRevId = await spiHelperGetPageRev(context.pageName);
}
