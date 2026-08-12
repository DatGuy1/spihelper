import { describe, expect, test } from 'bun:test';
import {
  type EditSummaryFacts,
  buildEditSummaryActions,
  formatEditSummary,
  setupEditSummaryFacts,
} from '../src/editSummary.ts';

describe('buildEditSummaryActions', () => {
  function buildFor(facts: Partial<EditSummaryFacts>) {
    return buildEditSummaryActions({ ...setupEditSummaryFacts(false), ...facts });
  }

  test('falls back to a default when nothing happened', () => {
    expect(buildFor({})).toEqual(['saving page']);
  });

  test('puts the status change last, after the work it is a verdict on', () => {
    expect(buildFor({
      status: 'closing case',
      commentedCount: 1,
      blockedUsers: ['SockA', 'SockB'],
      taggedUsers: ['SockA', 'SockB'],
      lockedUsers: ['SockA'],
    })).toEqual([
      'commenting',
      'blocking and tagging 2 accounts',
      'requesting lock',
      'closing case',
    ]);
  });

  describe('grouping user actions by account', () => {
    test('merges actions that landed on exactly the same accounts', () => {
      expect(buildFor({
        blockedUsers: ['SockA', 'SockB'],
        taggedUsers: ['SockB', 'SockA'],
        lockedUsers: ['SockA', 'SockB'],
      })).toEqual(['blocking, tagging, and requesting locks for 2 accounts']);
    });

    test('keeps actions apart when the counts match but the accounts do not', () => {
      // A row can be tagged without being blocked and vice versa, so equal counts are
      // no evidence the same accounts were involved
      expect(buildFor({ blockedUsers: ['SockA'], taggedUsers: ['SockB'] }))
        .toEqual(['blocking account', 'tagging account']);
    });

    test('merges the pair that matches and leaves the odd one out alone', () => {
      expect(buildFor({
        blockedUsers: ['SockA', 'SockB'],
        taggedUsers: ['SockA', 'SockB'],
        lockedUsers: ['SockC'],
      })).toEqual(['blocking and tagging 2 accounts', 'requesting lock']);
    });

    test('says nothing about an action that affected nobody', () => {
      expect(buildFor({ taggedUsers: ['SockA'] })).toEqual(['tagging account']);
    });

    test('drops the count for a lone account, but keeps it once there are several', () => {
      expect(buildFor({ blockedUsers: ['SockA'], taggedUsers: ['SockA'] }))
        .toEqual(['blocking and tagging account']);
      expect(buildFor({ blockedUsers: ['SockA', 'SockB'], taggedUsers: ['SockA', 'SockB'] }))
        .toEqual(['blocking and tagging 2 accounts']);
    });

    test('agrees the requested subject with the number of accounts it merged into', () => {
      expect(buildFor({ blockedUsers: ['SockA'], lockedUsers: ['SockA'] }))
        .toEqual(['blocking and requesting lock for account']);
      expect(buildFor({ blockedUsers: ['SockA', 'SockB'], lockedUsers: ['SockA', 'SockB'] }))
        .toEqual(['blocking and requesting locks for 2 accounts']);
      expect(buildFor({ blockedUsers: ['SockA'], globalBlockedUsers: ['SockA'] }))
        .toEqual(['blocking and requesting global block for account']);
    });

    test('drops the count from a lone request as well', () => {
      expect(buildFor({ lockedUsers: ['SockA'] })).toEqual(['requesting lock']);
      expect(buildFor({ globalBlockedUsers: ['1.2.3.4'] })).toEqual(['requesting global block']);
      // A block and a lock on different accounts stay apart, and neither counts
      expect(buildFor({ blockedUsers: ['SockA'], lockedUsers: ['SockB'] }))
        .toEqual(['blocking account', 'requesting lock']);
    });

    test('counts locks rather than accounts when the lock request stands alone', () => {
      // 'requesting locks for N accounts' only earns its length when it has to share
      // the account tail with the verbs it merged into
      expect(buildFor({ lockedUsers: ['SockA', 'SockB'] })).toEqual(['requesting 2 locks']);
      expect(buildFor({ blockedUsers: ['SockA', 'SockB'], lockedUsers: ['SockA', 'SockB'] }))
        .toEqual(['blocking and requesting locks for 2 accounts']);
    });
  });

  test('names the status for one section but counts them for several', () => {
    expect(buildFor({ status: 'declining checkuser' })).toEqual(['declining checkuser']);
    // Closing is the most conclusive change, so it lands last of all
    expect(buildFor({
      multiSection: true, closedCount: 2, statusChangedCount: 1,
    })).toEqual(['changing status on 1 section', 'closing 2 sections']);
  });

  test('ignores multi-section counts on a single-section edit, and vice versa', () => {
    // Multi-section and single-section are exclusionary. Ensure a stray value
    // on the wrong scope doesn't leak a second status phrase into the summary
    expect(buildFor({ status: 'Closing case', closedCount: 3 })).toEqual(['Closing case']);
    expect(buildFor({ multiSection: true, status: 'Closing case', closedCount: 3 }))
      .toEqual(['closing 3 sections']);
  });

  test('counts sections for a comment only when the edit spans several', () => {
    // A single-section edit is already autocommented with its section name
    expect(buildFor({ commentedCount: 1 })).toEqual(['commenting']);
    expect(buildFor({ multiSection: true, commentedCount: 2 }))
      .toEqual(['commenting on 2 sections']);
  });
});

describe('formatEditSummary', () => {
  test('returns an empty string when there are no actions', () => {
    expect(formatEditSummary([], null)).toBe('');
  });

  test('capitalizes the first action and leaves the rest untouched', () => {
    expect(formatEditSummary(['comment'], null)).toBe('Comment');
    expect(formatEditSummary(['comment', 'tag', 'block'], null)).toBe('Comment, tag, block');
  });

  test('prefixes a section autocomment when a section name is given', () => {
    expect(formatEditSummary(['comment'], '1 January 2026')).toBe(
      '/* 1 January 2026 */ Comment',
    );
  });

  test('does not add a section autocomment when the section name is null', () => {
    expect(formatEditSummary(['comment'], null)).not.toContain('/*');
  });
});
