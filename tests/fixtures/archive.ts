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
