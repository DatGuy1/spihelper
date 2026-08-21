import { beforeEach, describe, expect, test } from 'bun:test';
import type { BlockEntry, BlockRowData, SubmitFormActions, UserRow } from '../../../src/types';
import { SubmitFormComponent } from '../../../src/ui/views';
import { type UnfulfilledClaim, getInitialCaseActions } from '../../../src/ui/views/top/utils';
import { setContext } from '../../../src/context.ts';
import { CaseState } from '../../../src/state.ts';
import { SectionEntry } from '../../../src/types';
import { makeBlockEntry, makeUserRow } from '../../fixtures/spi.ts';

interface LenientOverride { username: string; reasons: string[] }

interface TestCtx {
  caseActions: SubmitFormActions;
  accounts: UserRow[];
}

interface ClaimCtx extends TestCtx {
  globalRequestTargets: UserRow[];
  effectiveStatus: string;
  state: CaseState;
}

const computed = SubmitFormComponent.computed as unknown as {
  lenientOverrides(this: TestCtx): LenientOverride[];
  globalRequestTargets(this: TestCtx): UserRow[];
  commentClaims(this: ClaimCtx): UnfulfilledClaim[];
  effectiveStatus(this: TestCtx): string;
  hasInvalidMove(this: TestCtx): boolean;
};

beforeEach(() => {
  setContext('Wikipedia:Sockpuppet investigations/Foo');
});

// Rows here default to a full indef block, the settings
// a lenient existing block is compared against
const makeRow = (username: string, block: Partial<BlockRowData> = {}): UserRow => makeUserRow(
  username,
  { block: true, duration: 'infinity', acb: true, abao: true, ntp: true, nem: true, ...block },
);

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

describe('commentClaims', () => {
  function makeClaimCtx(opts: {
    comment: string;
    accounts?: UserRow[];
    commentEnabled?: boolean;
    blockEnabled?: boolean;
    status?: string;
    userLocks?: Map<string, boolean>;
  }): ClaimCtx {
    const caseActions = getInitialCaseActions();
    caseActions.status.enabled = opts.status !== undefined;
    caseActions.status.data.new = opts.status ?? 'nochange';
    caseActions.comment.enabled = opts.commentEnabled ?? true;
    caseActions.comment.data.text = opts.comment;
    caseActions.block.enabled = opts.blockEnabled ?? true;
    caseActions.block.data.userLocks = opts.userLocks ?? new Map<string, boolean>();
    const section = new SectionEntry(1, '09 July 2020');
    return makeCtxWithGetters(caseActions, opts.accounts ?? [], new CaseState([section], section));
  }

  function makeCtxWithGetters(
    caseActions: SubmitFormActions, accounts: UserRow[], state: CaseState,
  ): ClaimCtx {
    const ctx: TestCtx = { caseActions, accounts };
    return {
      ...ctx,
      state,
      get globalRequestTargets() {
        return computed.globalRequestTargets.call(ctx);
      },
      get effectiveStatus() {
        return computed.effectiveStatus.call(ctx);
      },
    };
  }

  const claimsFor = (opts: Parameters<typeof makeClaimCtx>[0]) =>
    computed.commentClaims.call(makeClaimCtx(opts)).map(claim => claim.quoted);

  // makeRow is set to be blocked but not locked unless the test says otherwise
  const lockedRow = makeRow('Sock', { lock: true });

  describe('block claims', () => {
    test('flags a block claim when nobody is set to be blocked', () => {
      expect(claimsFor({ comment: '* {{bnt}} – tagged as well', accounts: [] }))
        .toEqual(['{{bnt}}']);
    });

    test('reports the template in its documented casing', () => {
      expect(claimsFor({ comment: '* {{ipblock}}' })).toEqual(['{{IPblock}}']);
    });

    test('says nothing when a block is set to be applied', () => {
      expect(claimsFor({ comment: '* {{bnt}}', accounts: [makeRow('Sock')] })).toEqual([]);
    });

    test('flags a block claim when the block action is disabled', () => {
      expect(claimsFor({
        comment: '* {{btc}}',
        accounts: [makeRow('Sock')],
        blockEnabled: false,
        // The case is closing, so only the block half of {{btc}} goes unfulfilled
        status: 'closed',
      })).toEqual(['{{btc}}']);
    });
  });

  describe('status claims', () => {
    test('flags a comment implying a status other than the one being set', () => {
      expect(claimsFor({
        comment: '* {{Decline}} – not enough evidence',
        accounts: [makeRow('Sock')],
        status: 'endorse',
      })).toEqual(['{{Decline}}']);
    });

    test('reports both halves of {{btc}} when neither the block nor the close happens', () => {
      expect(claimsFor({ comment: '* {{btc}}', status: 'inprogress' }))
        .toEqual(['{{btc}}', '{{btc}}']);
    });
  });

  describe('lock claims', () => {
    test('flags a lock claim when nothing is set to be requested', () => {
      expect(claimsFor({
        comment: '* {{GlobalLocksRequested}} – filed at SRG',
        accounts: [makeRow('Sock')],
      })).toEqual(['{{GlobalLocksRequested}}']);
    });

    test('flags the {{glr}} redirect too', () => {
      expect(claimsFor({ comment: '* {{glr}}', accounts: [makeRow('Sock')] }))
        .toEqual(['{{glr}}']);
    });

    test('says nothing when a lock is set to be requested', () => {
      expect(claimsFor({ comment: '* {{GlobalLocksRequested}}', accounts: [lockedRow] }))
        .toEqual([]);
    });

    test('flags a lock claim for a user who is already locked', () => {
      expect(claimsFor({
        comment: '* {{GlobalLocksRequested}}',
        accounts: [lockedRow],
        userLocks: new Map([['Sock', true]]),
      })).toEqual(['{{GlobalLocksRequested}}']);
    });
  });

  test('reports both claims when neither action is set to happen', () => {
    expect(claimsFor({ comment: '* {{bnt}} and {{glr}}' }))
      .toEqual(['{{bnt}}', '{{glr}}']);
  });

  test('says nothing when the comment action is disabled', () => {
    expect(claimsFor({ comment: '* {{bnt}} and {{glr}}', commentEnabled: false })).toEqual([]);
  });

  describe('multi-section selection', () => {
    test('checks nothing, since each section submits its own comment and status', () => {
      const caseActions = getInitialCaseActions();
      caseActions.block.enabled = true;
      caseActions.comment.enabled = true;
      // The top-level box isn't what gets submitted in this mode
      caseActions.comment.data.text = '* {{bnt}} and {{glr}}';
      const sections = [new SectionEntry(1, '09 July 2020'), new SectionEntry(2, '15 August 2020')];
      for (const section of sections) {
        caseActions.comment.data.bySection.set(section.id, { text: '* {{bnt}}', enabled: true });
      }
      const state = new CaseState(sections);
      state.selectedSection = { type: 'multiple', sections };
      expect(computed.commentClaims.call(makeCtxWithGetters(caseActions, [], state))).toEqual([]);
    });
  });

  test('carries the reason the claim went unfulfilled', () => {
    expect(computed.commentClaims.call(makeClaimCtx({ comment: '* {{glr}}' })))
      .toEqual([{
        quoted: '{{glr}}',
        reason: 'no lock or global block is set to be requested',
      }]);
  });
});

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

// The alternate view has no case text, so it hands the form block-only actions
describe('with block-only case actions', () => {
  // setContext has to have run, so this can't be hoisted out of the tests
  const makeBlockOnlyCtx = (): TestCtx => ({
    caseActions: { block: getInitialCaseActions().block },
    accounts: [makeRow('Sock')],
  });

  test('has no effective status', () => {
    expect(computed.effectiveStatus.call(makeBlockOnlyCtx())).toBe('');
  });

  test('reports no comment claims', () => {
    expect(computed.commentClaims.call({
      ...makeBlockOnlyCtx(),
      globalRequestTargets: [],
      effectiveStatus: '',
      state: new CaseState(),
    })).toEqual([]);
  });

  test('reports no invalid move', () => {
    expect(computed.hasInvalidMove.call(makeBlockOnlyCtx())).toBe(false);
  });
});
