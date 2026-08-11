import { ParsedArchiveNotice } from './types';
import { spiHelperEditPage, spiHelperGetPageText } from './api.ts';
import { spiHelperPriorCasesRegex } from './constants';
import { context } from './context.ts';
import { spiHelperSettings } from './options';
import { CaseState, loadCaseText } from './state.ts';
import { parseTemplates } from './template.ts';

/**
 * Parse key features from an archivenotice
 * @param opts.page Page to parse
 * @param opts.state State used in case we're fetching the page
 * @return {Promise<ParsedArchiveNotice>} Parsed archivenotice
 */
export async function spiHelperParseArchiveNotice(opts: {
  page: string;
  state?: CaseState;
}): Promise<ParsedArchiveNotice | null> {
  const { page, state } = opts;
  let pageText: string;
  if (page === context.pageName && state) {
    pageText = await loadCaseText(state);
  }
  else {
    pageText = await spiHelperGetPageText(page, false);
  }

  return spiHelperParseArchiveNoticeText(pageText);
}

/**
 * Parse key features from wikitext with an archivenotice
 *
 * @param pageText Wikitext to look for an archivenotice in
 * @return {ParsedArchiveNotice} Parsed archivenotice, or null if there isn't a usable one
 */
export function spiHelperParseArchiveNoticeText(pageText: string): ParsedArchiveNotice | null {
  if (pageText === '') {
    // Page doesn't exist
    return null;
  }

  const templates = parseTemplates(pageText);
  const archiveNoticeTemplate = templates.find(tl => /SPI\s*archive notice/i.exec(tl.name));
  if (!archiveNoticeTemplate) {
    console.error('Missing archive notice');
    return null;
  }
  const username = archiveNoticeTemplate.positional[0] ?? archiveNoticeTemplate.params['1'];
  if (!username) {
    console.error('Invalid archive notice: Username missing');
    return null;
  }
  const flags = { deny: false, crosswiki: false, notalk: false, moot: false };

  for (const [key, val] of Object.entries(archiveNoticeTemplate.params)) {
    if (key === '1') {
      continue;
    }
    if (val !== true) {
      console.warn('Malformed archivenotice parameter', key, '=', val);
      continue;
    }

    if (key in flags) {
      flags[key as keyof typeof flags] = true;
    }
    else {
      console.warn('Unrecognised archivenotice parameter', key, '=', val);
    }
  }

  return new ParsedArchiveNotice({ username: username as string, ...flags });
}

export async function spiHelperAddArchiveNotice(page: string, state: CaseState) {
  let pageText: string;
  if (page === context.pageName) {
    pageText = await loadCaseText(state);
  }
  else {
    pageText = await spiHelperGetPageText(page, false);
  }
  if (spiHelperPriorCasesRegex.exec(pageText) === null) {
    pageText = '{{SPIpriorcases}}\n' + pageText;
  }
  const archiveNotice = state.archiveNotice
    ?? new ParsedArchiveNotice({ username: context.caseName });
  const archiveNoticeText = archiveNotice.generateWikitext();
  const tocMatch = /(<noinclude>)?__TOC__(<\/noinclude>)?/.exec(pageText);
  if (tocMatch) {
    // Insert after existing TOC
    const tocEnd = tocMatch.index + tocMatch[0].length;
    pageText = pageText.slice(0, tocEnd) + '\n' + archiveNoticeText + '\n' + pageText.slice(tocEnd);
  }
  else {
    // Add TOC and archive notice at the top
    pageText = '<noinclude>__TOC__</noinclude>\n' + archiveNoticeText + '\n' + pageText;
  }
  if (page === context.pageName) {
    const newRevId = await context.edit({
      newText: pageText,
      summary: 'Adding archive notice',
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId,
    });
    if (newRevId !== null) {
      context.startingRevId = newRevId;
    }
  }
  else {
    await spiHelperEditPage({
      title: page,
      newText: pageText,
      summary: 'Adding archive notice',
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
    });
  }
}
