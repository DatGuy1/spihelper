import { spiHelperSearch } from '../../../../api.ts';
import { context } from '../../../../context.ts';
import { buildTitleLinkHtml, countOf } from '../../../../utils.ts';
import { VueMessage } from '../../../messages.ts';

const SPI_PREFIX = 'Wikipedia:Sockpuppet investigations/';
const PREFIX_FILTER = ` prefix:${SPI_PREFIX}`;
// CirrusSearch rejects a longer srsearch outright ($wgCirrusSearchMaxFullTextQueryLength)
const MAX_QUERY_LENGTH = 300;
// What CirrusSearch counts as part of a word. A phrase search matches across anything else,
// so "Foo Bar" finds "Foo_Bar" and "foo-bar" alike
const WORD_CHARS = '\\p{L}\\p{M}\\p{N}';
const WORD_REGEX = new RegExp(`[${WORD_CHARS}]+`, 'gu');

export interface SnippetSegment {
  text: string;
  isMatch: boolean;
}

export interface UserMention {
  title: string;
  snippets: SnippetSegment[];
}

/**
 * Split the usernames into OR searches, as few as fit under the length limit
 */
export function buildMentionQueries(usernames: Iterable<string>): string[] {
  const queries: string[] = [];
  let phrases: string[] = [];
  for (const username of usernames) {
    const phrase = `"${username.replace(/[\\"]/g, '\\$&')}"`;
    const candidate = [...phrases, phrase].join(' OR ') + PREFIX_FILTER;
    if (phrases.length > 0 && candidate.length > MAX_QUERY_LENGTH) {
      queries.push(phrases.join(' OR ') + PREFIX_FILTER);
      phrases = [];
    }
    phrases.push(phrase);
  }
  if (phrases.length > 0) {
    queries.push(phrases.join(' OR ') + PREFIX_FILTER);
  }
  return queries;
}

/** Matches the username the way a phrase search would */
function usernamePattern(username: string): RegExp | null {
  const words = username.match(WORD_REGEX);
  if (!words) {
    return null;
  }
  // The words are letters and digits only, so need no escaping
  return new RegExp(
    `(?<![${WORD_CHARS}])${words.join(`[^${WORD_CHARS}]+`)}(?![${WORD_CHARS}])`,
    'giu',
  );
}

/**
 * The snippet's plain text, without CirrusSearch's own highlighting markup
 * DOMParser runs no scripts and loads nothing, so the markup is safe to parse
 */
function snippetText(snippetHtml: string): string {
  const doc = new DOMParser().parseFromString(snippetHtml, 'text/html');
  return doc.body.textContent.replace(/\s+/g, ' ').trim();
}

/** Cut text into runs that do and don't match the pattern, or null if nothing matches */
function splitOnMatches(text: string, pattern: RegExp): SnippetSegment[] | null {
  const segments: SnippetSegment[] = [];
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > end) {
      segments.push({ text: text.slice(end, match.index), isMatch: false });
    }
    segments.push({ text: match[0], isMatch: true });
    end = match.index + match[0].length;
  }
  if (segments.length === 0) {
    return null;
  }
  if (end < text.length) {
    segments.push({ text: text.slice(end), isMatch: false });
  }
  return segments;
}

/**
 * Search the SPI pages for other cases that mention any of the usernames.
 *
 * One OR'd search covers many users, so which of them a page matched is read back off its
 * snippet. CirrusSearch picks the fragment with the most matches, but a page that names two
 * users far apart can show only one, and the other misses that page
 *
 * @param usernames Usernames to search for
 * @returns Each mentioned user's pages, with the snippet split around the mention. Users
 * mentioned nowhere are left out
 * @throws Error If any search fails
 */
export async function findUserMentions(
  usernames: Set<string>,
): Promise<Map<string, UserMention[]>> {
  const patterns = new Map<string, RegExp>();
  for (const username of usernames) {
    const pattern = usernamePattern(username);
    if (pattern) {
      patterns.set(username, pattern);
    }
  }

  // A name with no pattern could never be matched to a result, so isn't worth searching for
  const queries = buildMentionQueries(patterns.keys());
  const resultSets = await Promise.all(queries.map(spiHelperSearch));

  const mentions = new Map<string, UserMention[]>();
  for (const { title, snippet } of resultSets.flat()) {
    if (title === context.casePageName
      || title.startsWith(context.casePageName + '/')
      || title.startsWith(SPI_PREFIX + 'SPI/')
      || /\/Archive(\/|$)/.test(title)) {
      continue;
    }
    const text = snippetText(snippet);
    for (const [username, pattern] of patterns) {
      const segments = splitOnMatches(text, pattern);
      if (!segments) {
        continue;
      }
      const userMentions = mentions.get(username) ?? [];
      userMentions.push({ title, snippets: segments });
      mentions.set(username, userMentions);
    }
  }
  return mentions;
}

export function formatMentionHtml(username: string, mentions: UserMention[]): string {
  const pageLink = (title: string) => buildTitleLinkHtml(title, title.replace(SPI_PREFIX, ''));
  const [onlyMention] = mentions;
  const where = mentions.length === 1 && onlyMention
    ? pageLink(onlyMention.title)
    : countOf(mentions.length, 'SPI');
  const items = mentions.map(({ title, snippets }) => {
    const snippetHtml = snippets
      .map(({ text, isMatch }) => (isMatch ? `<b>${mw.html.escape(text)}</b>` : mw.html.escape(text)))
      .join('');
    return `<li>${pageLink(title)}: …${snippetHtml}…</li>`;
  }).join('');
  return `<details><summary>${mw.html.escape(username)} is mentioned in ${where}</summary>`
    + `<ul>${items}</ul></details>`;
}

/** Post a message for each user another case mentions. Never rejects */
export async function showUserMentions(usernames: Set<string>): Promise<void> {
  let mentions: Map<string, UserMention[]>;
  try {
    mentions = await findUserMentions(usernames);
  }
  catch (error) {
    console.error('Searching for user mentions failed:', error);
    new VueMessage({
      type: 'warning',
      content: 'Could not search other cases for mentions of these accounts',
    }).showOnce();
    return;
  }
  for (const [username, userMentions] of mentions) {
    new VueMessage({
      type: 'notice',
      content: formatMentionHtml(username, userMentions),
      isHtml: true,
    }).showOnce();
  }
}
