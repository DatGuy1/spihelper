import {
  spiHelperHiddenCharNormRegex, spiHelperPriorCasesRegex,
  spiHelperSignatureRegex,
} from './constants/regex.ts';
import type { AbsoluteExpiry, Expiry, NoExpiry, RelativeExpiry } from './types/api.ts';
import { SectionEntry } from './state.ts';
import { VueMessage } from './ui/messages.ts';
import type { ArchiveSection } from './types/spi.ts';

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

export function buildTitleLinkHtml(title: string, text?: string): string {
  text ??= title;
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(text);
  return $link.prop('outerHTML') as string;
}

export function buildUserActionLogMessage(opts: {
  blockedUsers: (string | null)[];
  taggedUsers: (string | null)[];
  lockedUsers: (string | null)[];
}): string {
  const { blockedUsers, taggedUsers, lockedUsers } = opts;
  let logMessage = '';
  if (blockedUsers.length > 0) {
    logMessage += '\n** blocked ' + blockedUsers.filter(Boolean).join(', ');
  }
  if (taggedUsers.length > 0) {
    logMessage += '\n** tagged ' + taggedUsers.filter(Boolean).join(', ');
  }
  if (lockedUsers.length > 0) {
    logMessage += '\n** requested locks for ' + lockedUsers.map(user => `{{noping|1=${user}}}`).join(', ');
  }
  return logMessage;
}

/**
 * Find the end of this section (start of next section or end of text)
 */
export function getSectionText(text: string, startIndex = 0, nextSectionTitle?: string): string {
  let endIndex = text.length;
  if (nextSectionTitle) {
    const nextHeaderPattern = new RegExp(`^===\\s*${nextSectionTitle}\\s*===\\s*$`, 'm');
    const nextMatch = text.slice(startIndex + 1).match(nextHeaderPattern);
    if (nextMatch?.index !== undefined) {
      endIndex = startIndex + nextMatch.index;
    }
  }
  return text.slice(startIndex, endIndex).trim();
}

export function rebuildArchiveText(originalText: string, sections: ArchiveSection[]): string {
  // Sort sections by header date
  sections.sort((a, b) => a.header.getTime() - b.header.getTime());
  // Build new text
  const headerText = originalText.slice(0, getContentStartIndex(originalText));
  return headerText + '\n' + sections.map(section => section.fullText).join('\n\n');
}

export function getContentStartIndex(archiveText: string) {
  const headerEndMatch = spiHelperPriorCasesRegex.exec(archiveText);
  if (headerEndMatch) {
    return headerEndMatch.index + headerEndMatch[0].length;
  }
  return 0;
}

export function parseArchiveSections(
  archiveText: string, sectionEntries: SectionEntry[],
): ArchiveSection[] | null {
  const sectionsResult: ArchiveSection[] = [];

  if (sectionEntries.length === 0) {
    return sectionsResult;
  }

  // Find where content starts (after header templates)
  const contentStartIndex = getContentStartIndex(archiveText);
  let contentText = archiveText.slice(contentStartIndex);

  // For each section, find its header in the text and extract everything until the next section
  for (let i = 0; i < sectionEntries.length; i++) {
    const sectionEntry = sectionEntries[i];
    if (!sectionEntry) {
      continue;
    }
    const sectionName = sectionEntry.name;
    // Match the section header (level 3 header with the section name)
    const headerPattern = new RegExp(`^===\\s*${sectionName}\\s*===\\s*$`, 'm');
    const headerMatch = contentText.match(headerPattern);
    if (!headerMatch) {
      continue;
    }

    const sectionStartIndex = headerMatch.index;
    if (sectionStartIndex === undefined) {
      continue;
    }

    const fullText = getSectionText(contentText, sectionStartIndex, sectionEntries[i + 1]?.name);
    if (fullText) {
      const sectionDate = parseSectionDate(sectionName);
      if (sectionDate === null) {
        // I would like to move this out of utils
        new VueMessage({
          type: 'error',
          content: `Failed to parse date from section header "${sectionName}" in archive`,
        }).show();
        return null;
      }
      sectionsResult.push({ header: sectionDate, fullText });
    }
    contentText = contentText.slice(fullText.length);
  }

  return sectionsResult;
}

/**
 * Parse a date from a section header (format: "09 July 2020")
 * Returns a Date object or null if parsing fails
 * Uses JavaScript's built-in Date parsing
 */
export function parseSectionDate(sectionTitle: string): Date | null {
  const parsedDate = new Date(sectionTitle);

  // Check if the date is valid (Date.parse returns NaN for invalid dates)
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  // If all parsing fails, return null
  return null;
}
