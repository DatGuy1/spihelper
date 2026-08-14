import { beforeEach, describe, expect, test } from 'bun:test';
import type { CaseActions } from '../../../../src/types';
import { CaseState, SectionEntry } from '../../../../src/state.ts';
import { TopViewComponent } from '../../../../src/ui/views/top';
import { getInitialCaseActions } from '../../../../src/ui/views/top/utils';
import { setContext } from '../../../../src/context.ts';

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
