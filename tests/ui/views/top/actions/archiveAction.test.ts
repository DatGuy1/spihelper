import { describe, expect, test } from 'bun:test';
import type { CaseActions, CaseStatus, CaseStatusChoice, SectionEntry } from '../../../../../src/types';
import type { SectionSelection } from '../../../../../src/state.ts';
import { ArchiveActionComponent } from '../../../../../src/ui/views/top';

interface ArchiveCtx {
  selection: SectionSelection | null;
  statusAction: CaseActions['status'];
  status: CaseStatus;
  skippedSections: { name: string; status: string }[];
}

const computed = ArchiveActionComponent.computed as unknown as {
  status(this: ArchiveCtx): CaseStatus;
  badStatus(this: ArchiveCtx): boolean;
  skippedSections(this: ArchiveCtx): { name: string; status: string }[];
};

function makeCtx(opts: {
  old: CaseStatus;
  new: CaseStatusChoice;
  enabled?: boolean;
  selection?: SectionSelection;
}): ArchiveCtx {
  const section = { id: 1, name: '09 July 2020' } as SectionEntry;
  const statusAction: CaseActions['status'] = {
    enabled: opts.enabled ?? true,
    data: { old: opts.old, new: opts.new, bySection: new Map() },
  };
  const ctx = {
    selection: opts.selection ?? { type: 'single' as const, section },
    statusAction,
  };
  return {
    ...ctx,
    get status() {
      return computed.status.call(this);
    },
    get skippedSections() {
      return computed.skippedSections.call(this);
    },
  };
}

describe('ArchiveActionComponent', () => {
  describe('badStatus', () => {
    test('allows archiving a section that is being closed', () => {
      expect(computed.badStatus.call(makeCtx({ old: 'inprogress', new: 'closed' }))).toBe(false);
    });

    test('allows archiving a section that is already closed', () => {
      expect(computed.badStatus.call(makeCtx({ old: 'closed', new: 'nochange' }))).toBe(false);
    });

    test('blocks archiving when the close is switched off', () => {
      // The status action won't run, so the section stays at inprogress and archiving it
      // would file away a case that was never closed
      expect(computed.badStatus.call(makeCtx({
        old: 'inprogress', new: 'closed', enabled: false,
      }))).toBe(true);
    });

    test('does not block on an all-sections selection', () => {
      expect(computed.badStatus.call(makeCtx({
        old: 'inprogress', new: 'nochange', selection: { type: 'all' },
      }))).toBe(false);
    });
  });

  test('reports the status the section will actually be left at', () => {
    expect(computed.status.call(makeCtx({ old: 'inprogress', new: 'selfendorse' })))
      .toBe('endorse');
    expect(computed.status.call(makeCtx({ old: 'closed', new: 'reopen' }))).toBe('open');
    expect(computed.status.call(makeCtx({ old: 'closed', new: 'reopen', enabled: false })))
      .toBe('closed');
  });
});
