import { afterEach, beforeEach, describe, expect, jest, mock, test } from 'bun:test';
import { type EditPageOpts, stubApi } from '../fixtures/api.ts';

const mockGetPageText = mock((_title: string, _show: boolean) => Promise.resolve(''));
const mockEditPage = mock((_opts: EditPageOpts) => Promise.resolve<number | null>(1));

await stubApi({
  spiHelperGetPageText: mockGetPageText,
  spiHelperEditPage: mockEditPage,
});

const { spiHelperLog } = await import('../../src/actions/log.ts');
const { spiHelperSettings } = await import('../../src/options');
const originalReversed = spiHelperSettings.log.reversed;

async function logOnto(pageText: string): Promise<string> {
  mockGetPageText.mockResolvedValue(pageText);
  await spiHelperLog('* entry');
  return mockEditPage.mock.calls[0]?.[0].newText ?? '';
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-11-11T12:00:00Z'));
  mockGetPageText.mockReset();
  mockEditPage.mockReset().mockResolvedValue(1);
});

afterEach(() => {
  jest.useRealTimers();
  spiHelperSettings.log.reversed = originalReversed;
});

describe('spiHelperLog', () => {
  describe('reversed', () => {
    beforeEach(() => {
      spiHelperSettings.log.reversed = true;
    });

    test('adds a header and the entry to an empty page', async () => {
      expect(await logOnto('')).toBe('== November 2026 ==\n* entry\n');
    });

    test('adds a header after intro text on a page with no headers', async () => {
      expect(await logOnto('Intro\n')).toBe('Intro\n== November 2026 ==\n* entry\n');
    });

    test('adds the entry under a current-month header at the top of the page', async () => {
      expect(await logOnto('== November 2026 ==\n* old'))
        .toBe('== November 2026 ==\n* entry\n* old');
    });

    test('puts a new month above an older one at the top of the page', async () => {
      expect(await logOnto('== October 2026 ==\n* old'))
        .toBe('== November 2026 ==\n* entry\n== October 2026 ==\n* old');
    });

    test('skips a level-3 heading above the first level-2 one', async () => {
      expect(await logOnto('=== Notes ===\n== October 2026 ==\n* old'))
        .toBe('=== Notes ===\n== November 2026 ==\n* entry\n== October 2026 ==\n* old');
    });

    test('skips `==` in intro text', async () => {
      expect(await logOnto('Uses {{foo|a==b|c==d}}\n== November 2026 ==\n* old'))
        .toBe('Uses {{foo|a==b|c==d}}\n== November 2026 ==\n* entry\n* old');
    });

    test('puts the entry below a heading with a trailing comment', async () => {
      expect(await logOnto('== November 2026 == <!-- c -->\n* old'))
        .toBe('== November 2026 == <!-- c -->\n* entry\n* old');
    });
  });

  describe('not reversed', () => {
    beforeEach(() => {
      spiHelperSettings.log.reversed = false;
    });

    test('appends a header and the entry to an empty page', async () => {
      expect(await logOnto('')).toBe('\n== November 2026 ==\n* entry');
    });

    test('appends under an existing current-month header without adding another', async () => {
      expect(await logOnto('== November 2026 ==\n* old'))
        .toBe('== November 2026 ==\n* old\n* entry');
    });
  });
});
