import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import type { WatchOption } from '../../src/types';
import { stubApi } from '../fixtures/api.ts';

interface AppendToPageOpts {
  title: string; appendText: string; summary: string; watch: WatchOption; watchExpiry?: string;
}
const mockAppendToPage = mock((_opts: AppendToPageOpts) => Promise.resolve<number | null>(null));

await stubApi({
  spiHelperAppendToPage: mockAppendToPage,
});

const { buildCaseReportWikitext, spiHelperFileCaseReport } = await import('../../src/actions/filing.ts');

describe('buildCaseReportWikitext', () => {
  describe('arguments', () => {
    test('names every sock by position and passes the evidence', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice', 'Bob'], evidence: 'Same edits.' }))
        .toBe('{{subst:SPI report|1=Alice|2=Bob|evidence=Same edits.}}');
    });

    test('drops blank socks and trims the rest, renumbering what remains', () => {
      expect(buildCaseReportWikitext({ socks: [' Alice ', '', '  ', 'Bob'], evidence: '' }))
        .toBe('{{subst:SPI report|1=Alice|2=Bob|evidence=}}');
    });

    test('keeps an = in a value inside that value', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'a=b' }))
        .toBe('{{subst:SPI report|1=Alice|evidence=a=b}}');
    });

    test('leaves the status to the template when unset', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x' })).not.toContain('status=');
    });

    test('passes an explicit status', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x', status: 'closed' }))
        .toContain('|status=closed');
    });
  });

  describe('admin comment', () => {
    test('signs an unsigned comment', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x', adminComment: '{{confirmed}}' }))
        .toContain('|admincomment={{confirmed}} ~~~~}}');
    });

    test('leaves a signed comment alone', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x', adminComment: 'Blocked. ~~~~' }))
        .toContain('|admincomment=Blocked. ~~~~}}');
    });

    test('omits a blank comment, so the template does not default the status to close', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x', adminComment: '  ' }))
        .not.toContain('admincomment');
    });

    test('omits a comment that is only the starting bullet', () => {
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x', adminComment: '*  ' }))
        .not.toContain('admincomment');
    });
  });

  describe('validation', () => {
    test('rejects a report with no socks', () => {
      expect(() => buildCaseReportWikitext({ socks: ['', ' '], evidence: 'x' })).toThrow('at least one account');
    });

    test('allows pipes inside links and templates', () => {
      const evidence = 'See [[Special:Diff/1|this edit]] and {{diff|Foo|2|1|that one}}.';
      expect(buildCaseReportWikitext({ socks: ['Alice'], evidence }))
        .toContain(`|evidence=${evidence}}}`);
    });

    test('rejects a bare pipe', () => {
      expect(() => buildCaseReportWikitext({ socks: ['Alice'], evidence: 'a | b' })).toThrow('{{!}}');
    });

    test('rejects a bare pipe that would overwrite an argument already set', () => {
      expect(() => buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x|status=open', status: 'closed' }))
        .toThrow('{{!}}');
    });

    test('rejects a bare pipe in the admin comment', () => {
      expect(() => buildCaseReportWikitext({ socks: ['Alice'], evidence: 'x', adminComment: 'a|1=Bob' }))
        .toThrow('{{!}}');
    });

    test('rejects a stray closing brace pair', () => {
      expect(() => buildCaseReportWikitext({ socks: ['Alice'], evidence: 'oops}} more' })).toThrow('unbalanced');
    });

    test('rejects an unclosed template', () => {
      expect(() => buildCaseReportWikitext({ socks: ['Alice'], evidence: '{{diff|Foo' })).toThrow('unbalanced');
    });

    test('rejects an unclosed link that would swallow the following arguments', () => {
      expect(() => buildCaseReportWikitext({ socks: ['Alice'], evidence: '[[Foo', status: 'closed' }))
        .toThrow('{{!}}');
    });
  });
});

describe('spiHelperFileCaseReport', () => {
  const reportWikitext = '{{subst:SPI report|1=Alice|evidence=x}}';

  beforeEach(() => {
    mockAppendToPage.mockReset().mockResolvedValue(123);
  });

  afterEach(() => {
    mock.restore();
  });

  test('appends the report to the case page on its own line', async () => {
    await spiHelperFileCaseReport('Foo', reportWikitext);

    expect(mockAppendToPage).toHaveBeenCalledTimes(1);
    const opts = mockAppendToPage.mock.calls[0]?.[0];
    expect(opts?.title).toBe('Wikipedia:Sockpuppet investigations/Foo');
    expect(opts?.appendText).toBe(`\n${reportWikitext}`);
  });

  test('returns the new revision ID', async () => {
    expect(await spiHelperFileCaseReport('Foo', reportWikitext)).toBe(123);
  });

  test('returns null when the edit fails', async () => {
    mockAppendToPage.mockResolvedValue(null);

    expect(await spiHelperFileCaseReport('Foo', reportWikitext)).toBeNull();
  });
});
