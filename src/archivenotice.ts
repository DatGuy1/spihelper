import { ParsedArchiveNotice } from './types/spi.ts';
import { spiHelperEditPage, spiHelperGetPageText } from './api.ts';
import { spiHelperArchiveNoticeRegex, spiHelperPriorCasesRegex } from './constants/regex.ts';
import { context } from './context.ts';
import { spiHelperSettings } from './options.ts';

/**
 * Parse key features from an archivenotice
 * @param {string} page Page to parse
 *
 * @return {Promise<ParsedArchiveNotice>} Parsed archivenotice
 */
export async function spiHelperParseArchiveNotice(
  page: string,
): Promise<ParsedArchiveNotice | null> {
  const pagetext = await spiHelperGetPageText(page, false);
  const match = spiHelperArchiveNoticeRegex.exec(pagetext);
  if (match === null || !match[1]) {
    console.error('Missing archive notice');
    return null;
  }
  const username = match[1];
  let deny = false;
  let xwiki = false;
  let notalk = false;
  let moot = false;
  if (match[2]) {
    for (const entry of match[2].split('|')) {
      if (!entry) {
        // split in such a way that it's just a pipe
        continue;
      }
      const [key, val] = entry.split('=');
      if (!key || !val) {
        console.error('Malformed archivenotice parameter ' + entry);
        continue;
      }
      if (val.toLowerCase() !== 'yes') {
        // Only care if the value is 'yes'
        continue;
      }
      if (key.toLowerCase() === 'deny') {
        deny = true;
      }
      else if (key.toLowerCase() === 'crosswiki') {
        xwiki = true;
      }
      else if (key.toLowerCase() === 'notalk') {
        notalk = true;
      }
      else if (key.toLowerCase() === 'moot') {
        moot = true;
      }
    }
  }
  return new ParsedArchiveNotice(username, deny, xwiki, notalk, moot);
}

export async function spiHelperAddArchiveNotice($warningText: JQuery<HTMLElement>) {
  $warningText.append($('<b>').text('Can\'t find archivenotice template! Automatically adding the archive notice to the page.'));
  const newArchiveNotice = new ParsedArchiveNotice(context.caseName);
  let pageText = await spiHelperGetPageText(context.pageName, false);
  if (spiHelperPriorCasesRegex.exec(pageText) === null) {
    pageText = '{{SPIpriorcases}}\n' + pageText;
  }
  pageText = newArchiveNotice.generateWikitext() + '\n' + pageText;
  if (pageText.indexOf('__TOC__') === -1) {
    pageText = '<noinclude>__TOC__</noinclude>\n' + pageText;
  }
  await spiHelperEditPage(context.pageName, pageText, 'Adding archive notice', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
}
