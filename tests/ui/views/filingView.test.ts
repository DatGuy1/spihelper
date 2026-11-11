import { describe, expect, mock, test } from 'bun:test';
import type { CaseAction, CaseReport, UserRow } from '../../../src/types';
import {
  FilingViewComponent,
  type ReportDraft,
  draftFromReport,
  getDefaultReportSocks,
  reportFromDraft,
  resumeReportSocks,
} from '../../../src/ui/views/filingView.ts';
import { makeUserRow } from '../../fixtures/spi.ts';

const accounts = [
  makeUserRow('Foo', { block: true }),
  makeUserRow('Alice', { block: true }),
  makeUserRow('Bob'),
];
const noneReported: ReadonlySet<string> = new Set();

function makeDraft(overrides: Partial<ReportDraft> = {}): ReportDraft {
  return {
    socks: ['Alice'],
    evidence: 'Same edits.',
    status: 'nochange',
    commentEnabled: false,
    comment: '* ',
    ...overrides,
  };
}

describe('getDefaultReportSocks', () => {
  test('lists the accounts being blocked, but not the master the case is named after', () => {
    expect(getDefaultReportSocks({ accounts, master: 'Foo', reported: noneReported }))
      .toEqual(['Alice']);
  });

  test('lists nobody when nobody is being blocked', () => {
    expect(getDefaultReportSocks({ accounts: [makeUserRow('Alice')], master: 'Foo', reported: noneReported }))
      .toEqual([]);
  });

  test('leaves out accounts an earlier report already lists, so they are not reported twice', () => {
    expect(getDefaultReportSocks({ accounts, master: 'Foo', reported: new Set(['Alice']) }))
      .toEqual([]);
  });
});

describe('draftFromReport', () => {
  test('starts from the defaults when there is no report yet', () => {
    const report: CaseAction<CaseReport> = { enabled: false, data: { socks: [], evidence: '' } };

    expect(draftFromReport({ report, accounts, master: 'Foo', reported: noneReported })).toEqual(makeDraft({ evidence: '' }));
  });

  test('picks up a saved report, leaving the status its comment forced unchosen', () => {
    const report: CaseAction<CaseReport> = {
      enabled: true,
      data: { socks: ['Bob'], evidence: 'x', status: 'closed', adminComment: 'Blocked.' },
    };

    expect(draftFromReport({ report, accounts, master: 'Foo', reported: noneReported })).toEqual({
      socks: ['Bob'],
      evidence: 'x',
      status: 'nochange',
      commentEnabled: true,
      comment: 'Blocked.',
    });
  });
});

describe('reportFromDraft', () => {
  describe('status', () => {
    test('leaves the status to the template when left at no change', () => {
      expect(reportFromDraft(makeDraft()).status).toBeUndefined();
    });

    test('passes a chosen status', () => {
      expect(reportFromDraft(makeDraft({ status: 'CUrequest' })).status)
        .toBe('CUrequest');
    });

    test('turns the pseudo-statuses into ones the template knows', () => {
      expect(reportFromDraft(makeDraft({ status: 'reopen' })).status).toBe('open');
      expect(reportFromDraft(makeDraft({ status: 'selfendorse' })).status)
        .toBe('endorse');
    });
  });

  describe('comment', () => {
    test('passes a written comment and closes the report, whatever status was chosen', () => {
      const report = reportFromDraft(makeDraft({
        commentEnabled: true, comment: '* Blocked.', status: 'CUrequest',
      }));

      expect(report.adminComment).toBe('* Blocked.');
      expect(report.status).toBe('closed');
    });

    test('drops a comment that is switched off, and its closing with it', () => {
      const report = reportFromDraft(makeDraft({ comment: '* Blocked.', status: 'CUrequest' }));

      expect(report.adminComment).toBeUndefined();
      expect(report.status).toBe('CUrequest');
    });

    test('closes on the switch alone, keeping a blank comment so editing finds the switch on', () => {
      const report: CaseAction<CaseReport> = {
        enabled: true,
        data: reportFromDraft(makeDraft({ commentEnabled: true, comment: '*  ', status: 'CUrequest' })),
      };

      expect(report.data.status).toBe('closed');
      expect(draftFromReport({ report, accounts, master: 'Foo', reported: noneReported }))
        .toMatchObject({ commentEnabled: true, status: 'nochange' });
    });
  });
});

describe('FilingViewComponent', () => {
  interface Ctx {
    draft: ReportDraft;
    reportError: string | null;
    $emit: ReturnType<typeof mock>;
  }
  const computed = FilingViewComponent.computed as unknown as {
    reportError(this: Pick<Ctx, 'draft'>): string | null;
  };
  const methods = FilingViewComponent.methods as unknown as {
    onSave(this: Ctx): void;
  };

  function makeCtx(draft: ReportDraft): Ctx {
    return { draft, reportError: computed.reportError.call({ draft }), $emit: mock() };
  }

  describe('reportError', () => {
    test('is null for a valid report', () => {
      expect(makeCtx(makeDraft()).reportError).toBeNull();
    });

    test('explains why a report cannot be filed', () => {
      expect(makeCtx(makeDraft({ socks: [] })).reportError).toContain('at least one account');
    });
  });

  describe('onSave', () => {
    test('hands the report to the parent view and closes', () => {
      const ctx = makeCtx(makeDraft());

      methods.onSave.call(ctx);

      expect(ctx.$emit).toHaveBeenCalledWith('save', { socks: ['Alice'], evidence: 'Same edits.' });
      expect(ctx.$emit).toHaveBeenCalledWith('update:open', false);
    });

    test('saves nothing while the report is invalid', () => {
      const ctx = makeCtx(makeDraft({ evidence: 'a | b' }));

      methods.onSave.call(ctx);

      expect(ctx.$emit).not.toHaveBeenCalled();
    });
  });
});

describe('adding accounts in the filing view', () => {
  interface AddCtx {
    draft: ReportDraft;
    accounts: UserRow[];
    master: string;
    newSock: string;
    $emit: ReturnType<typeof mock>;
  }
  const addMethods = FilingViewComponent.methods as unknown as {
    onAddSock(this: AddCtx): void;
  };

  function makeCtx(newSock: string): AddCtx {
    return { draft: makeDraft(), accounts, master: 'Foo', newSock, $emit: mock() };
  }

  test('ticks a new account and hands it to the view for its table', () => {
    const ctx = makeCtx('Carol');

    addMethods.onAddSock.call(ctx);

    expect(ctx.draft.socks).toEqual(['Alice', 'Carol']);
    expect(ctx.$emit).toHaveBeenCalledWith('add-account', 'Carol');
    expect(ctx.newSock).toBe('');
  });

  test('ticks a table account typed in without adding it again', () => {
    const ctx = makeCtx('Bob');

    addMethods.onAddSock.call(ctx);

    expect(ctx.draft.socks).toEqual(['Alice', 'Bob']);
    expect(ctx.$emit).not.toHaveBeenCalled();
  });

  test('ignores the master, whom the case is already named after', () => {
    const ctx = makeCtx('Foo');

    addMethods.onAddSock.call(ctx);

    expect(ctx.draft.socks).toEqual(['Alice']);
    expect(ctx.$emit).not.toHaveBeenCalled();
  });
});

describe('resumeReportSocks', () => {
  test('ticks accounts marked to block that joined the table while the dialog was closed', () => {
    const grown = [...accounts, makeUserRow('Carol', { block: true })];

    expect(resumeReportSocks({
      draft: makeDraft({ socks: [] }),
      accounts: grown,
      master: 'Foo',
      reported: noneReported,
      accountsAtClose: new Set(['Foo', 'Alice', 'Bob']),
    })).toEqual(['Carol']);
  });

  test('leaves an account unticked that was unticked before closing', () => {
    expect(resumeReportSocks({
      draft: makeDraft({ socks: [] }),
      accounts,
      master: 'Foo',
      reported: noneReported,
      accountsAtClose: new Set(['Foo', 'Alice', 'Bob']),
    })).toEqual([]);
  });
});

describe('reopening the filing view', () => {
  interface ReopenCtx {
    open: boolean;
    report: CaseAction<CaseReport>;
    accounts: UserRow[];
    master: string;
    reported: ReadonlySet<string>;
    draft: ReportDraft;
    newSock: string;
    keepDraft: boolean;
    accountsAtClose: Set<string>;
    reportError: string | null;
    $emit: ReturnType<typeof mock>;
    $nextTick: (callback: () => void) => Promise<void>;
    $refs: Record<string, unknown>;
  }
  const reopenWatch = FilingViewComponent.watch as unknown as {
    open(this: ReopenCtx, isOpen: boolean): void;
  };
  const reopenMethods = FilingViewComponent.methods as unknown as {
    onCancel(this: ReopenCtx): void;
    onDialogToggle(this: ReopenCtx, isOpen: boolean): void;
  };

  function makeCtx(): ReopenCtx {
    return {
      open: true,
      report: { enabled: false, data: { socks: [], evidence: '' } },
      accounts,
      master: 'Foo',
      reported: noneReported,
      draft: makeDraft({ evidence: 'Typed but not saved.' }),
      newSock: '',
      keepDraft: false,
      accountsAtClose: new Set(),
      reportError: null,
      $emit: mock(),
      $nextTick: () => Promise.resolve(),
      $refs: {},
    };
  }

  test('carries on with the draft after the dialog is closed without cancelling', () => {
    const ctx = makeCtx();

    reopenMethods.onDialogToggle.call(ctx, false);
    reopenWatch.open.call(ctx, true);

    expect(ctx.draft.evidence).toBe('Typed but not saved.');
  });

  test('starts again from what is saved after Cancel', () => {
    const ctx = makeCtx();

    reopenMethods.onCancel.call(ctx);
    reopenWatch.open.call(ctx, true);

    expect(ctx.draft.evidence).toBe('');
  });
});
