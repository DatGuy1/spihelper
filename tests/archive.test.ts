import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { ArchiveSection } from '../src/types';

// Mock api.ts before importing archive.ts so the module under test picks up the stubs.
const mockGetPostExpandSize = mock((_title: string) => Promise.resolve(0));
const mockGetPageText = mock((_title: string, _show: boolean) => Promise.resolve(''));
const mockMovePage = mock(() => Promise.resolve());
const mockGetPostExpandSizeFromText = mock((_text: string) => Promise.resolve(0));

void mock.module('../src/api.ts', () => ({
  spiHelperEditPage: mock(() => Promise.resolve(null)),
  spiHelperGetInvestigationSections: mock(() => Promise.resolve([])),
  spiHelperGetPageText: mockGetPageText,
  spiHelperGetPostExpandSize: mockGetPostExpandSize,
  spiHelperGetPostExpandSizeFromText: mockGetPostExpandSizeFromText,
  spiHelperMovePage: mockMovePage,
}));

const {
  findArchiveSplitPoint,
  spiHelperMoveArchiveIfOverflowing,
} = await import('../src/actions/archive.ts');

beforeEach(() => {
  mockGetPostExpandSize.mockReset();
  mockGetPageText.mockReset();
  mockMovePage.mockReset();
  mockGetPostExpandSizeFromText.mockReset();
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
    mockGetPageText.mockResolvedValue(''); // sub-archive /1 is empty
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
    mockGetPageText
      .mockResolvedValueOnce('content') // /1 occupied
      .mockResolvedValueOnce('content') // /2 occupied
      .mockResolvedValueOnce(''); // /3 empty
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
    mockGetPageText.mockResolvedValue('content'); // every slot occupied
    const result = await spiHelperMoveArchiveIfOverflowing(
      'Wikipedia:Sockpuppet investigations/Foo', 'Wikipedia:Sockpuppet investigations/Foo/Archive',
    );
    expect(result).toBe('abort');
    expect(mockMovePage).not.toHaveBeenCalled();
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
