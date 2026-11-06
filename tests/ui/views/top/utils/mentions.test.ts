import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import type { SearchResult } from '../../../../../src/types';
import { stubApi } from '../../../../fixtures/api.ts';

const mockSearch = mock((_query: string, _limit: number) => Promise.resolve<SearchResult[]>([]));
const mockGetPageRev = mock((_title: string) => Promise.resolve(0));

await stubApi({ spiHelperSearch: mockSearch, spiHelperGetPageRev: mockGetPageRev });

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

// Shaped like a real response to the query for these four users, with made-up names and text
const SEARCH_RESULTS: SearchResult[] = [
  {
    title: SPI + 'Bobby',
    snippet: `both accounts are new. ${match('John')} ${match('Doe')} edits Mary Jane Roebuck, `
      + `and ${match('Jane')} ${match('Roe')} turns up an hour after. Separately, `
      + `${match('Bobby')} looks related`,
  },
  {
    title: SPI + 'Alice',
    snippet: `${match('Carol')} ${match('Smith')} was also reported at `
      + `Wikipedia:Sockpuppet investigations/${match('Bobby')} — worth a look`,
  },
  {
    title: SPI + 'Bobby/Archive',
    snippet: `${match('Bobby')} (talk+ · tag · contribs · deleted contribs · logs`,
  },
  {
    title: SPI + 'SPI/Cases',
    snippet: `User Time (UTC) ${match('Bobby')} Endorsed 2020-01-01 00:00`,
  },
];

beforeEach(() => {
  contextModule.setContext(SPI + 'Alice');
  mockSearch.mockReset().mockResolvedValue([]);
  mockGetPageRev.mockReset().mockResolvedValue(0);
});

afterEach(() => {
  mock.restore();
});

describe('buildMentionQueries', () => {
  const FILTER = String.raw` -insource:/archive notice\|(1=)?Alice[|}]/ prefix:` + SPI;

  // The filter's regex, run here the way CirrusSearch runs it on the wikitext
  function pointerRegex(master: string): RegExp {
    const [query] = buildMentionQueries(['Anyone'], master);
    const source = /-insource:\/(.*)\/ /.exec(query ?? '')?.[1];
    if (source === undefined) {
      throw new Error('No pointer filter in ' + String(query));
    }
    return new RegExp(source);
  }

  test('ORs the usernames as phrases under the SPI prefix', () => {
    expect(buildMentionQueries(new Set(['John Doe', 'Bobby']), 'Alice')).toEqual([
      `"John Doe" OR "Bobby"${FILTER}`,
    ]);
  });

  test('escapes quotes and backslashes inside a phrase', () => {
    expect(buildMentionQueries(new Set(['Say "hi"\\']), 'Alice'))
      .toEqual([`"Say \\"hi\\"\\\\"${FILTER}`]);
  });

  test('splits into as many queries as the length limit needs', () => {
    const usernames = Array.from({ length: 40 }, (_, i) => `Sockpuppet account ${i}`);

    const queries = buildMentionQueries(new Set(usernames), 'Alice');

    expect(queries.length).toBeGreaterThan(1);
    for (const query of queries) {
      expect(query.length).toBeLessThanOrEqual(300);
      expect(query.endsWith(FILTER)).toBe(true);
    }
    const searched = queries.flatMap(query => [...query.matchAll(/"([^"]+)"/g)].map(m => m[1]));
    expect(searched).toEqual(usernames);
  });

  describe('the pointer filter', () => {
    test.each([
      '{{SPIarchive notice|1=Alice}}',
      '{{SPI archive notice|Alice}}',
      '{{SPI archive notice|1=Alice|crosswiki=yes}}',
    ])('matches %p', (wikitext) => {
      expect(pointerRegex('Alice').test(wikitext)).toBe(true);
    });

    test.each([
      'I notice Alice is back',
      '{{SPI archive notice|1=AliceII}}',
      '{{SPI archive notice|1=Bobby}}',
    ])('does not match %p', (wikitext) => {
      expect(pointerRegex('Alice').test(wikitext)).toBe(false);
    });

    test('takes the name\'s regex characters literally', () => {
      const regex = pointerRegex('1.2.3.4 (bot)');

      expect(regex.test('{{SPI archive notice|1=1.2.3.4 (bot)}}')).toBe(true);
      expect(regex.test('{{SPI archive notice|1=1x2x3x4 bot}}')).toBe(false);
    });

    test('matches a space in the name written as an underscore', () => {
      const regex = pointerRegex('Jane Doe');

      expect(regex.test('{{SPIarchive notice|Jane_Doe}}')).toBe(true);
      expect(regex.test('{{SPI archive notice|1=Jane Doe}}')).toBe(true);
    });

    test('escapes a slash so it cannot close the regex', () => {
      expect(buildMentionQueries(['Anyone'], 'A/B')[0]).toContain(String.raw`?A\/B[`);
    });
  });
});

describe('findUserMentions', () => {
  test('maps each user to the pages whose snippet names them', async () => {
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(
      new Set(['John Doe', 'Jane Roe', 'Bobby', 'Carol Smith']),
    );

    const titles = (username: string) => mentions.get(username)?.map(mention => mention.title);
    expect(titles('John Doe')).toEqual([SPI + 'Bobby']);
    expect(titles('Jane Roe')).toEqual([SPI + 'Bobby']);
    expect(titles('Bobby')).toEqual([SPI + 'Bobby', SPI + 'Bobby/Archive']);
  });

  test('leaves out the current case, its archive and the SPI/ listings', async () => {
    contextModule.setContext(SPI + 'Bobby');
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(new Set(['Bobby', 'Carol Smith']));

    expect(mentions.get('Bobby')?.map(mention => mention.title)).toEqual([SPI + 'Alice']);
    expect(mentions.get('Carol Smith')?.map(mention => mention.title)).toEqual([SPI + 'Alice']);
  });

  test('includes other cases\' archives after the open cases, under their case', async () => {
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(new Set(['Bobby']));

    expect(mentions.get('Bobby')?.map(({ title, caseName }) => [title, caseName])).toEqual([
      [SPI + 'Bobby', 'Bobby'],
      [SPI + 'Bobby/Archive', 'Bobby'],
    ]);
  });

  test('asks for one capped page of results per query', async () => {
    await findUserMentions(new Set(['John Doe']));

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch.mock.calls[0]?.[1]).toBe(50);
  });

  test('does not take a case whose name merely starts with this one as its subpage', async () => {
    contextModule.setContext(SPI + 'Bob');
    mockSearch.mockResolvedValue(SEARCH_RESULTS);

    const mentions = await findUserMentions(new Set(['Bobby']));

    expect(mentions.get('Bobby')?.map(mention => mention.title)).toContain(SPI + 'Bobby');
  });

  test('splits the snippet around the mention', async () => {
    mockSearch.mockResolvedValue([{
      title: SPI + 'Other',
      snippet: `Pretty sure ${match('john')}_${match('doe')} is back &amp; editing`,
    }]);

    const mentions = await findUserMentions(new Set(['John Doe']));

    expect(mentions.get('John Doe')?.[0]?.snippets).toEqual([
      { text: 'Pretty sure ', isMatch: false },
      { text: 'john_doe', isMatch: true },
      { text: ' is back & editing', isMatch: false },
    ]);
  });

  test('does not count a username inside a longer word', async () => {
    mockSearch.mockResolvedValue([{
      title: SPI + 'Other',
      snippet: `Edits from Janesville by ${match('John')} ${match('Doe')}`,
    }]);

    const mentions = await findUserMentions(new Set(['Jane', 'John Doe']));

    expect(mentions.has('Jane')).toBe(false);
    expect(mentions.has('John Doe')).toBe(true);
  });

  test('lists a page once for a user even when two searches return it', async () => {
    const usernames = new Set(Array.from({ length: 40 }, (_, i) => `Sockpuppet account ${i}`));
    mockSearch.mockResolvedValue([{ title: SPI + 'Other', snippet: match('Sockpuppet account 0') }]);

    const mentions = await findUserMentions(usernames);

    expect(mockSearch.mock.calls.length).toBeGreaterThan(1);
    expect(mentions.get('Sockpuppet account 0')?.map(mention => mention.title)).toEqual([SPI + 'Other']);
  });

  test('splits a long list over several searches', async () => {
    const usernames = new Set(Array.from({ length: 40 }, (_, i) => `Sockpuppet account ${i}`));

    await findUserMentions(usernames);

    expect(mockSearch.mock.calls.length).toBeGreaterThan(1);
  });

  test('fails rather than reporting no mentions when a search fails', async () => {
    mockSearch.mockRejectedValue(new Error('search down'));

    const error = await findUserMentions(new Set(['John Doe'])).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('search down');
  });

  describe('the master', () => {
    // The current case is Alice, mentioned in an open case and in another's archive
    const MASTER_RESULTS: SearchResult[] = [
      {
        title: SPI + 'Dave',
        snippet: `possibly ${match('Alice')} again, and ${match('Carol')} ${match('Smith')}`,
      },
      {
        title: SPI + 'Bobby/Archive',
        snippet: `${match('Alice')} and ${match('Carol')} ${match('Smith')} share a range`,
      },
    ];
    const titles = (mentions: Map<string, { title: string }[]>, username: string) =>
      mentions.get(username)?.map(mention => mention.title);

    test('of a returning case is left out of other cases\' archives', async () => {
      mockGetPageRev.mockResolvedValue(12345);
      mockSearch.mockResolvedValue(MASTER_RESULTS);

      const mentions = await findUserMentions(new Set(['Alice', 'Carol Smith']));

      expect(mockGetPageRev).toHaveBeenCalledWith(SPI + 'Alice/Archive');
      expect(titles(mentions, 'Alice')).toEqual([SPI + 'Dave']);
      expect(titles(mentions, 'Carol Smith')).toEqual([SPI + 'Dave', SPI + 'Bobby/Archive']);
    });

    test('of a returning case mentioned only in archives is left out entirely', async () => {
      mockGetPageRev.mockResolvedValue(12345);
      mockSearch.mockResolvedValue(MASTER_RESULTS.slice(1));

      const mentions = await findUserMentions(new Set(['Alice']));

      expect(mentions.has('Alice')).toBe(false);
    });

    test('of a new case keeps other cases\' archives', async () => {
      mockSearch.mockResolvedValue(MASTER_RESULTS);

      const mentions = await findUserMentions(new Set(['Alice']));

      expect(titles(mentions, 'Alice')).toEqual([SPI + 'Dave', SPI + 'Bobby/Archive']);
    });

    test('counts as returning without a lookup when viewing the archive', async () => {
      contextModule.setContext(SPI + 'Alice/Archive');
      mockSearch.mockResolvedValue(MASTER_RESULTS);

      const mentions = await findUserMentions(new Set(['Alice']));

      expect(mockGetPageRev).not.toHaveBeenCalled();
      expect(titles(mentions, 'Alice')).toEqual([SPI + 'Dave']);
    });

    test('is not looked up when it is not among the users searched', async () => {
      await findUserMentions(new Set(['Carol Smith']));

      expect(mockGetPageRev).not.toHaveBeenCalled();
    });
  });
});

describe('formatMentionHtml', () => {
  const snippet = [
    { text: 'then ', isMatch: false },
    { text: 'Jane Roe', isMatch: true },
    { text: ' <is> back', isMatch: false },
  ];
  const mention = (title: string) => ({
    title: SPI + title,
    caseName: title.replace(/\/Archive$/, ''),
    snippets: snippet,
  });

  test('names the page when there is only one', () => {
    const html = formatMentionHtml('Jane Roe', [mention('Bobby')]);

    const summary = new DOMParser().parseFromString(html, 'text/html').querySelector('summary');
    expect(summary?.textContent).toBe('Jane Roe is mentioned in Bobby');
    expect(summary?.querySelector('a')?.getAttribute('title')).toBe(SPI + 'Bobby');
  });

  test('counts the pages when there are several', () => {
    const html = formatMentionHtml('Jane Roe', [
      mention('Bobby'),
      mention('Alice'),
    ]);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.querySelector('summary')?.textContent).toBe('Jane Roe is mentioned in 2 SPIs');
    expect(doc.querySelectorAll('li').length).toBe(2);
  });

  test('bolds the mention and escapes the rest of the snippet', () => {
    const html = formatMentionHtml('Jane Roe', [mention('Bobby')]);

    const item = new DOMParser().parseFromString(html, 'text/html').querySelector('li');
    expect(item?.querySelector('b')?.textContent).toBe('Jane Roe');
    expect(item?.textContent).toBe('Bobby: …then Jane Roe <is> back…');
  });

  test('counts a case and its archive as one SPI, listing both pages', () => {
    const html = formatMentionHtml('Jane Roe', [mention('Bobby'), mention('Bobby/Archive')]);

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const summary = doc.querySelector('summary');
    expect(summary?.textContent).toBe('Jane Roe is mentioned in Bobby (2 pages)');
    expect(summary?.querySelector('a')?.getAttribute('title')).toBe(SPI + 'Bobby');
    expect(doc.querySelectorAll('li').length).toBe(2);
  });

  test('counts both the SPIs and the pages when they differ', () => {
    const html = formatMentionHtml('Jane Roe', [
      mention('Bobby'),
      mention('Bobby/Archive'),
      mention('Alice'),
      mention('Alice/Archive'),
    ]);

    const summary = new DOMParser().parseFromString(html, 'text/html').querySelector('summary');
    expect(summary?.textContent).toBe('Jane Roe is mentioned in 2 SPIs (4 pages)');
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

    await showUserMentions(new Set(['John Doe', 'Bobby', 'Nobody']));

    expect(messages.map(message => message.type)).toEqual(['notice', 'notice']);
    expect(messages.every(message => message.isHtml)).toBe(true);
  });

  test('warns instead of rejecting when the search fails', async () => {
    mockSearch.mockRejectedValue(new Error('search down'));
    const consoleError = mock(() => undefined);
    const originalError = console.error;
    console.error = consoleError;

    try {
      await showUserMentions(new Set(['John Doe']));
    }
    finally {
      console.error = originalError;
    }

    expect(messages.map(message => message.type)).toEqual(['warning']);
    expect(consoleError).toHaveBeenCalled();
  });
});
