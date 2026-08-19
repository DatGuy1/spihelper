import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { ArchiveSection } from '../../src/types';
import { SectionEntry } from '../../src/state.ts';
import { buildArchiveText } from '../fixtures/archive.ts';
import { type EditPageOpts } from '../fixtures/api.ts';

// Mock api.ts before importing archive.ts so the module under test picks up the stubs.
const mockGetPostExpandSize = mock((_title: string) => Promise.resolve(0));
const mockGetPageText = mock((_title: string, _show: boolean, _sectionId?: number | null) => Promise.resolve(''));
const mockMovePage = mock(() => Promise.resolve());
const mockGetPostExpandSizeFromText = mock((_text: string) => Promise.resolve(0));
const mockEditPage = mock((_opts: EditPageOpts) => Promise.resolve<number | null>(null));
const mockGetInvestigationSections = mock(
  (_opts: { pageName?: string; content?: string }): Promise<SectionEntry[]> => Promise.resolve([]),
);
const mockGetPages = mock(
  (_opts: {
    from: string; namespace: number; limit: number | 'max';
  }): Promise<{ title: string }[] | null> => Promise.resolve([]),
);

void mock.module('../../src/api.ts', () => ({
  spiHelperEditPage: mockEditPage,
  spiHelperGetInvestigationSections: mockGetInvestigationSections,
  spiHelperGetPageText: mockGetPageText,
  spiHelperGetPages: mockGetPages,
  spiHelperGetPostExpandSize: mockGetPostExpandSize,
  spiHelperGetPostExpandSizeFromText: mockGetPostExpandSizeFromText,
  spiHelperMovePage: mockMovePage,
}));

/** The sub-archives of Foo that the allpages listing should report as existing */
const existingSubArchives = (...ids: number[]) => ids.map(id => ({
  title: `Wikipedia:Sockpuppet investigations/Foo/Archive/${id}`,
}));

const {
  findArchiveSplitPoint,
  spiHelperArchiveCase,
  spiHelperArchiveCaseSection,
  spiHelperMoveArchiveIfOverflowing,
} = await import('../../src/actions/archive.ts');
const { messages } = await import('../../src/ui/messages.ts');
const { CaseState } = await import('../../src/state.ts');

// context is a `let` export reassigned by setContext(), so grab it only after calling
// setContext() — destructuring it earlier would capture the pre-init `undefined` snapshot.
const contextModule = await import('../../src/context.ts');
contextModule.setContext('Wikipedia:Sockpuppet investigations/Foo');
const { context } = contextModule;

beforeEach(() => {
  mockGetPostExpandSize.mockReset().mockResolvedValue(0);
  mockGetPageText.mockReset().mockResolvedValue('');
  mockMovePage.mockReset();
  mockGetPostExpandSizeFromText.mockReset().mockResolvedValue(0);
  mockEditPage.mockReset().mockResolvedValue(null);
  mockGetInvestigationSections.mockReset().mockResolvedValue([]);
  mockGetPages.mockReset().mockResolvedValue([]);
});

describe('spiHelperMoveArchiveIfOverflowing', () => {
  test('returns ok when combined size is under the limit', async () => {
    // 500 KB + 500 KB = 1 MB < 2 MiB limit
    mockGetPostExpandSize.mockResolvedValue(500000);
    const result = await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    expect(result).toBe('ok');
    expect(mockMovePage).not.toHaveBeenCalled();
  });

  test('returns moved and calls movePage when first sub-archive slot is empty', async () => {
    // 1.2 MB + 1.2 MB = 2.4 MB > 2 MiB
    mockGetPostExpandSize.mockResolvedValue(1200000);
    mockGetPages.mockResolvedValue([]); // no sub-archives exist yet
    const result = await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    expect(result).toBe('moved');
    expect(mockMovePage).toHaveBeenCalledWith(expect.objectContaining({
      sourcePage: 'Wikipedia:Sockpuppet investigations/Foo/Archive',
      destPage: 'Wikipedia:Sockpuppet investigations/Foo/Archive/1',
    }));
  });

  test('moves to the correct slot when earlier sub-archives are occupied', async () => {
    mockGetPostExpandSize.mockResolvedValue(1200000);
    mockGetPages.mockResolvedValue(existingSubArchives(1, 2));
    const result = await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    expect(result).toBe('moved');
    expect(mockMovePage).toHaveBeenCalledWith(expect.objectContaining({
      destPage: 'Wikipedia:Sockpuppet investigations/Foo/Archive/3',
    }));
  });

  test('returns abort and skips movePage when all 30 sub-archive slots are occupied', async () => {
    mockGetPostExpandSize.mockResolvedValue(1200000);
    const everySlot = Array.from({ length: 30 }, (_, i) => i + 1);
    mockGetPages.mockResolvedValue(existingSubArchives(...everySlot));
    const result = await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    expect(result).toBe('abort');
    expect(mockMovePage).not.toHaveBeenCalled();
  });

  test('aborts rather than picking a slot when the sub-archive listing fails', async () => {
    // A failed listing looks exactly like "no sub-archives exist" unless it is told apart,
    // and the caller writes over whatever is in the slot it is given
    mockGetPostExpandSize.mockResolvedValue(1200000);
    mockGetPages.mockResolvedValue(null);
    const result = await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    expect(result).toBe('abort');
    expect(mockMovePage).not.toHaveBeenCalled();
  });

  test('asks for every subpage, so the listing cannot truncate past an occupied slot', async () => {
    mockGetPostExpandSize.mockResolvedValue(1200000);
    await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    // apprefix is namespace-relative, so it carries no "Wikipedia:"
    expect(mockGetPages).toHaveBeenCalledWith({
      from: 'Sockpuppet investigations/Foo/Archive/', namespace: 4, limit: 'max',
    });
  });
});

describe('findArchiveSplitPoint', () => {
  function makeSection(date: string, text: string): ArchiveSection {
    return { header: new Date(date), fullText: text };
  }

  // maxSize comes from setup.ts stub: postexpandincludesize.limit = 2097152

  test('returns 0 when all sections fit within the limit', async () => {
    mockGetPostExpandSizeFromText.mockResolvedValue(500000); // well under 2 MiB
    const sections = [makeSection('2024-01-01', 'A'), makeSection('2024-02-01', 'B')];
    const result = await findArchiveSplitPoint(sections, '');
    expect(result).toBe(0);
  });

  test('returns sections.length when nothing fits', async () => {
    mockGetPostExpandSizeFromText.mockResolvedValue(3000000); // over 2 MiB
    const sections = [makeSection('2024-01-01', 'A'), makeSection('2024-02-01', 'B')];
    const result = await findArchiveSplitPoint(sections, '');
    expect(result).toBe(sections.length);
  });

  test('finds the correct split point', async () => {
    // slice(0..1) overflow, slice(2..3) fit
    const sections = [
      makeSection('2024-01-01', 'A'),
      makeSection('2024-02-01', 'B'),
      makeSection('2024-03-01', 'C'),
      makeSection('2024-04-01', 'D'),
    ];
    mockGetPostExpandSizeFromText.mockImplementation((_text: string) => {
      const count = sections.filter(s => _text.includes(s.fullText)).length;
      return Promise.resolve(count >= 3 ? 3000000 : 500000);
    });
    const result = await findArchiveSplitPoint(sections, '');
    expect(result).toBe(2);
  });

  test('returns 0 for an empty sections array', async () => {
    const result = await findArchiveSplitPoint([], '');
    expect(result).toBe(0);
    expect(mockGetPostExpandSizeFromText).not.toHaveBeenCalled();
  });

  test('calls GetPostExpandSizeFromText at most log2(n)+1 times', async () => {
    mockGetPostExpandSizeFromText.mockResolvedValue(3000000); // nothing fits = worst-case probes
    const sections = Array.from({ length: 8 }, (_, i) =>
      makeSection(`2024-0${i + 1}-01`, 'X'),
    );
    await findArchiveSplitPoint(sections, '');
    // log2(8) = 3 probes for a balanced binary search
    expect(mockGetPostExpandSizeFromText.mock.calls.length).toBeLessThanOrEqual(3);
  });
});

describe('spiHelperArchiveCaseSection', () => {
  const section = new SectionEntry(1, '09 July 2020');
  const sectionText = '===09 July 2020===\n{{SPI case status|}}\nEvidence about SockA.\n----';
  const existingArchiveText = buildArchiveText({
    caseName: 'Foo', date: '01 January 2019', evidence: 'Existing evidence that must not be lost.',
  });

  function stubPageText(archiveText: string) {
    mockGetPageText.mockImplementation(
      (title: string, _show: boolean, sectionId?: number | null) => {
        if (title === context.archiveName) return Promise.resolve(archiveText);
        if (title === context.pageName && sectionId === section.id) {
          return Promise.resolve(sectionText);
        }
        return Promise.resolve('');
      },
    );
  }

  test('does not overwrite the archive when the section listing fetch fails', async () => {
    stubPageText(existingArchiveText);
    mockGetInvestigationSections.mockResolvedValue([]); // simulated fetch failure
    await spiHelperArchiveCaseSection(section);
    // Must not silently rebuild the archive from a bogus "zero existing sections" read
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('does not show a loading message when creating a brand-new archive', async () => {
    stubPageText('');
    await spiHelperArchiveCaseSection(section);
    expect(messages.some(m => m.content === 'Loading archive sections')).toBe(false);
  });

  test('shows a loading message when merging into an existing archive', async () => {
    stubPageText(existingArchiveText);
    mockGetInvestigationSections.mockResolvedValue([new SectionEntry(0, '01 January 2019')]);
    await spiHelperArchiveCaseSection(section);
    // update() mutates the message in place, so only the final content survives —
    // seeing the "loaded" state at all proves a (non-null) message was shown and updated
    expect(messages.some(m => m.content === 'Archive sections loaded')).toBe(true);
  });

  test('archives successfully into a brand-new archive', async () => {
    stubPageText('');
    await spiHelperArchiveCaseSection(section);
    expect(mockEditPage).toHaveBeenCalledTimes(1);
    const call = mockEditPage.mock.calls[0]?.[0];
    expect(call?.title).toBe(context.archiveName);
    expect(call?.newText).toContain('Evidence about SockA.');
  });
});

describe('spiHelperArchiveCase', () => {
  const section = new SectionEntry(1, '09 July 2020');
  const sectionText = '===09 July 2020===\n{{SPI case status|closed}}\nEvidence about SockA.\n----';
  const existingArchiveText = buildArchiveText({
    caseName: 'Foo', date: '01 January 2019', evidence: 'Existing evidence that must not be lost.',
  });

  function stubPageText() {
    mockGetPageText.mockImplementation((title: string) => {
      if (title === context.archiveName) return Promise.resolve(existingArchiveText);
      if (title === context.pageName) return Promise.resolve(sectionText);
      return Promise.resolve('');
    });
  }

  test('does not overwrite the archive when the section listing fetch fails', async () => {
    stubPageText();
    mockGetInvestigationSections.mockResolvedValue([]); // simulated fetch failure
    const state = new CaseState([section]);
    await spiHelperArchiveCase(state);
    // Must not silently rebuild the archive from a bogus "zero existing sections" read
    expect(mockEditPage).not.toHaveBeenCalled();
  });

  test('archives the closed section into the existing archive', async () => {
    stubPageText();
    mockGetInvestigationSections.mockResolvedValue([new SectionEntry(0, '01 January 2019')]);
    mockEditPage.mockResolvedValue(123); // both the archive-page and case-page edits succeed
    const state = new CaseState([section]);
    const archived = await spiHelperArchiveCase(state);
    expect(archived).toEqual([section]);
    const archiveCall = mockEditPage.mock.calls.find(c => c[0].title === context.archiveName)?.[0];
    expect(archiveCall?.newText).toContain('Existing evidence that must not be lost.');
    expect(archiveCall?.newText).toContain('Evidence about SockA.');
  });

  describe('with an explicit section subset', () => {
    const closedSection = new SectionEntry(1, '09 July 2020');
    const openSection = new SectionEntry(2, '15 August 2020');
    const closedSectionText = '===09 July 2020===\n{{SPI case status|closed}}\nEvidence about SockA.\n----';
    const openSectionText = '===15 August 2020===\n{{SPI case status|open}}\nEvidence about SockB.\n----';

    function stubMixedPageText() {
      mockGetPageText.mockImplementation(
        (title: string, _show: boolean, sectionId?: number | null) => {
          if (title === context.archiveName) return Promise.resolve(existingArchiveText);
          if (title === context.pageName) {
            if (sectionId === closedSection.id) return Promise.resolve(closedSectionText);
            if (sectionId === openSection.id) return Promise.resolve(openSectionText);
            // Whole-page fetch (no sectionId): both sections concatenated
            return Promise.resolve(`${closedSectionText}\n${openSectionText}`);
          }
          return Promise.resolve('');
        },
      );
    }

    test('archives only the closed sections within an explicit subset, skipping non-closed ones', async () => {
      stubMixedPageText();
      mockGetInvestigationSections.mockResolvedValue([new SectionEntry(0, '01 January 2019')]);
      mockEditPage.mockResolvedValue(123); // both the archive-page and case-page edits succeed
      const state = new CaseState([closedSection, openSection]);
      const archived = await spiHelperArchiveCase(state, [closedSection, openSection]);

      expect(archived).toEqual([closedSection]);
      const archiveCall = mockEditPage.mock.calls
        .find(c => c[0].title === context.archiveName)?.[0];
      expect(archiveCall?.newText).toContain('Evidence about SockA.');
      expect(archiveCall?.newText).not.toContain('Evidence about SockB.');
    });

    test('without an explicit subset, a non-closed section is skipped', async () => {
      stubMixedPageText();
      const state = new CaseState([openSection]);
      const archived = await spiHelperArchiveCase(state);
      expect(archived).toEqual([]);
      expect(mockEditPage).not.toHaveBeenCalled();
    });
  });
});
