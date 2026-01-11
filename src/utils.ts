import { spiHelperHiddenCharNormRegex, spiHelperSignatureRegex } from './constants/regex.ts';
import type { AbsoluteExpiry, Expiry, NoExpiry, RelativeExpiry } from './types/api.ts';

/**
 * Removes the interwiki prefix from a page title
 *
 * @param title Page name including interwiki prefix
 * @return {string} Just the page name
 */
export function spiHelperStripXWikiPrefix(title: string): string {
  if (title.startsWith('m:') || title.startsWith('meta:')) {
    return title.slice(title.indexOf(':') + 1);
  }
  else {
    return title;
  }
}

/**
 * Get the maximum post-expand size from the wgPageParseReport (it's the same for all pages)
 *
 * @return {number} The max post-expand size in bytes
 */
export function spiHelperGetMaxPostExpandSize(): number {
  return mw.config.get('wgPageParseReport').limitreport.postexpandincludesize.limit;
}

/**
 * Get the inter-wiki prefix for the current wiki
 *
 * @return {string} The inter-wiki prefix
 */
export function spiHelperGetInterwikiPrefix(): string {
  // Mostly copied from https://github.com/Xi-Plus/twinkle-global/blob/master/morebits.js
  // Most of this should be overkill (since most of these wikis don't have checkuser support)
  const temp: string[] = mw.config.get('wgServer').replace(/^(https?)?:?\/\//, '').split('.');
  const wikiLang = temp[0];
  const wikiFamily = temp[1];
  if (wikiLang === undefined || wikiFamily === undefined) {
    return '';
  }

  let iwPrefix;
  switch (wikiFamily) {
    case 'wikimedia':
      switch (wikiLang) {
        case 'commons':
        case 'meta':
        case 'species':
        case 'incubator':
        case 'outreach':
          iwPrefix = wikiLang;
          break;
        default:
          break;
      }
      break;
    case 'mediawiki':
      iwPrefix = 'mw';
      break;
    case 'wikidata':
      switch (wikiLang) {
        case 'test':
          iwPrefix = 'testwikidata';
          break;
        case 'www':
          iwPrefix = 'd';
          break;
        default:
          break;
      }
      break;
    case 'wikipedia':
      switch (wikiLang) {
        case 'test':
          iwPrefix = 'testwiki';
          break;
        case 'test2':
          iwPrefix = 'test2wiki';
          break;
        default:
          iwPrefix = 'w:' + wikiLang;
          break;
      }
      break;
    case 'wiktionary':
      iwPrefix = 'wikt:' + wikiLang;
      break;
    case 'wikiquote':
      iwPrefix = 'q:' + wikiLang;
      break;
    case 'wikibooks':
      iwPrefix = 'b:' + wikiLang;
      break;
    case 'wikinews':
      iwPrefix = 'n:' + wikiLang;
      break;
    case 'wikisource':
      iwPrefix = 's:' + wikiLang;
      break;
    case 'wikiversity':
      iwPrefix = 'v:' + wikiLang;
      break;
    case 'wikivoyage':
      iwPrefix = 'voy:' + wikiLang;
      break;
    default:
      return '';
  }
  return `:${iwPrefix}:`;
}

/**
 * Common username normalization function
 * @param username Username to normalize
 *
 * @return Normalized username
 */
export function spiHelperNormalizeUsername(username: string): string {
  // Get rid of bad hidden characters
  username = username.replace(spiHelperHiddenCharNormRegex, '');
  // Remove leading and trailing spaces
  username = username.trim();
  if (mw.util.isIPAddress(username, true)) {
    // For IP addresses, capitalize them (really only applies to IPv6)
    username = username.toUpperCase();
  }
  else if (username) {
    // For actual usernames, make sure the first letter is capitalized
    // Ensure consistent case conversions with PHP as per https://phabricator.wikimedia.org/T292824
    username = new mw.Title(username).getMainText();
  }
  return username;
}

export function isAbsoluteExpiry(value: string): value is AbsoluteExpiry {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
}

export function isNoExpiry(value: string): value is NoExpiry {
  return mw.util.isInfinity(value);
}

const RELATIVE_UNITS = [
  'second', 'seconds',
  'minute', 'minutes',
  'hour', 'hours',
  'day', 'days',
  'week', 'weeks',
  'month', 'months',
  'year', 'years',
];

const RELATIVE_REGEX = new RegExp(
  `^(\\d+(?:\\.\\d+)?)\\s+(${RELATIVE_UNITS.join('|')})$`, 'i',
);

export function isRelativeExpiry(value: string): value is RelativeExpiry {
  return RELATIVE_REGEX.test(value);
}

export function parseExpiry(value: string): Expiry | null {
  if (isNoExpiry(value)) return value;
  if (isAbsoluteExpiry(value)) return value;
  if (isRelativeExpiry(value)) return value;
  return null;
}

export function isNonRegisteredAccount(username: string) {
  return mw.util.isIPAddress(username, true) || mw.util.isTemporaryUser(username);
}

export function addSignature(text: string): string {
  const withSignature = spiHelperSignatureRegex.test(text);
  return withSignature ? text : text.trimEnd() + ' ~~~~';
}

export function buildTitleLinkHtml(title: string): string {
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(title);
  return $link.prop('outerHTML') as string;
}
