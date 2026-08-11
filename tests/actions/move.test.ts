import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { SectionEntry } from '../../src/state.ts';
import { type EditPageOpts, buildArchiveText } from './archiveFixtures.ts';

// Mock api.ts before importing move.ts so both move.ts and the archive.ts it imports from
// (module identity is shared) pick up the stubs.
const mockGetPageText = mock((_title: string, _show: boolean) => Promise.resolve(''));
const mockGetInvestigationSections = mock(
  (_opts: { pageName?: string; content?: string }): Promise<SectionEntry[]> => Promise.resolve([]),
);
const mockEditPage = mock((_opts: EditPageOpts) => Promise.resolve(null));
const mockGetPostExpandSizeFromText = mock((_text: string) => Promise.resolve(0));

void mock.module('../../src/api.ts', () => ({
  spiHelperConfigurePendingChanges: mock(() => Promise.resolve()),
  spiHelperDeletePage: mock(() => Promise.resolve()),
  spiHelperEditPage: mockEditPage,
  spiHelperGetInvestigationSections: mockGetInvestigationSections,
  spiHelperGetPageText: mockGetPageText,
  spiHelperGetPostExpandSize: mock(() => Promise.resolve(0)),
  spiHelperGetPostExpandSizeFromText: mockGetPostExpandSizeFromText,
  spiHelperGetProtectionInformation: mock(() => Promise.resolve([])),
  spiHelperGetSPIBacklinks: mock(() => Promise.resolve([])),
  spiHelperGetSiteRestrictionInformation: mock(() => Promise.resolve({ types: [], levels: [] })),
  spiHelperGetStabilisationSettings: mock(() => Promise.resolve(null)),
  spiHelperMovePage: mock(() => Promise.resolve()),
  spiHelperProtectPage: mock(() => Promise.resolve()),
  spiHelperUndeletePage: mock(() => Promise.resolve()),
}));

const { mergeArchives, spiHelperMoveCase } = await import('../../src/actions/move.ts');
const { SpiPageContext, setContext } = await import('../../src/context.ts');
const { ParsedArchiveNotice } = await import('../../src/types/spi.ts');

beforeEach(() => {
  mockGetPageText.mockReset().mockResolvedValue('');
  mockGetInvestigationSections.mockReset().mockResolvedValue([]);
  mockEditPage.mockReset().mockResolvedValue(null);
  mockGetPostExpandSizeFromText.mockReset().mockResolvedValue(0);
});

describe('mergeArchives', () => {
  const oldContext = new SpiPageContext('Wikipedia:Sockpuppet investigations/Foo');
  const newContext = new SpiPageContext('Wikipedia:Sockpuppet investigations/Bar');

  const sourceEntries = [new SectionEntry(0, '09 July 2020')];
  const sourceText = buildArchiveText({
    caseName: 'Foo', date: '09 July 2020', evidence: 'Evidence about SockA.',
  });

  const targetEntries = [new SectionEntry(0, '01 January 2019')];
  const targetText = buildArchiveText({
    caseName: 'Bar', date: '01 January 2019', evidence: 'Evidence about SockB.',
  });

  function stubBothArchives() {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === oldContext.archiveName) return Promise.resolve(sourceText);
      if (title === newContext.archiveName) return Promise.resolve(targetText);
      return Promise.resolve('');
    });
    mockGetInvestigationSections.mockImplementation(({ pageName }: { pageName?: string }) => {
      if (pageName === oldContext.archiveName) return Promise.resolve(sourceEntries);
      if (pageName === newContext.archiveName) return Promise.resolve(targetEntries);
      return Promise.resolve([]);
    });
  }

  test('returns skipped when there is no source archive', async () => {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === newContext.archiveName) return Promise.resolve(targetText);
      return Promise.resolve('');
    });
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('skipped');
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('returns skipped when there is no target archive', async () => {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === oldContext.archiveName) return Promise.resolve(sourceText);
      return Promise.resolve('');
    });
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('skipped');
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('returns skipped without touching the archive when the source section fetch fails', async () => {
    // Both archives have real text, but the source's section listing API call
    // failed and (per api.ts) came back as an empty array rather than throwing.
    mockGetPageText.mockImplementation((title: string) => {
      if (title === oldContext.archiveName) return Promise.resolve(sourceText);
      if (title === newContext.archiveName) return Promise.resolve(targetText);
      return Promise.resolve('');
    });
    mockGetInvestigationSections.mockImplementation(({ pageName }: { pageName?: string }) => {
      if (pageName === newContext.archiveName) return Promise.resolve(targetEntries);
      return Promise.resolve([]); // source lookup "failed"
    });
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('skipped');
    // Must not silently rebuild the target archive from a bogus "zero existing sections" read
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('returns skipped without touching the archive when the target section fetch fails', async () => {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === oldContext.archiveName) return Promise.resolve(sourceText);
      if (title === newContext.archiveName) return Promise.resolve(targetText);
      return Promise.resolve('');
    });
    mockGetInvestigationSections.mockImplementation(({ pageName }: { pageName?: string }) => {
      if (pageName === oldContext.archiveName) return Promise.resolve(sourceEntries);
      return Promise.resolve([]); // target lookup "failed"
    });
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('skipped');
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('merges both archives and returns copied when addNote is false', async () => {
    stubBothArchives();
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('copied');
    expect(mockEditPage).toHaveBeenCalledTimes(1);
    const call = mockEditPage.mock.calls[0]?.[0];
    expect(call?.title).toBe(newContext.archiveName);
    expect(call?.newText).toContain('Evidence about SockA.');
    expect(call?.newText).toContain('Evidence about SockB.');
    expect(call?.newText).not.toContain('clerknote');
  });

  test('adds a clerknote to the merged-in section when addNote is true', async () => {
    stubBothArchives();
    const result = await mergeArchives(oldContext, newContext, true);
    expect(result).toBe('copied');
    const call = mockEditPage.mock.calls[0]?.[0];
    const newText = call?.newText ?? '';
    expect(newText).toContain(
      `{{clerknote}} originally filed under [[${oldContext.pageName}]]`,
    );
    // The note belongs to the merged-in (source) section, not the target's own section
    const noteIndex = newText.indexOf('{{clerknote}} originally filed under');
    const sockAIndex = newText.indexOf('Evidence about SockA.');
    const sockBIndex = newText.indexOf('Evidence about SockB.');
    expect(noteIndex).toBeGreaterThan(sockAIndex);
    expect(newText.slice(sockBIndex, sockBIndex + 50)).not.toContain('clerknote');
  });

  test('returns abort and does not edit anything when the merged archive is too large to split', async () => {
    stubBothArchives();
    mockGetPostExpandSizeFromText.mockResolvedValue(3000000); // over the 2 MiB test limit
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('abort');
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('returns abort when no empty sub-archive slot is available for splitting', async () => {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === oldContext.archiveName) return Promise.resolve(sourceText);
      if (title === newContext.archiveName) return Promise.resolve(targetText);
      return Promise.resolve('occupied'); // every numbered sub-archive slot is taken
    });
    mockGetInvestigationSections.mockImplementation(({ pageName }: { pageName?: string }) => {
      if (pageName === oldContext.archiveName) return Promise.resolve(sourceEntries);
      if (pageName === newContext.archiveName) return Promise.resolve(targetEntries);
      return Promise.resolve([]);
    });
    mockGetPostExpandSizeFromText.mockResolvedValue(3000000);
    const result = await mergeArchives(oldContext, newContext, false);
    expect(result).toBe('abort');
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('splits into a sub-archive and returns copied when a slot is available', async () => {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === oldContext.archiveName) return Promise.resolve(sourceText);
      if (title === newContext.archiveName) return Promise.resolve(targetText);
      if (title === `${newContext.archiveName}/1`) return Promise.resolve(''); // first slot is free
      return Promise.resolve('');
    });
    mockGetInvestigationSections.mockImplementation(({ pageName }: { pageName?: string }) => {
      if (pageName === oldContext.archiveName) return Promise.resolve(sourceEntries);
      if (pageName === newContext.archiveName) return Promise.resolve(targetEntries);
      return Promise.resolve([]);
    });
    // Only oversized while both sections are present together; the newer (source)
    // section alone fits, so the older (target) section is the one split out.
    mockGetPostExpandSizeFromText.mockImplementation((text: string) => {
      const hasBoth = text.includes('SockA') && text.includes('SockB');
      return Promise.resolve(hasBoth ? 3000000 : 500000);
    });
    const result = await mergeArchives(oldContext, newContext, true);
    expect(result).toBe('copied');
    expect(mockEditPage).toHaveBeenCalledTimes(2);
    const subArchiveCall = mockEditPage.mock.calls.find(
      c => c[0].title === `${newContext.archiveName}/1`,
    )?.[0];
    expect(subArchiveCall?.newText).toContain('SockB');
    const mainArchiveCall = mockEditPage.mock.calls.find(
      c => c[0].title === newContext.archiveName,
    )?.[0];
    expect(mainArchiveCall?.newText).toContain('SockA');
  });
});

describe('spiHelperMoveCase', () => {
  const oldPage = 'Wikipedia:Sockpuppet investigations/Foo';
  const newPage = 'Wikipedia:Sockpuppet investigations/Bar';
  // The text the old case carries with it to the new title once the move has happened
  const movedCaseText = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Foo|deny=yes}}\n{{SPIpriorcases}}';

  let originalConfigGet: (key: string) => unknown;
  let originalConfirm: typeof globalThis.confirm;

  beforeEach(() => {
    setContext(oldPage);
    // The merge branch is admin-only and asks for confirmation before histmerging
    originalConfigGet = mw.config.get.bind(mw.config);
    mw.config.get = ((key: string) => (
      key === 'wgUserGroups' ? ['sysop'] : originalConfigGet(key)
    )) as typeof mw.config.get;
    originalConfirm = globalThis.confirm;
    globalThis.confirm = () => true;
  });

  afterEach(() => {
    mw.config.get = originalConfigGet as typeof mw.config.get;
    globalThis.confirm = originalConfirm;
  });

  function stubTargetCase(preMergeText: string) {
    mockGetPageText.mockImplementation((title: string, show: boolean) => {
      if (title !== newPage) return Promise.resolve('');
      return Promise.resolve(show ? movedCaseText : preMergeText);
    });
  }

  function newCaseText(): string {
    return mockEditPage.mock.calls.find(c => c[0].title === newPage)?.[0].newText ?? '';
  }

  test('keeps the archive notice flags of both cases when merging into an existing case', async () => {
    stubTargetCase('<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar|notalk=yes}}\n{{SPIpriorcases}}');

    await spiHelperMoveCase({
      target: 'Bar',
      suppress: false,
      addNote: false,
      archiveNotice: new ParsedArchiveNotice({ username: 'Foo', deny: true }),
    });

    // deny came from the old case, notalk from the case being merged into
    expect(newCaseText()).toContain('{{SPI archive notice|1=Bar|deny=yes|notalk=yes}}');
  });

  test('does not drop a flag that only the case being merged into had set', async () => {
    stubTargetCase('<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar|crosswiki=yes|moot=yes}}\n{{SPIpriorcases}}');

    await spiHelperMoveCase({
      target: 'Bar',
      suppress: false,
      addNote: false,
      archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
    });

    expect(newCaseText()).toContain('{{SPI archive notice|1=Bar|crosswiki=yes|moot=yes}}');
  });

  test('leaves only a redirecting archive notice behind on the old case', async () => {
    stubTargetCase('<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar|notalk=yes}}\n{{SPIpriorcases}}');

    await spiHelperMoveCase({
      target: 'Bar',
      suppress: false,
      addNote: false,
      archiveNotice: new ParsedArchiveNotice({ username: 'Foo', deny: true }),
    });

    const oldCaseEdit = mockEditPage.mock.calls.find(c => c[0].title === oldPage)?.[0];
    expect(oldCaseEdit?.newText).toBe('{{SPI archive notice|1=Bar}}');
  });

  test('carries the old flags over unchanged when the target case does not exist', async () => {
    // Case rename without a merge, no preexisting archive notice to merge into
    stubTargetCase('');

    await spiHelperMoveCase({
      target: 'Bar',
      suppress: false,
      addNote: false,
      archiveNotice: new ParsedArchiveNotice({ username: 'Foo', deny: true, notalk: true }),
    });

    expect(newCaseText()).toContain('{{SPI archive notice|1=Bar|deny=yes|notalk=yes}}');
  });
});
