import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { SectionEntry } from '../../src/state.ts';
import { buildArchiveText } from '../fixtures/archive.ts';
import { type EditPageOpts } from '../fixtures/api.ts';

// Mock api.ts before importing move.ts so both move.ts and the archive.ts it imports from
// (module identity is shared) pick up the stubs.
const mockGetPageText = mock((_title: string, _show: boolean) => Promise.resolve(''));
const mockGetInvestigationSections = mock(
  (_opts: { pageName?: string; content?: string }): Promise<SectionEntry[]> => Promise.resolve([]),
);
const mockEditPage = mock((_opts: EditPageOpts) => Promise.resolve(null));
const mockMovePage = mock((_opts: { sourcePage: string; destPage: string }) => Promise.resolve());
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
  spiHelperMovePage: mockMovePage,
  spiHelperProtectPage: mock(() => Promise.resolve()),
  spiHelperUndeletePage: mock(() => Promise.resolve()),
}));

const {
  addNoteToCaseSections,
  mergeArchives,
  mergePreambles,
  removeNewMasterFromCases,
  spiHelperMoveCase,
} = await import('../../src/actions/move.ts');
const { SpiPageContext, setContext } = await import('../../src/context.ts');
const { ParsedArchiveNotice } = await import('../../src/types/spi.ts');

beforeEach(() => {
  mockGetPageText.mockReset().mockResolvedValue('');
  mockGetInvestigationSections.mockReset().mockResolvedValue([]);
  mockEditPage.mockReset().mockResolvedValue(null);
  mockMovePage.mockReset().mockResolvedValue(undefined);
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

  // Workaround for IDE not parsing multiline strings properly
  function buildSection(date: string, sock: string, comments = '') {
    return [
      `===${date}===`,
      '{{SPI case status|}}',
      '====Suspected sockpuppets====',
      '* {{checkuser|1=' + sock + '}}',
      '',
      `Evidence about ${sock}.`,
      '',
      '====<big>Comments by other users</big>====',
      '====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====',
      comments + '----<!-- All comments go ABOVE this line, please. -->',
    ].join('\n');
  }

  const twoSectionCaseText = [
    '<noinclude>__TOC__</noinclude>',
    '{{SPI archive notice|1=Foo|deny=yes}}',
    '{{SPIpriorcases}}',
    '',
    buildSection('05 May 2024', 'SockA'),
    '',
    buildSection('06 June 2024', 'SockB', '* {{clerknote}} an existing note. ~~~~\n'),
  ].join('\n');

  function stubTargetCase(preMergeText: string, movedText = movedCaseText) {
    mockGetPageText.mockImplementation((title: string, show: boolean) => {
      if (title !== newPage) return Promise.resolve('');
      return Promise.resolve(show ? movedText : preMergeText);
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

  test('keeps $ sequences in the target name out of the destination title', async () => {
    // The target comes from a user-entered field, and $$/$&/$`/$' are String.replace
    // replacement patterns - a mangled title would move the case to the wrong page
    stubTargetCase('');

    await spiHelperMoveCase({
      target: 'Money$$Man',
      suppress: false,
      addNote: false,
      archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
    });

    expect(mockMovePage.mock.calls[0]?.[0].destPage)
      .toBe('Wikipedia:Sockpuppet investigations/Money$$Man');
  });

  describe('clerk section notes', () => {
    const mergedNote = `* {{cnmerged}} from [[${oldPage}]]. ~~~~`;
    const movedNote = `* {{clerknote}} originally filed under [[${oldPage}]]. ~~~~`;

    test('notes every moved-in section with {{cnmerged}} when merging into an existing case', async () => {
      stubTargetCase('<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}',
        twoSectionCaseText);

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText().split(mergedNote)).toHaveLength(3); // once per section
      // The merge wording and not the move one
      expect(newCaseText()).not.toContain('originally filed under');
    });

    test('notes every section as originally filed when the target case does not exist', async () => {
      stubTargetCase('', twoSectionCaseText);

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText().split(movedNote)).toHaveLength(3);
      expect(newCaseText()).not.toContain('{{cnmerged}}');
    });

    test('does not note sections that were already on the target case', async () => {
      const targetOwnSection = buildSection('01 January 2019', 'SockC');
      stubTargetCase(
        `<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}\n\n${targetOwnSection}`,
        twoSectionCaseText,
      );

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      const sockCIndex = newCaseText().indexOf('Evidence about SockC.');
      expect(sockCIndex).toBeGreaterThan(-1);
      expect(newCaseText().slice(sockCIndex)).not.toContain(mergedNote);
    });

    test('adds nothing to a case with no sections', async () => {
      stubTargetCase('');

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText()).not.toContain('originally filed under');
    });
  });

  describe('preamble of the case being merged into', () => {
    test('keeps a protection banner at the top rather than below the sections', async () => {
      stubTargetCase(
        '{{pp-sock|small=yes}}\n<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}',
        twoSectionCaseText,
      );

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText().startsWith('{{pp-sock|small=yes}}\n')).toBe(true);
      expect(newCaseText().trimEnd().endsWith('{{pp-sock|small=yes}}')).toBe(false);
    });

    test('does not duplicate a banner both cases carry', async () => {
      stubTargetCase(
        '{{pp-sock|small=yes}}\n<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}',
        `{{pp-sock|small=yes}}\n${movedCaseText}`,
      );

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText().split('{{pp-sock|small=yes}}')).toHaveLength(2);
    });

    test('carries free text over to the top of the merged case', async () => {
      const note = 'Please only report users whose name starts with Clown.';
      stubTargetCase(
        `<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}\n${note}`,
        twoSectionCaseText,
      );

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText().indexOf(note)).toBeLessThan(newCaseText().indexOf('===05 May 2024==='));
    });

    test('appends the sections of the case being merged into after the moved-in ones', async () => {
      const targetOwnSection = buildSection('01 January 2019', 'SockC');
      stubTargetCase(
        `{{pp-sock|small=yes}}\n<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}\n\n${targetOwnSection}`,
        twoSectionCaseText,
      );

      await spiHelperMoveCase({
        target: 'Bar',
        suppress: false,
        addNote: false,
        archiveNotice: new ParsedArchiveNotice({ username: 'Foo' }),
      });

      expect(newCaseText()).toContain('Evidence about SockC.');
      expect(newCaseText().indexOf('Evidence about SockB.'))
        .toBeLessThan(newCaseText().indexOf('Evidence about SockC.'));
      expect(newCaseText().split('{{SPI archive notice')).toHaveLength(2);
      expect(newCaseText().split('{{SPIpriorcases}}')).toHaveLength(2);
    });
  });
});

describe('removeNewMasterFromCases', () => {
  function buildSockSection(entries: string) {
    return [
      '====Suspected sockpuppets====',
      entries,
      '',
      '====<big>Comments by other users</big>====',
      '====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====',
      '* {{checkuser|1=Bar}} is the master here, per the rename. ~~~~',
      '----<!-- All comments go ABOVE this line, please. -->',
    ].join('\n');
  }

  test('hides the master from a sock list', () => {
    const result = removeNewMasterFromCases(
      buildSockSection('{{sock list|1=Alpha|2=Bar|3=Gamma|tools_link=yes}}'), 'Bar',
    );

    expect(result).toContain('{{sock list|1=Alpha|2=Bar|3=Gamma|tools_link=yes|remove_master=yes}}');
  });

  test('leaves a sock list that does not name the master alone', () => {
    const sockList = '{{sock list|1=Alpha|2=Gamma|tools_link=yes}}';

    expect(removeNewMasterFromCases(buildSockSection(sockList), 'Bar')).toContain(sockList);
  });

  test('does not flag a list twice when moved a second time', () => {
    const page = buildSockSection('{{sock list|1=Alpha|2=Bar|remove_master=yes}}');

    expect(removeNewMasterFromCases(page, 'Bar')).toBe(page);
  });

  test('leaves the list alone when an explicit master names somebody else', () => {
    // remove_master would take Alpha out of the list rather than Bar
    const sockList = '{{sock list|1=Alpha|2=Bar|master=Alpha}}';

    expect(removeNewMasterFromCases(buildSockSection(sockList), 'Bar')).toContain(sockList);
  });

  test('prevents a nested template from corrupting the list', () => {
    const sockList = '{{sock list|1=Alpha|2=Bar|note2=({{clerknote}} original case name)|tools_link=yes}}';
    const result = removeNewMasterFromCases(buildSockSection(sockList), 'Bar');

    expect(result).toContain('|note2=({{clerknote}} original case name)|tools_link=yes|remove_master=yes}}');
  });

  test('drops the master from the bullet form', () => {
    const result = removeNewMasterFromCases(
      buildSockSection('* {{checkuser|1=Alpha}}\n* {{checkuser|1=Bar}}\n* {{checkuser|1=Gamma}}'),
      'Bar',
    );

    expect(result).toContain('* {{checkuser|1=Alpha}}\n* {{checkuser|1=Gamma}}');
    expect(result).not.toContain('{{checkuser|1=Bar}}\n* {{checkuser|1=Gamma}}');
  });

  test('drops the positional and master name bullet forms too', () => {
    const result = removeNewMasterFromCases(
      buildSockSection('* {{checkuser|Bar|master name=Foo}}\n* {{checkuser|Alpha}}'), 'Bar',
    );

    expect(result).toContain('* {{checkuser|Alpha}}');
    expect(result).not.toContain('master name=Foo');
  });

  test('leaves a checkuser naming the master in the clerk section alone', () => {
    const result = removeNewMasterFromCases(
      buildSockSection('* {{checkuser|1=Alpha}}'), 'Bar',
    );

    expect(result).toContain('* {{checkuser|1=Bar}} is the master here, per the rename.');
  });

  test('handles a case name that would otherwise be a regex metacharacter', () => {
    const page = buildSockSection('{{sock list|1=Alpha|2=Money$$Man (+)|3=Gamma}}');
    const result = removeNewMasterFromCases(page, 'Money$$Man (+)');

    expect(result).toContain('{{sock list|1=Alpha|2=Money$$Man (+)|3=Gamma|remove_master=yes}}');
  });

  test('covers every section of a merged case', () => {
    const page = [
      buildSockSection('{{sock list|1=Alpha|2=Bar}}'),
      buildSockSection('* {{checkuser|1=Bar}}\n* {{checkuser|1=Gamma}}'),
    ].join('\n\n');
    const result = removeNewMasterFromCases(page, 'Bar');

    expect(result).toContain('{{sock list|1=Alpha|2=Bar|remove_master=yes}}');
    expect(result).not.toContain('* {{checkuser|1=Bar}}\n* {{checkuser|1=Gamma}}');
  });
});

describe('mergePreambles', () => {
  const destPreamble = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Bar}}\n{{SPIpriorcases}}\n';

  test('prepends what only the merged-in case had', () => {
    const result = mergePreambles(destPreamble, '{{pp-sock|small=yes}}\n<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Foo}}\n{{SPIpriorcases}}');

    expect(result).toBe(`{{pp-sock|small=yes}}\n${destPreamble}`);
  });

  test('drops the merged-in archive notice so only the regenerated one survives', () => {
    const result = mergePreambles(destPreamble, '{{SPI archive notice|1=Foo|deny=yes}}');

    expect(result).toBe(destPreamble);
  });

  test('keeps free text that is not a template', () => {
    const note = 'Please only report users whose name starts with Clown.';

    expect(mergePreambles(destPreamble, note)).toBe(`${note}\n${destPreamble}`);
  });

  test('leaves the destination preamble alone when there is nothing new', () => {
    expect(mergePreambles(destPreamble, destPreamble)).toBe(destPreamble);
    expect(mergePreambles(destPreamble, '')).toBe(destPreamble);
  });

  test('ignores indentation differences when deduping', () => {
    expect(mergePreambles(destPreamble, '  {{SPIpriorcases}}  ')).toBe(destPreamble);
  });
});

describe('addNoteToCaseSections', () => {
  const note = '* {{clerknote}} a note. ~~~~';

  test('notes each of several sections independently', () => {
    const page = '===01 January 2019===\n----\n\n===02 February 2020===\n----';
    const result = addNoteToCaseSections(note, page);
    expect(result).toBe(
      `===01 January 2019===\n${note}\n----\n\n===02 February 2020===\n${note}\n----`,
    );
  });

  test('leaves the page header untouched', () => {
    const header = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Foo}}\n{{SPIpriorcases}}\n\n';
    const result = addNoteToCaseSections(note, `${header}===01 January 2019===\n----`);
    expect(result.startsWith(header)).toBe(true);
  });

  test('returns the text unchanged when there are no sections', () => {
    const headerOnly = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|1=Foo}}\n----';
    expect(addNoteToCaseSections(note, headerOnly)).toBe(headerOnly);
  });

  test('ignores level-4 subheadings when splitting sections', () => {
    const section = '===01 January 2019===\n====Suspected sockpuppets====\n* {{checkuser|1=SockA}}\n----';
    expect(addNoteToCaseSections(note, section).split(note)).toHaveLength(2);
  });
});
