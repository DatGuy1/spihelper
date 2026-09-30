import { afterAll, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import type { CaseActions, UserRow } from '../../../../src/types';
import { CaseState, type SectionSelection, getSelectedSections } from '../../../../src/state.ts';
import { SectionEntry } from '../../../../src/types';
import { setContext } from '../../../../src/context.ts';
import { getInitialCaseActions } from '../../../../src/ui/views/top/utils';
import { TopViewComponent } from '../../../../src/ui/views/top';
import { makeUserRow } from '../../../fixtures/spi.ts';
import { setupBlockActionData } from '../../../../src/utils.ts';
import * as sectionModule from '../../../../src/ui/views/top/utils/section.ts';

const mockPrefetchSockRows = spyOn(sectionModule, 'prefetchSockRows');
afterAll(() => {
  mockPrefetchSockRows.mockRestore();
});

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

  test('does not count the section selector, which never reaches an edit', () => {
    const ctx = makeCtx({ selection: { type: 'single', section: sectionA } });
    ctx.caseActions.sections.enabled = true;

    expect(computed.allDisabled.call(ctx)).toBe(true);
  });
});

describe('loadSectionAccounts', () => {
  interface LoadCtx {
    accounts: UserRow[];
    sectionAccountNames: Set<string>;
    sectionSelectionController: AbortController | null;
    caseActions: CaseActions;
    state: CaseState;
    startSelectionLoad(): AbortSignal;
    massAddUserRows(rows: UserRow[]): UserRow[];
    loadSectionAccounts(selection: SectionSelection): Promise<void>;
  }

  const methods = TopViewComponent.methods as unknown as {
    loadSectionAccounts(
      this: LoadCtx, selection: SectionSelection, signal: AbortSignal,
    ): Promise<void>;
    startSelectionLoad(this: LoadCtx): AbortSignal;
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
      sectionSelectionController: null,
      caseActions,
      state: new CaseState(sections),
      startSelectionLoad: () => methods.startSelectionLoad.call(ctx),
      massAddUserRows: rows => methods.massAddUserRows.call(ctx, rows),
      // Mirrors the real callers, which start the selection load and thread its signal down
      loadSectionAccounts: selection => methods.loadSectionAccounts.call(
        ctx, selection, methods.startSelectionLoad.call(ctx),
      ),
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

describe('loadNewSection', () => {
  interface NewSectionCtx {
    caseActions: CaseActions;
    state: CaseState;
    sectionSelectionController: AbortController | null;
    accountLoads: SectionSelection[];
    loadNewSection(section: SectionEntry): Promise<void>;
    startSelectionLoad(): AbortSignal;
    loadSectionAccounts(selection: SectionSelection, signal: AbortSignal): void;
    syncSelectedSectionOverlay(): void;
  }

  const methods = TopViewComponent.methods as unknown as {
    loadNewSection(this: NewSectionCtx, section: SectionEntry): Promise<void>;
    startSelectionLoad(this: NewSectionCtx): AbortSignal;
  };

  /** A section whose text is already cached */
  function cachedSection(id: number, name: string, status: string): SectionEntry {
    const section = new SectionEntry(id, name);
    section._text = `{{SPI case status|${status}}}`;
    return section;
  }

  /**
   * A section still in flight, standing in for one being fetched over the network.
   * loadSectionText hands back _loadingPromise, so the test decides when it lands
   */
  function pendingSection(id: number, name: string) {
    const section = new SectionEntry(id, name);
    const deferred = Promise.withResolvers<string>();
    section._loadingPromise = deferred.promise;
    return {
      section,
      arrive: (status: string) => {
        deferred.resolve(`{{SPI case status|${status}}}`);
      },
    };
  }

  function makeCtx(sections: SectionEntry[]): NewSectionCtx {
    const ctx: NewSectionCtx = {
      caseActions: getInitialCaseActions(),
      state: new CaseState(sections),
      sectionSelectionController: null,
      accountLoads: [],
      loadNewSection: section => methods.loadNewSection.call(ctx, section),
      startSelectionLoad: () => methods.startSelectionLoad.call(ctx),
      loadSectionAccounts: (selection) => {
        ctx.accountLoads.push(selection);
      },
      syncSelectedSectionOverlay: () => undefined,
    };
    return ctx;
  }

  test('takes the status of the section it loaded', async () => {
    const section = cachedSection(1, '09 July 2020', 'cudecline');
    const ctx = makeCtx([section]);

    await ctx.loadNewSection(section);

    expect(ctx.caseActions.status.data.old).toBe('cudecline');
    expect(ctx.caseActions.status.data.new).toBe('cudecline');
    expect(ctx.accountLoads).toEqual([{ type: 'single', section }]);
  });

  test('ignores a section whose text arrives after a later section was picked', async () => {
    // The slow section is clicked first but answers last, so without a staleness check it
    // would write its own status against the section now on screen
    const { section: slow, arrive } = pendingSection(1, '09 July 2020');
    const quick = cachedSection(2, '10 August 2021', 'endorse');
    const ctx = makeCtx([slow, quick]);

    const loadSlow = ctx.loadNewSection(slow);
    const loadQuick = ctx.loadNewSection(quick);
    await loadQuick;
    arrive('closed');
    await loadSlow;

    expect(ctx.state.selectedSection).toEqual({ type: 'single', section: quick });
    expect(ctx.caseActions.status.data.old).toBe('endorse');
    expect(ctx.caseActions.status.data.new).toBe('endorse');
  });

  test('does not restart the account load of the section that superseded it', async () => {
    const { section: slow, arrive } = pendingSection(1, '09 July 2020');
    const quick = cachedSection(2, '10 August 2021', 'endorse');
    const ctx = makeCtx([slow, quick]);

    const loadSlow = ctx.loadNewSection(slow);
    const loadQuick = ctx.loadNewSection(quick);
    await loadQuick;
    arrive('closed');
    await loadSlow;

    expect(ctx.accountLoads).toEqual([{ type: 'single', section: quick }]);
  });
});

describe('multi-select mode', () => {
  interface MultiSelectCtx {
    caseActions: CaseActions;
    state: CaseState;
    multiSelectMode: boolean;
    sectionSelectionController: AbortController | null;
    readonly selectedSections: SectionEntry[];
    toggleMultiSelectMode(newValue: boolean): Promise<void>;
    applySectionSelection(sections: SectionEntry[]): Promise<void>;
    loadNewSection(section: SectionEntry): Promise<void>;
    ensureBySectionEntry(section: SectionEntry): Promise<void>;
    pruneBySectionData(keepIds: Set<number>): void;
    startSelectionLoad(): AbortSignal;
    loadSectionAccounts(): void;
    syncSelectedSectionOverlay(): void;
  }

  const methods = TopViewComponent.methods as unknown as {
    toggleMultiSelectMode(this: MultiSelectCtx, newValue: boolean): Promise<void>;
    applySectionSelection(this: MultiSelectCtx, sections: SectionEntry[]): Promise<void>;
    loadNewSection(this: MultiSelectCtx, section: SectionEntry): Promise<void>;
    ensureBySectionEntry(this: MultiSelectCtx, section: SectionEntry): Promise<void>;
    pruneBySectionData(this: MultiSelectCtx, keepIds: Set<number>): void;
    startSelectionLoad(this: MultiSelectCtx): AbortSignal;
  };

  const sectionA = new SectionEntry(1, '09 July 2020');
  const sectionB = new SectionEntry(2, '10 August 2021');
  sectionA._text = '{{SPI case status|open}}';
  sectionB._text = '{{SPI case status|endorse}}';

  beforeEach(() => {
    (mw as unknown as { track: () => void }).track = () => { /* no-op */ };
  });

  function makeCtx(opts: {
    multiSelectMode: boolean;
    selection: SectionSelection | null;
  }): MultiSelectCtx {
    const state = new CaseState([sectionA, sectionB]);
    state.selectedSection = opts.selection;
    const ctx: MultiSelectCtx = {
      caseActions: getInitialCaseActions(),
      state,
      multiSelectMode: opts.multiSelectMode,
      sectionSelectionController: null,
      get selectedSections() {
        return getSelectedSections(ctx.state.selectedSection);
      },
      toggleMultiSelectMode: newValue => methods.toggleMultiSelectMode.call(ctx, newValue),
      applySectionSelection: sections => methods.applySectionSelection.call(ctx, sections),
      loadNewSection: section => methods.loadNewSection.call(ctx, section),
      ensureBySectionEntry: section => methods.ensureBySectionEntry.call(ctx, section),
      pruneBySectionData: (keepIds) => {
        methods.pruneBySectionData.call(ctx, keepIds);
      },
      startSelectionLoad: () => methods.startSelectionLoad.call(ctx),
      loadSectionAccounts: () => undefined,
      syncSelectedSectionOverlay: () => undefined,
    };
    return ctx;
  }

  describe('applySectionSelection', () => {
    test('keeps a lone section as a multiple selection', async () => {
      const ctx = makeCtx({ multiSelectMode: true, selection: null });

      await ctx.applySectionSelection([sectionA]);

      expect(ctx.state.selectedSection).toEqual({ type: 'multiple', sections: [sectionA] });
      expect(ctx.caseActions.sections.data.section).toEqual([sectionA.id]);
      expect(ctx.caseActions.status.data.bySection.get(sectionA.id)?.old).toBe('open');
    });

    test('keeps a multiple selection when narrowed down to one section', async () => {
      const ctx = makeCtx({ multiSelectMode: true, selection: { type: 'multiple', sections: [sectionA, sectionB] } });

      await ctx.applySectionSelection([sectionB]);

      expect(ctx.state.selectedSection).toEqual({ type: 'multiple', sections: [sectionB] });
      expect(ctx.caseActions.status.data.bySection.has(sectionA.id)).toBe(false);
    });

    test('collapses a lone section to a single selection outside multi-select mode', async () => {
      const ctx = makeCtx({ multiSelectMode: false, selection: null });

      await ctx.applySectionSelection([sectionA]);

      expect(ctx.state.selectedSection).toEqual({ type: 'single', section: sectionA });
      expect(ctx.caseActions.sections.data.section).toBe(sectionA.id);
    });
  });

  describe('toggleMultiSelectMode', () => {
    test('turns the selected section into a one-section multiple selection', async () => {
      const ctx = makeCtx({ multiSelectMode: false, selection: { type: 'single', section: sectionA } });

      await ctx.toggleMultiSelectMode(true);

      expect(ctx.state.selectedSection).toEqual({ type: 'multiple', sections: [sectionA] });
    });

    test('clears a whole-case selection, which has no chip to show', async () => {
      const ctx = makeCtx({ multiSelectMode: false, selection: { type: 'all' } });

      await ctx.toggleMultiSelectMode(true);

      expect(ctx.state.selectedSection).toBeNull();
      expect(ctx.caseActions.sections.data.section).toBeNull();
    });

    test('collapses a one-section multiple selection back to a single one', async () => {
      const ctx = makeCtx({ multiSelectMode: true, selection: { type: 'multiple', sections: [sectionA] } });

      await ctx.toggleMultiSelectMode(false);

      expect(ctx.state.selectedSection).toEqual({ type: 'single', section: sectionA });
      expect(ctx.caseActions.sections.data.section).toBe(sectionA.id);
    });

    test('keeps only the first section when leaving with several selected', async () => {
      const ctx = makeCtx({ multiSelectMode: true, selection: { type: 'multiple', sections: [sectionA, sectionB] } });

      await ctx.toggleMultiSelectMode(false);

      expect(ctx.state.selectedSection).toEqual({ type: 'single', section: sectionA });
    });
  });
});
