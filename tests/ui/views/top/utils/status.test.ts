import { describe, expect, test } from 'bun:test';
import { findStatusTemplateMismatch } from '../../../../../src/ui/views/top/utils';

describe('findStatusTemplateMismatch', () => {
  test('returns null when the comment has no templates or "closing" text', () => {
    expect(findStatusTemplateMismatch('A comment with no templates', 'inprogress')).toBeNull();
  });

  test('flags a closing template when the status is not closed', () => {
    expect(findStatusTemplateMismatch('* {{btc}} – done here', 'inprogress'))
      .toEqual({ kind: 'template', match: 'btc' });
  });

  test('does not flag a closing template when the status is closed', () => {
    expect(findStatusTemplateMismatch('* {{btc}} – done here', 'closed')).toBeNull();
  });

  test('recognizes all three closing templates', () => {
    expect(findStatusTemplateMismatch('{{Action and close}}', 'inprogress'))
      .toEqual({ kind: 'template', match: 'action and close' });
    expect(findStatusTemplateMismatch('{{Closing without action}}', 'inprogress'))
      .toEqual({ kind: 'template', match: 'closing without action' });
  });

  test('does not flag a status template that matches the status being submitted', () => {
    expect(findStatusTemplateMismatch('* {{Decline}} – not enough evidence', 'decline')).toBeNull();
  });

  test('flags a status template that does not match the status being submitted', () => {
    expect(findStatusTemplateMismatch('* {{Decline}} – not enough evidence', 'endorse'))
      .toEqual({ kind: 'template', match: 'decline' });
  });

  test('flags a leftover status template when the case is being closed', () => {
    // "closed" has no single expected template, so any clerk-status template left behind
    // (e.g. from before the clerk decided to close instead) is a mismatch.
    expect(findStatusTemplateMismatch('* {{Decline}} – not enough evidence', 'closed'))
      .toEqual({ kind: 'template', match: 'decline' });
  });

  test('resolves aliases (cumoreinfo) to their shared template just like the primary status', () => {
    expect(findStatusTemplateMismatch('{{moreinfo}}', 'cumoreinfo')).toBeNull();
    expect(findStatusTemplateMismatch('{{moreinfo}}', 'decline'))
      .toEqual({ kind: 'template', match: 'moreinfo' });
  });

  test('is case-insensitive on the template name', () => {
    expect(findStatusTemplateMismatch('{{DECLINE}}', 'decline')).toBeNull();
  });

  test('ignores unrelated templates entirely', () => {
    expect(findStatusTemplateMismatch('{{unrelated}}', 'inprogress')).toBeNull();
  });

  test('falls back to a free-text "closing" match when no closing template is present', () => {
    expect(findStatusTemplateMismatch('Closing per WP:DUCK', 'inprogress'))
      .toEqual({ kind: 'text', match: 'closing' });
  });

  test('does not use the free-text fallback when the status is already closed', () => {
    expect(findStatusTemplateMismatch('Closing per WP:DUCK', 'closed')).toBeNull();
  });

  test('does not match "closing" as a substring of another word', () => {
    expect(findStatusTemplateMismatch('Disclosing evidence found via CU', 'inprogress')).toBeNull();
  });

  test('prefers a template match over the free-text fallback', () => {
    // {{btc}} is closing-template evidence; the free-text branch should never be reached
    expect(findStatusTemplateMismatch('{{btc}} – closing this out', 'inprogress'))
      .toEqual({ kind: 'template', match: 'btc' });
  });
});
