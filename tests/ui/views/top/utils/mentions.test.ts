import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import type { SearchResult } from '../../../../../src/types';
import { stubApi } from '../../../../fixtures/api.ts';

const mockSearch = mock((_query: string, _limit: number) => Promise.resolve<SearchResult[]>([]));

await stubApi({ spiHelperSearch: mockSearch });

const {
  buildMentionQueries,
  findUserMentions,
  formatMentionHtml,
  showUserMentions,
} = await import('../../../../../src/ui/views/top/utils/mentions.ts');
const contextModule = await import('../../../../../src/context.ts');
const { messages } = await import('../../../../../src/ui/messages.ts');

const SPI = 'Wikipedia:Sockpuppet investigations/';

function match(text: string): string {
  return `<span class="searchmatch">${text}</span>`;
}

// Trimmed from a real response to the query for these four users
const SEARCH_RESULTS: SearchResult[] = [
  {
    title: SPI + 'BellaEditor',
    snippet: `third cluster are active. ${match('Rick')} ${match('Lay')} edits Elizabeth Lee Hazen, `
      + `then ${match('Lee')} ${match('Hazz')} is created 3 minutes later. Do note however `
      + `${match('BellaEditor')} is almost certainly related`,
  },
  {
    title: SPI + 'AngieWigger',
    snippet: `${match('Fox')} ${match('Boise')} is part of another filing at `
      + `Wikipedia:Sockpuppet investigations/${match('BellaEditor')} — it does seem`,
  },
  {
    title: SPI + 'BellaEditor/Archive',
    snippet: `${match('BellaEditor')} (talk+ · tag · contribs · deleted contribs · logs`,
  },
  {
    title: SPI + 'SPI/Cases',
    snippet: `User Time (UTC) ${match('BellaEditor')} Endorsed 2026-10-18 17:38`,
  },
];

beforeEach(() => {
  contextModule.setContext(SPI + 'AngieWigger');
  mockSearch.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  mock.restore();
});

describe('buildMentionQueries', () => {
  test('ORs the usernames as phrases under the SPI prefix', () => {
    expect(buildMentionQueries(new Set(['Rick Lay', 'BellaEditor']))).toEqual([
      `"Rick Lay" OR "BellaEditor" prefix:${SPI}`,
    ]);
  });

  test('escapes quotes and backslashes inside a phrase', () => {
    expect(buildMentionQueries(new Set(['Say "hi"\\']))).toEqual([`"Say \\"hi\\"\\\\" prefix:${SPI}`]);
  });

  test('splits into as many queries as the length limit needs', () => {
    const usernames = Array.from({ length: 40 }, (_, i) => `Sockpuppet account ${i}`);

    const queries = buildMentionQueries(new Set(usernames));

    expect(queries.length).toBeGreaterThan(1);
    for (const query of queries) {
      expect(query.length).toBeLessThanOrEqual(300);
      expect(query.endsWith(` prefix:${SPI}`)).toBe(true);
    }
    const searched = queries.flatMap(query => [...query.matchAll(/"([^"]+)"/g)].map(m => m[1]));
    expect(searched).toEqual(usernames);
  });
});

describe('findUserMentions', () => {
  test('maps each user to the pages whose snippet names them', async () => {
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(
      new Set(['Rick Lay', 'Lee Hazz', 'BellaEditor', 'Fox Boise']),
    );

    const titles = (username: string) => mentions.get(username)?.map(mention => mention.title);
    expect(titles('Rick Lay')).toEqual([SPI + 'BellaEditor']);
    expect(titles('Lee Hazz')).toEqual([SPI + 'BellaEditor']);
    expect(titles('BellaEditor')).toEqual([SPI + 'BellaEditor', SPI + 'BellaEditor/Archive']);
  });

  test('leaves out the current case, its archive and the SPI/ listings', async () => {
    contextModule.setContext(SPI + 'BellaEditor');
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(new Set(['BellaEditor', 'Fox Boise']));

    expect(mentions.get('BellaEditor')?.map(mention => mention.title)).toEqual([SPI + 'AngieWigger']);
    expect(mentions.get('Fox Boise')?.map(mention => mention.title)).toEqual([SPI + 'AngieWigger']);
  });

  test('includes other cases\' archives after the open cases, under their case', async () => {
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(new Set(['BellaEditor']));

    expect(mentions.get('BellaEditor')?.map(({ title, caseName }) => [title, caseName])).toEqual([
      [SPI + 'BellaEditor', 'BellaEditor'],
      [SPI + 'BellaEditor/Archive', 'BellaEditor'],
    ]);
  });

  test('asks for one capped page of results per query', async () => {
    await findUserMentions(new Set(['Rick Lay']));

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch.mock.calls[0]?.[1]).toBe(50);
  });

  test('does not take a case whose name merely starts with this one as its subpage', async () => {
    contextModule.setContext(SPI + 'Bella');
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(new Set(['BellaEditor']));

    expect(mentions.get('BellaEditor')?.map(mention => mention.title)).toContain(SPI + 'BellaEditor');
  });

  test('splits the snippet around the mention', async () => {
    mockSearch.mockResolvedValue([{
      title: SPI + 'Other',
      snippet: `Pretty sure ${match('rick')}_${match('lay')} is back &amp; editing`,
    }]);

    const mentions = await findUserMentions(new Set(['Rick Lay']));

    expect(mentions.get('Rick Lay')?.[0]?.snippets).toEqual([
      { text: 'Pretty sure ', isMatch: false },
      { text: 'rick_lay', isMatch: true },
      { text: ' is back & editing', isMatch: false },
    ]);
  });

  test('does not count a username inside a longer word', async () => {
    mockSearch.mockResolvedValue([{
      title: SPI + 'Other',
      snippet: `Edits from Leeds by ${match('Rick')} ${match('Lay')}`,
    }]);

    const mentions = await findUserMentions(new Set(['Lee', 'Rick Lay']));

    expect(mentions.has('Lee')).toBe(false);
    expect(mentions.has('Rick Lay')).toBe(true);
  });

  test('splits a long list over several searches', async () => {
    const usernames = new Set(Array.from({ length: 40 }, (_, i) => `Sockpuppet account ${i}`));

    await findUserMentions(usernames);

    expect(mockSearch.mock.calls.length).toBeGreaterThan(1);
  });

  test('fails rather than reporting no mentions when a search fails', async () => {
    mockSearch.mockRejectedValue(new Error('search down'));

    const error = await findUserMentions(new Set(['Rick Lay'])).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('search down');
  });
});

describe('formatMentionHtml', () => {
  const snippet = [
    { text: 'then ', isMatch: false },
    { text: 'Lee Hazz', isMatch: true },
    { text: ' <is> back', isMatch: false },
  ];
  const mention = (title: string) => ({
    title: SPI + title,
    caseName: title.replace(/\/Archive$/, ''),
    snippets: snippet,
  });

  test('names the page when there is only one', () => {
    const html = formatMentionHtml('Lee Hazz', [mention('BellaEditor')]);

    const summary = new DOMParser().parseFromString(html, 'text/html').querySelector('summary');
    expect(summary?.textContent).toBe('Lee Hazz is mentioned in BellaEditor');
    expect(summary?.querySelector('a')?.getAttribute('title')).toBe(SPI + 'BellaEditor');
  });

  test('counts the pages when there are several', () => {
    const html = formatMentionHtml('Lee Hazz', [
      mention('BellaEditor'),
      mention('AngieWigger'),
    ]);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('summary')?.textContent).toBe('Lee Hazz is mentioned in 2 SPIs');
    expect(doc.querySelectorAll('li').length).toBe(2);
  });

  test('bolds the mention and escapes the rest of the snippet', () => {
    const html = formatMentionHtml('Lee Hazz', [mention('BellaEditor')]);

    const item = new DOMParser().parseFromString(html, 'text/html').querySelector('li');
    expect(item?.querySelector('b')?.textContent).toBe('Lee Hazz');
    expect(item?.textContent).toBe('BellaEditor: …then Lee Hazz <is> back…');
  });

  test('counts a case and its archive as one SPI, listing both pages', () => {
    const html = formatMentionHtml('Lee Hazz', [mention('BellaEditor'), mention('BellaEditor/Archive')]);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const summary = doc.querySelector('summary');
    expect(summary?.textContent).toBe('Lee Hazz is mentioned in BellaEditor (2 pages)');
    expect(summary?.querySelector('a')?.getAttribute('title')).toBe(SPI + 'BellaEditor');
    expect(doc.querySelectorAll('li').length).toBe(2);
  });

  test('counts both the SPIs and the pages when they differ', () => {
    const html = formatMentionHtml('Lee Hazz', [
      mention('BellaEditor'),
      mention('BellaEditor/Archive'),
      mention('AngieWigger'),
      mention('AngieWigger/Archive'),
    ]);

    const summary = new DOMParser().parseFromString(html, 'text/html').querySelector('summary');
    expect(summary?.textContent).toBe('Lee Hazz is mentioned in 2 SPIs (4 pages)');
  });

  test('gives a floor past the cap, still listing every page', () => {
    const html = formatMentionHtml('John', [
      ...Array.from({ length: 11 }, (_, i) => mention(`Case ${i}`)),
      mention('Case 0/Archive'),
    ]);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('summary')?.textContent).toBe('John is mentioned in 10+ SPIs (12 pages)');
    expect(doc.querySelectorAll('li').length).toBe(12);
  });
});

describe('showUserMentions', () => {
  test('posts one notice per mentioned user', async () => {
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    await showUserMentions(new Set(['Rick Lay', 'BellaEditor', 'Nobody']));

    expect(messages.map(message => message.type)).toEqual(['notice', 'notice']);
    expect(messages.every(message => message.isHtml)).toBe(true);
  });

  test('warns instead of rejecting when the search fails', async () => {
    mockSearch.mockRejectedValue(new Error('search down'));
    const consoleError = mock(() => undefined);
    const originalError = console.error;
    console.error = consoleError;

    try {
      await showUserMentions(new Set(['Rick Lay']));
    }
    finally {
      console.error = originalError;
    }

    expect(messages.map(message => message.type)).toEqual(['warning']);
    expect(consoleError).toHaveBeenCalled();
  });
});
