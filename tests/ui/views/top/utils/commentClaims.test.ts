import { describe, expect, test } from 'bun:test';
import { type SubmissionFacts, findCommentClaims } from '../../../../../src/ui/views/top/utils';

/** Everything the comment could claim is satisfied, so only the claim under test can fire */
function facts(overrides: Partial<SubmissionFacts> = {}): SubmissionFacts {
  return {
    effectiveStatus: 'inprogress',
    blockPlanned: true,
    globalRequestPlanned: true,
    ...overrides,
  };
}

describe('findCommentClaims', () => {
  test('returns nothing when the comment claims nothing', () => {
    expect(findCommentClaims('A comment with no templates', facts())).toEqual([]);
  });

  test('ignores unrelated templates entirely', () => {
    expect(findCommentClaims('{{unrelated}}', facts())).toEqual([]);
  });

  describe('status claims', () => {
    test('flags a closing template when the status is not closed', () => {
      expect(findCommentClaims('* {{btc}} – done here', facts())).toEqual([
        { quoted: '{{btc}}', reason: 'the case status is set to inprogress' },
      ]);
    });

    test('does not flag a closing template when the status is closed', () => {
      expect(findCommentClaims('* {{btc}} – done here', facts({ effectiveStatus: 'closed' })))
        .toEqual([]);
    });

    test('recognizes every closing template, including the {{cwa}} redirect', () => {
      expect(findCommentClaims('{{Action and close}}', facts())[0]?.quoted)
        .toBe('{{Action and close}}');
      expect(findCommentClaims('{{Closing without action}}', facts())[0]?.quoted)
        .toBe('{{Closing without action}}');
      expect(findCommentClaims('{{cwa}}', facts())[0]?.quoted).toBe('{{cwa}}');
    });

    test('does not flag a status template that matches the status being submitted', () => {
      expect(findCommentClaims('* {{Decline}} – not enough evidence', facts({ effectiveStatus: 'decline' })))
        .toEqual([]);
    });

    test('flags a status template that does not match the status being submitted', () => {
      expect(findCommentClaims('* {{Decline}} – not enough evidence', facts({ effectiveStatus: 'endorse' })))
        .toEqual([
          { quoted: '{{Decline}}', reason: 'the case status is set to endorse' },
        ]);
    });

    test('flags a leftover status template when the case is being closed', () => {
      // "closed" has no status template of its own, so any clerk-status template left behind
      // (e.g. from before the clerk decided to close instead) is unfulfilled.
      expect(findCommentClaims('* {{Decline}} – not enough evidence', facts({ effectiveStatus: 'closed' })))
        .toEqual([
          { quoted: '{{Decline}}', reason: 'the case status is set to closed' },
        ]);
    });

    test('resolves aliases (cumoreinfo) to their shared template just like the primary status', () => {
      expect(findCommentClaims('{{moreinfo}}', facts({ effectiveStatus: 'cumoreinfo' }))).toEqual([]);
      expect(findCommentClaims('{{moreinfo}}', facts({ effectiveStatus: 'decline' }))[0]?.quoted)
        .toBe('{{moreinfo}}');
    });

    test('is case-insensitive on the template name, and quotes it back as declared', () => {
      expect(findCommentClaims('{{DECLINE}}', facts({ effectiveStatus: 'decline' }))).toEqual([]);
      expect(findCommentClaims('{{clerk request}}', facts())[0]?.quoted).toBe('{{Clerk Request}}');
    });

    test('falls back to a free-text "closing" match when no closing template is present', () => {
      expect(findCommentClaims('Closing per WP:DUCK', facts())).toEqual([
        {
          quoted: 'the word "Closing"',
          reason: 'the case status is set to inprogress',
        },
      ]);
    });

    test('quotes the free-text match with the same casing', () => {
      expect(findCommentClaims('CLOSING per WP:DUCK', facts())[0]?.quoted)
        .toBe('the word "CLOSING"');
      expect(findCommentClaims('closing per WP:DUCK', facts())[0]?.quoted)
        .toBe('the word "closing"');
    });

    test('does not use the free-text fallback when the status is already closed', () => {
      expect(findCommentClaims('Closing per WP:DUCK', facts({ effectiveStatus: 'closed' })))
        .toEqual([]);
    });

    test('does not match "closing" as a substring of another word', () => {
      expect(findCommentClaims('Disclosing evidence found via CU', facts())).toEqual([]);
    });

    test('prefers a closing template over the free-text fallback', () => {
      // Both signals assert the same claim, so only the stronger one is reported
      expect(findCommentClaims('{{btc}} – closing this out', facts())).toEqual([
        { quoted: '{{btc}}', reason: 'the case status is set to inprogress' },
      ]);
    });

    test('reports a mismatched status template and a free-text close separately', () => {
      // Different claims, so the weaker signal is not suppressed by the stronger one
      expect(findCommentClaims('* {{Decline}} – closing per DUCK', facts({ effectiveStatus: 'endorse' })))
        .toEqual([
          { quoted: 'the word "closing"', reason: 'the case status is set to endorse' },
          { quoted: '{{Decline}}', reason: 'the case status is set to endorse' },
        ]);
    });
  });

  describe('action claims', () => {
    test('flags a block template when no block will be applied', () => {
      expect(findCommentClaims('* {{bnt}} – handled', facts({ blockPlanned: false }))).toEqual([
        { quoted: '{{bnt}}', reason: 'no block is set to be applied' },
      ]);
    });

    test('does not flag a block template when a block will be applied', () => {
      expect(findCommentClaims('* {{bnt}} – handled', facts())).toEqual([]);
    });

    test('flags a lock request template when no global request will be made', () => {
      expect(findCommentClaims('{{GlobalLocksRequested}}', facts({ globalRequestPlanned: false })))
        .toEqual([
          {
            quoted: '{{GlobalLocksRequested}}',
            reason: 'no lock or global block is set to be requested',
          },
        ]);
      expect(findCommentClaims('{{glr}}', facts({ globalRequestPlanned: false }))[0]?.quoted)
        .toBe('{{glr}}');
    });
  });

  describe('templates asserting more than one claim', () => {
    test('reports each unfulfilled half of {{btc}} separately', () => {
      expect(findCommentClaims('* {{btc}} – done here', facts({ blockPlanned: false }))).toEqual([
        { quoted: '{{btc}}', reason: 'the case status is set to inprogress' },
        { quoted: '{{btc}}', reason: 'no block is set to be applied' },
      ]);
    });

    test('reports only the unfulfilled half when the other is satisfied', () => {
      expect(findCommentClaims('* {{btc}} – done here', facts({ effectiveStatus: 'closed', blockPlanned: false })))
        .toEqual([
          { quoted: '{{btc}}', reason: 'no block is set to be applied' },
        ]);
    });
  });
});
