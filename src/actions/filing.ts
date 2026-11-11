import { spiHelperAppendToPage } from '../api.ts';
import { findTemplateSpans, splitTemplateParts } from '../template.ts';
import { spiHelperSettings } from '../options';
import { addSignature } from '../utils.ts';
import type { CaseReport } from '../types';

const REPORT_TEMPLATE = 'subst:SPI report';

/**
 * Build the `{{subst:SPI report}}` call that files a report
 *
 * @throws {Error} If the report has no socks, or the evidence or comment would break out
 *   of its parameter: a bare `|` or an unbalanced `{{`/`}}` outside a link or template
 */
export function buildCaseReportWikitext(report: CaseReport): string {
  const socks = report.socks.map(sock => sock.trim()).filter(sock => sock !== '');
  if (socks.length === 0) {
    throw new Error('Enter at least one account');
  }

  const args: [string, string][] = socks.map((sock, index) => [String(index + 1), sock]);
  args.push(['evidence', report.evidence.trim()]);
  if (report.status !== undefined) {
    args.push(['status', report.status]);
  }
  const adminComment = report.adminComment?.trim();
  // A comment that's only the bullet the box starts with isn't saved
  if (adminComment && adminComment !== '*') {
    args.push(['admincomment', addSignature(adminComment)]);
  }

  const wikitext = `{{${REPORT_TEMPLATE}|${args.map(([key, value]) => `${key}=${value}`).join('|')}}}`;
  assertArgumentsIntact(wikitext, args.length);
  return wikitext;
}

/**
 * File a report on a case, creating the case page if it doesn't exist
 *
 * Takes the built call rather than the report, so a caller can build it before starting
 * anything else and stop there if the report is invalid.
 *
 * @param caseName The case name  without the SPI prefix
 * @param reportWikitext The report, from buildCaseReportWikitext
 * @return The new revision ID, or null if the edit failed (spiHelperAppendToPage reports why)
 */
export async function spiHelperFileCaseReport(
  caseName: string, reportWikitext: string,
): Promise<number | null> {
  return spiHelperAppendToPage({
    title: `Wikipedia:Sockpuppet investigations/${caseName}`,
    // The leading newline keeps the new section's heading off the end of the page's last line
    appendText: '\n' + reportWikitext,
    summary: `Adding new report for [[Special:Contributions/${caseName}|${caseName}]]`,
    watch: spiHelperSettings.watch.case,
    watchExpiry: spiHelperSettings.expiry.case,
  });
}

/**
 * Check the built call splits back into exactly the arguments it was built from, so a
 * stray `|` or `}}` in free text can't silently drop or truncate part of the report.
 * Counting the separators rather than comparing parsed keys matters: evidence containing
 * `|status=x` would overwrite a key that's already there, leaving the key count unchanged.
 */
function assertArgumentsIntact(wikitext: string, argumentCount: number) {
  const span = findTemplateSpans(REPORT_TEMPLATE, wikitext)[0];
  if (span?.text !== wikitext) {
    throw new Error('The report contains an unbalanced "{{" or "}}"');
  }
  // Plus one for the template name
  if (splitTemplateParts(span.text.slice(2, -2)).length !== argumentCount + 1) {
    throw new Error('The report contains a "|" outside a link or template. Write it as {{!}}');
  }
}
