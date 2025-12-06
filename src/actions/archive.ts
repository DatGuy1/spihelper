import { SectionEntry } from '../types/spi.ts';
import { type CaseState, refreshSections } from '../state.ts';
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
import { spiHelperSettings } from '../options.ts';

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
    const sectionText = await section.getText();

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
      const postExpandPercent = (await spiHelperGetPostExpandSize(context.pageName, section.id) + await spiHelperGetPostExpandSize(context.archiveName)) / spiHelperGetMaxPostExpandSize();
      if (postExpandPercent >= 1) {
        // We'd overflow the archive, so move it and then archive the current page
        // Find the first empty archive page
        let archiveId = 1;
        while (await spiHelperGetPageText(context.archiveName + '/' + archiveId, false) !== '') {
          archiveId++;
        }
        const newArchiveName = context.archiveName + '/' + archiveId;
        await spiHelperMovePage(context.archiveName, newArchiveName, 'Moving archive to avoid exceeding post expand size limit', false, false);
        await spiHelperEditPage(context.archiveName, '', 'Removing redirect', false, 'nochange');
      }
      // Need an await here - if we have multiple sections archiving we don't want to stomp on each other
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
  let sectionText = await section.getText();
  sectionText = sectionText.replace(spiHelperCaseStatusRegex, '');
  const newArchiveText = sectionText.substring(sectionText.search(spiHelperSectionRegex));
  let archiveText = await spiHelperGetPageText(context.archiveName, true);

  const $statusLine = $('<li>');
  // Edit conflict check
  if (archiveText.includes(sectionText)) {
    $statusLine.appendTo($('#spiHelper_status', document));
    $statusLine.addClass('spihelper-errortext').append('b').text('Looks like the page has been archived already');
    return;
  }

  // Update the archive
  if (!archiveText) {
    archiveText = '__TOC__\n{{SPI archive notice|1=' + context.caseName + '}}\n{{SPIpriorcases}}';
  }
  else {
    archiveText = archiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}'); // fmt fix whenever needed.
  }
  archiveText += '\n' + newArchiveText;
  const archiveSuccess = await spiHelperEditPage(
    context.archiveName, archiveText,
    'Archiving case section from [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]',
    false, spiHelperSettings.watchArchive, spiHelperSettings.watchArchiveExpiry,
  );

  if (!archiveSuccess) {
    $statusLine.appendTo($('#spiHelper_status', document));
    $statusLine.addClass('spihelper-errortext').append('b').text('Failed to update archive, not removing section from case page');
    return;
  }

  // Blank the section we archived
  await context.edit({ newText: '', summary: 'Archiving case section to [[' + spiHelperGetInterwikiPrefix() + context.archiveName + ']]', watch: spiHelperSettings.watchCase, watchExpiry: spiHelperSettings.watchCaseExpiry, baseRevId: context.startingRevId, sectionId: section.id });
  // Update to the latest revision ID
  context.startingRevId = await spiHelperGetPageRev(context.pageName);
}
