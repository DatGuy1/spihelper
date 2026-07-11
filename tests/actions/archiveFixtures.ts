// Shared test fixtures for archive.test.ts and move.test.ts, which both mock
// spiHelperEditPage and build archive-page wikitext to exercise merge/archive logic.

export interface EditPageOpts { title: string; newText: string }

/**
 * Builds a minimal archive page with a single investigation section, matching the
 * real shape produced by parseArchiveSections/rebuildArchiveText (header templates,
 * a date heading, evidence text, and the trailing comment divider).
 */
export function buildArchiveText(
  opts: { caseName: string; date: string; evidence: string },
): string {
  const { caseName, date, evidence } = opts;
  return [
    '__TOC__',
    `{{SPI archive notice|1=${caseName}}}`,
    '{{SPIpriorcases}}',
    '',
    `===${date}===`,
    evidence,
    '----',
  ].join('\n');
}
