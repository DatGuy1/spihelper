import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type { BlockEntry, BlockRowData, CaseActions, UserRow } from '../../../src/types';
import { SubmitFormComponent } from '../../../src/ui/views';
import { getInitialCaseActions } from '../../../src/ui/views/top/utils';
import { setContext } from '../../../src/context.ts';

interface LenientOverride { username: string; reasons: string[] }

interface TestCtx {
  caseActions: CaseActions;
  accounts: UserRow[];
}

const computed = SubmitFormComponent.computed as unknown as {
  lenientOverrides(this: TestCtx): LenientOverride[];
};

beforeEach(() => {
  setContext('Wikipedia:Sockpuppet investigations/Foo');
  spyOn(mw.util, 'isInfinity').mockImplementation(value =>
    ['infinite', 'indefinite', 'infinity', 'never'].includes(value ?? ''),
  );
});

afterEach(() => {
  mock.restore();
});

function makeRow(username: string, block: Partial<BlockRowData> = {}): UserRow {
  return {
    id: username,
    username,
    link: {
      analyser: false,
      timeline: false,
      timecard: false,
      pages: false,
      summary: false,
      cuwiki: false,
      interleaved: false,
    },
    block: {
      block: true,
      duration: 'infinity',
      acb: true,
      abao: true,
      ntp: true,
      nem: true,
      tags: [],
      lock: false,
      ...block,
    },
  };
}

function makeBlockEntry(username: string, overrides: Partial<BlockEntry> = {}): BlockEntry {
  return {
    username,
    duration: 'infinity',
    acb: true,
    abao: true,
    ntp: true,
    nem: true,
    reason: 'Abusing multiple accounts',
    ...overrides,
  };
}

function makeCtx(opts: {
  accounts: UserRow[];
  userBlocks?: Map<string, BlockEntry>;
  enabled?: boolean;
  override?: boolean;
  noBlock?: boolean;
}): TestCtx {
  const caseActions = getInitialCaseActions();
  caseActions.block.enabled = opts.enabled ?? true;
  caseActions.block.data.options.override = opts.override ?? true;
  caseActions.block.data.options.noBlock = opts.noBlock ?? false;
  caseActions.block.data.userBlocks = opts.userBlocks ?? new Map<string, BlockEntry>();
  return { caseActions, accounts: opts.accounts };
}

describe('lenientOverrides', () => {
  const lenientRow = makeRow('Sock', { ntp: false });
  const userBlocks = new Map<string, BlockEntry>([['Sock', makeBlockEntry('Sock')]]);

  test('flags a relaxed setting on an overridden block', () => {
    expect(computed.lenientOverrides.call(makeCtx({ accounts: [lenientRow], userBlocks })))
      .toEqual([{ username: 'Sock', reasons: ['talk page access is restored'] }]);
  });

  test('returns nothing when override is off', () => {
    expect(computed.lenientOverrides.call(
      makeCtx({ accounts: [lenientRow], userBlocks, override: false }),
    )).toEqual([]);
  });

  test('returns nothing when no blocks are being made', () => {
    expect(computed.lenientOverrides.call(
      makeCtx({ accounts: [lenientRow], userBlocks, noBlock: true }),
    )).toEqual([]);
  });

  test('returns nothing when the block action is disabled', () => {
    expect(computed.lenientOverrides.call(
      makeCtx({ accounts: [lenientRow], userBlocks, enabled: false }),
    )).toEqual([]);
  });

  test('ignores rows that are not set to be blocked', () => {
    const uncheckedRow = makeRow('Sock', { ntp: false, block: false });
    expect(computed.lenientOverrides.call(makeCtx({ accounts: [uncheckedRow], userBlocks })))
      .toEqual([]);
  });

  test('ignores users who are not already blocked', () => {
    expect(computed.lenientOverrides.call(makeCtx({ accounts: [lenientRow] })))
      .toEqual([]);
  });

  test('only reports the users whose block is actually relaxed', () => {
    const accounts = [
      makeRow('Sock', { ntp: false }),
      makeRow('Sock2'),
      makeRow('Sock3', { nem: false, acb: false }),
    ];
    const blocks = new Map(accounts.map(row => [row.username, makeBlockEntry(row.username)]));
    expect(computed.lenientOverrides.call(makeCtx({ accounts, userBlocks: blocks })))
      .toEqual([
        { username: 'Sock', reasons: ['talk page access is restored'] },
        {
          username: 'Sock3',
          reasons: ['account creation is re-enabled', 'email access is restored'],
        },
      ]);
  });
});
