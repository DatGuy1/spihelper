import { describe, expect, test } from 'bun:test';
import type { CaseStatus, SectionStatusChange } from '../../../../../src/types';
import {
  normalizeCaseStatus,
  resolveEffectiveStatus,
} from '../../../../../src/ui/views/top/utils/status.ts';

describe('normalizeCaseStatus', () => {
  describe('values in Template:SPI case status', () => {
    // See https://en.wikipedia.org/wiki/Template:SPI_case_status/doc
    // Every parameter and alias the template accepts mapped to the status spihelper works in
    const documented: [string, CaseStatus][] = [
      ['new', 'new'],
      ['open', 'open'],
      ['CU', 'CUrequest'], ['checkuser', 'CUrequest'],
      ['CUrequest', 'CUrequest'], ['request', 'CUrequest'],
      ['clerk', 'clerk'],
      ['admin', 'admin'], ['administrator', 'admin'],
      ['decline', 'decline'], ['declined', 'decline'],
      ['CUdecline', 'cudecline'], ['CUdeclined', 'cudecline'],
      ['hold', 'hold'],
      ['cuhold', 'cuhold'],
      ['moreinfo', 'moreinfo'],
      ['cumoreinfo', 'cumoreinfo'],
      ['endorse', 'endorse'], ['endorsed', 'endorse'],
      ['cuendorse', 'cuendorse'], ['cuendorsed', 'cuendorse'],
      ['inprogress', 'inprogress'], ['checking', 'inprogress'],
      ['checked', 'checked'], ['completed', 'checked'],
      ['relist', 'relist'], ['relisted', 'relist'],
      ['close', 'closed'], ['closed', 'closed'],
    ];

    for (const [raw, expected] of documented) {
      test(`maps ${raw} to ${expected}`, () => {
        expect(normalizeCaseStatus(raw)).toBe(expected);
      });
    }

    test('is case-insensitive', () => {
      expect(normalizeCaseStatus('CUDECLINE')).toBe('cudecline');
      expect(normalizeCaseStatus('InProgress')).toBe('inprogress');
    });
  });

  describe('statuses spihelper writes back', () => {
    test('round-trips cudecline', () => {
      expect(normalizeCaseStatus('cudecline')).toBe('cudecline');
    });

    test('round-trips the other statuses the dropdown can write', () => {
      // reopen and selfendorse are rewritten to open/endorse before they reach the page
      const written: CaseStatus[] = ['open', 'CUrequest', 'admin', 'clerk', 'endorse',
        'cuendorse', 'checked', 'inprogress', 'decline', 'moreinfo', 'cumoreinfo', 'relist',
        'hold', 'cuhold', 'closed'];
      for (const status of written) {
        expect(normalizeCaseStatus(status)).toBe(status);
      }
    });
  });

  describe('anything else', () => {
    test('falls back to new', () => {
      expect(normalizeCaseStatus('')).toBe('new');
      expect(normalizeCaseStatus('nonsense')).toBe('new');
    });

    test('does not match a documented value embedded in a longer string', () => {
      expect(normalizeCaseStatus('checkedfoo')).toBe('new');
      expect(normalizeCaseStatus('xxcompleted')).toBe('new');
    });
  });
});

describe('resolveEffectiveStatus', () => {
  const change = (overrides: Partial<SectionStatusChange> = {}): SectionStatusChange => ({
    old: 'inprogress',
    new: 'nochange',
    enabled: true,
    ...overrides,
  });

  test('is the chosen status when the change will be made', () => {
    expect(resolveEffectiveStatus(change({ new: 'closed' }))).toBe('closed');
  });

  test('is the current status when nothing is being changed', () => {
    expect(resolveEffectiveStatus(change({ new: 'nochange' }))).toBe('inprogress');
  });

  test('is the current status when the change is switched off', () => {
    expect(resolveEffectiveStatus(change({ new: 'closed', enabled: false }))).toBe('inprogress');
  });

  describe('pseudo-statuses', () => {
    // spiHelperHandleStatus rewrites these before saving
    test('resolves reopen to open', () => {
      expect(resolveEffectiveStatus(change({ new: 'reopen' }))).toBe('open');
    });

    test('resolves selfendorse to endorse', () => {
      expect(resolveEffectiveStatus(change({ new: 'selfendorse' }))).toBe('endorse');
    });

    test('leaves them alone when the change is switched off', () => {
      expect(resolveEffectiveStatus(change({ new: 'reopen', enabled: false }))).toBe('inprogress');
    });
  });
});
