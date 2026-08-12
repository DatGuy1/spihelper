import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type { BlockEntry, BlockRowData } from '../../../../../src/types';
import { expiryToTimestamp, findBlockLeniency } from '../../../../../src/ui/views/top/utils';
import { makeBlockEntry } from '../../../../fixtures/spi.ts';

afterEach(() => {
  mock.restore();
});

const now = new Date('2026-01-01T00:00:00Z');

const makeExisting = (overrides: Partial<BlockEntry> = {}): BlockEntry => (
  makeBlockEntry('Sock', overrides)
);

function makeIntended(overrides: Partial<BlockRowData> = {}): BlockRowData {
  return {
    block: true,
    duration: 'infinity',
    acb: true,
    abao: true,
    ntp: true,
    nem: true,
    tags: [],
    lock: false,
    ...overrides,
  };
}

describe('expiryToTimestamp', () => {
  // Much of this is basically recreating Wikipedia's expiry calculation logic
  test('treats indefinite expiries as Infinity', () => {
    for (const expiry of ['infinite', 'indefinite', 'infinity', 'never']) {
      expect(expiryToTimestamp(expiry, now)).toBe(Infinity);
    }
  });

  test('parses absolute expiries', () => {
    expect(expiryToTimestamp('2026-03-04T05:06:07Z', now))
      .toBe(Date.parse('2026-03-04T05:06:07Z'));
  });

  test('measures fixed-length relative expiries from the given time', () => {
    expect(expiryToTimestamp('36 hours', now)).toBe(now.getTime() + 36 * 60 * 60 * 1000);
    expect(expiryToTimestamp('2 weeks', now)).toBe(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    expect(expiryToTimestamp('1 second', now)).toBe(now.getTime() + 1000);
  });

  test('uses calendar arithmetic for months and years', () => {
    expect(expiryToTimestamp('2 months', now)).toBe(Date.parse('2026-03-01T00:00:00Z'));
    expect(expiryToTimestamp('1 year', now)).toBe(Date.parse('2027-01-01T00:00:00Z'));
  });

  test('handles fractional months', () => {
    const oneAndAHalfMonths = expiryToTimestamp('1.5 months', now);
    expect(oneAndAHalfMonths)
      .toBe(Date.parse('2026-02-01T00:00:00Z') + 0.5 * 30.44 * 24 * 60 * 60 * 1000);
  });

  test('is case insensitive about units', () => {
    expect(expiryToTimestamp('3 DAYS', now)).toBe(expiryToTimestamp('3 days', now));
  });

  test('returns null for unparseable expiries', () => {
    expect(expiryToTimestamp('', now)).toBeNull();
    expect(expiryToTimestamp('soon', now)).toBeNull();
    expect(expiryToTimestamp('2 fortnights', now)).toBeNull();
  });
});

describe('findBlockLeniency', () => {
  test('returns nothing when the new block matches the old one', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting(),
      intended: makeIntended(),
      now,
    })).toEqual([]);
  });

  test('returns nothing when the new block is stricter', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting({
        duration: '2026-02-01T00:00:00Z', acb: false, ntp: false, nem: false,
      }),
      intended: makeIntended(),
      now,
    })).toEqual([]);
  });

  test('flags an earlier expiry', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting({ duration: '2026-02-01T00:00:00Z' }),
      intended: makeIntended({ duration: '1 week' }),
      now,
    })).toEqual(['it expires sooner']);
  });

  test('flags an indefinite block being downgraded to a fixed duration', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting({ duration: 'infinity' }),
      intended: makeIntended({ duration: '1 year' }),
      now,
    })).toEqual(['it expires sooner']);
  });

  test('ignores an unparseable duration on either side', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting({ duration: 'infinity' }),
      intended: makeIntended({ duration: '' }),
      now,
    })).toEqual([]);
  });

  test('flags relaxed block settings', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting(),
      intended: makeIntended({ acb: false, ntp: false, nem: false }),
      now,
    })).toEqual([
      'account creation is re-enabled',
      'talk page access is restored',
      'email access is restored',
    ]);
  });

  test('flags autoblock being turned off for an account', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting({ abao: true }),
      intended: makeIntended({ abao: false }),
      now,
    })).toEqual(['autoblock is disabled']);
  });

  test('flags anon-only being turned on for an IP, not off', () => {
    spyOn(mw.util, 'isIPAddress').mockReturnValue(true);
    expect(findBlockLeniency({
      username: '192.0.2.1',
      existing: makeExisting({ abao: false }),
      intended: makeIntended({ abao: true }),
      now,
    })).toEqual(['it becomes anon-only']);
    expect(findBlockLeniency({
      username: '192.0.2.1',
      existing: makeExisting({ abao: true }),
      intended: makeIntended({ abao: false }),
      now,
    })).toEqual([]);
  });

  test('reports every relaxed setting at once', () => {
    expect(findBlockLeniency({
      username: 'Sock',
      existing: makeExisting(),
      intended: makeIntended({ duration: '1 week', acb: false, abao: false, ntp: false, nem: false }),
      now,
    })).toEqual([
      'it expires sooner',
      'account creation is re-enabled',
      'autoblock is disabled',
      'talk page access is restored',
      'email access is restored',
    ]);
  });
});
