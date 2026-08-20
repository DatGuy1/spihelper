import { beforeEach, describe, expect, mock, test } from 'bun:test';
import type { CaseActions, UserRow } from '../../../../src/types';
import { CaseState, type SectionSelection } from '../../../../src/state.ts';
import { SectionEntry } from '../../../../src/types';
import { setContext } from '../../../../src/context.ts';
import { getInitialCaseActions } from '../../../../src/ui/views/top/utils';
import { TopViewComponent } from '../../../../src/ui/views/top';
import { makeUserRow } from '../../../fixtures/spi.ts';
import { setupBlockActionData } from '../../../../src/utils.ts';
import type { prefetchSockRows } from '../../../../src/ui/views/top/utils';

const mockPrefetchSockRows = mock(
  (_opts: Parameters<typeof prefetchSockRows>[0]): Promise<UserRow[]> => Promise.resolve([]),
);
void mock.module('../../../../src/ui/views/top/utils/section.ts', () => ({
  prefetchSockRows: mockPrefetchSockRows,
}));

interface TestCtx {
  caseActions: CaseActions;
  state: CaseState;
}

const computed = TopViewComponent.computed as unknown as {
  allDisabled(this: TestCtx): boolean;
};

beforeEach(() => {
  setContext('Wikipedia:Sockpuppet investigations/Foo');
});

describe('allDisabled', () => {
  const sectionA = new SectionEntry(1, '09 July 2020');
  const sectionB = new SectionEntry(2, '10 August 2021');

  /** Every top-level action off, with whatever per-section entries the caller wants left over */
  function makeCtx(opts: {
    selection: CaseState['selectedSection'];
    enabledSections?: SectionEntry[];
  }): TestCtx {
    const caseActions = getInitialCaseActions();
    for (const name of Object.keys(caseActions) as (keyof CaseActions)[]) {
      caseActions[name].enabled = false;
    }
    for (const section of opts.enabledSections ?? []) {
      caseActions.comment.data.bySection.set(section.id, { text: '* ', enabled: true });
    }
    const state = new CaseState([sectionA, sectionB]);
    state.selectedSection = opts.selection;
    return { caseActions, state };
  }

  test('is disabled when nothing is ticked anywhere', () => {
    expect(computed.allDisabled.call(makeCtx({
      selection: { type: 'single', section: sectionA },
    }))).toBe(true);
  });

  test('is not disabled while a selected section still drives its own comment', () => {
    expect(computed.allDisabled.call(makeCtx({
      selection: { type: 'multiple', sections: [sectionA, sectionB] },
      enabledSections: [sectionA],
    }))).toBe(false);
  });

  test('ignores per-section entries left behind by an earlier multi-selection', () => {
    expect(computed.allDisabled.call(makeCtx({
      selection: { type: 'single', section: sectionA },
      enabledSections: [sectionA],
    }))).toBe(true);
  });

  test('ignores per-section entries when the whole case is selected', () => {
    expect(computed.allDisabled.call(makeCtx({
      selection: { type: 'all' },
      enabledSections: [sectionA],
    }))).toBe(true);
  });

  test('is not disabled when a top-level action is ticked, whatever the selection', () => {
    const ctx = makeCtx({ selection: { type: 'single', section: sectionA } });
    ctx.caseActions.comment.enabled = true;

    expect(computed.allDisabled.call(ctx)).toBe(false);
  });

  test('does not count the actions that never reach an edit', () => {
    const ctx = makeCtx({ selection: { type: 'single', section: sectionA } });
    ctx.caseActions.sections.enabled = true;
    ctx.caseActions.link.enabled = true;

    expect(computed.allDisabled.call(ctx)).toBe(true);
  });
});

describe('loadSectionAccounts', () => {
  interface LoadCtx {
    accounts: UserRow[];
    sectionAccountNames: Set<string>;
    sectionAccountsController: AbortController | null;
    caseActions: CaseActions;
    state: CaseState;
    startSectionAccountsLoad(): AbortSignal;
    massAddUserRows(rows: UserRow[]): UserRow[];
    loadSectionAccounts(selection: SectionSelection): Promise<void>;
  }

  const methods = TopViewComponent.methods as unknown as {
    loadSectionAccounts(this: LoadCtx, selection: SectionSelection): Promise<void>;
    startSectionAccountsLoad(this: LoadCtx): AbortSignal;
    massAddUserRows(this: LoadCtx, rows: UserRow[]): UserRow[];
  };

  /** A section whose text is already cached, so only the prefetch stays outstanding */
  function makeSection(id: number, name: string): SectionEntry {
    const section = new SectionEntry(id, name);
    section._text = '';
    return section;
  }

  function makeCtx(sections: SectionEntry[]): LoadCtx {
    const caseActions = getInitialCaseActions();
    caseActions.block.data = setupBlockActionData();
    const ctx: LoadCtx = {
      accounts: [],
      sectionAccountNames: new Set<string>(),
      sectionAccountsController: null,
      caseActions,
      state: new CaseState(sections),
      startSectionAccountsLoad: () => methods.startSectionAccountsLoad.call(ctx),
      massAddUserRows: rows => methods.massAddUserRows.call(ctx, rows),
      loadSectionAccounts: selection => methods.loadSectionAccounts.call(ctx, selection),
    };
    return ctx;
  }

  /**
   * Runs the pending loads up to the point where `calls` of them have reached their prefetch,
   * which is the window a section switch has to catch one in
   */
  async function untilPrefetchStarted(calls: number) {
    for (let i = 0; i < 20 && mockPrefetchSockRows.mock.calls.length < calls; i++) {
      await Promise.resolve();
    }
    expect(mockPrefetchSockRows).toHaveBeenCalledTimes(calls);
  }

  beforeEach(() => {
    mockPrefetchSockRows.mockReset();
  });

  test('adds the rows of a load nothing superseded', async () => {
    const section = makeSection(1, '09 July 2020');
    const ctx = makeCtx([section]);
    mockPrefetchSockRows.mockResolvedValue([makeUserRow('Sock1')]);

    await ctx.loadSectionAccounts({ type: 'single', section });

    expect(ctx.accounts.map(row => row.username)).toEqual(['Sock1']);
    expect([...ctx.sectionAccountNames]).toEqual(['Sock1']);
  });

  test('drops the rows of a load superseded before it finished', async () => {
    const sectionA = makeSection(1, '09 July 2020');
    const sectionB = makeSection(2, '10 August 2021');
    const ctx = makeCtx([sectionA, sectionB]);
    const first = Promise.withResolvers<UserRow[]>();
    const second = Promise.withResolvers<UserRow[]>();
    mockPrefetchSockRows
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const loadA = ctx.loadSectionAccounts({ type: 'single', section: sectionA });
    await untilPrefetchStarted(1);
    const loadB = ctx.loadSectionAccounts({ type: 'single', section: sectionB });
    await untilPrefetchStarted(2);
    // Out of order: the superseded load is the last to come back
    second.resolve([makeUserRow('SockB')]);
    await loadB;
    first.resolve([makeUserRow('SockA')]);
    await loadA;

    expect(ctx.accounts.map(row => row.username)).toEqual(['SockB']);
    // Anything left out of this set survives every later section change
    expect([...ctx.sectionAccountNames]).toEqual(['SockB']);
  });

  test('does not look anything up for a load superseded before it got that far', async () => {
    const sectionA = makeSection(1, '09 July 2020');
    const sectionB = makeSection(2, '10 August 2021');
    const ctx = makeCtx([sectionA, sectionB]);
    mockPrefetchSockRows.mockResolvedValue([makeUserRow('SockB')]);

    const loadA = ctx.loadSectionAccounts({ type: 'single', section: sectionA });
    const loadB = ctx.loadSectionAccounts({ type: 'single', section: sectionB });
    await Promise.all([loadA, loadB]);

    expect(mockPrefetchSockRows).toHaveBeenCalledTimes(1);
    expect(ctx.accounts.map(row => row.username)).toEqual(['SockB']);
  });

  test('clears the rows the previous section put in the table', async () => {
    const sectionA = makeSection(1, '09 July 2020');
    const sectionB = makeSection(2, '10 August 2021');
    const ctx = makeCtx([sectionA, sectionB]);

    mockPrefetchSockRows.mockResolvedValueOnce([makeUserRow('SockA')]);
    await ctx.loadSectionAccounts({ type: 'single', section: sectionA });
    mockPrefetchSockRows.mockResolvedValueOnce([makeUserRow('SockB')]);
    await ctx.loadSectionAccounts({ type: 'single', section: sectionB });

    expect(ctx.accounts.map(row => row.username)).toEqual(['SockB']);
  });
});
