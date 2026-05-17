import { describe, expect, test } from 'bun:test';
import type { BlockEntry, BlockOptions, BlockRowData, UserRow } from '../src/types';
import { BlockActionComponent } from '../src/ui/views/top';

type CheckboxColumn = 'block' | 'duration' | 'acb' | 'abao' | 'ntp' | 'nem' | 'lock';
type SetAllColumn = Exclude<CheckboxColumn, 'duration'>;

interface TestCtx {
  blockOptions: BlockOptions;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  accounts: UserRow[];
  selectedRows: number[];
  getTargetRows(): UserRow[];
  isCheckboxDisabled(row: UserRow | null, col: CheckboxColumn): boolean;
}

// defineComponent returns the options object at runtime; cast its methods
// to a typed shape so we can call them with a hand-built context object.
const raw = BlockActionComponent.methods as unknown as {
  getTargetRows(this: TestCtx): UserRow[];
  isCheckboxDisabled(this: TestCtx, row: UserRow | null, col: CheckboxColumn): boolean;
  setAllValue(this: TestCtx, col: SetAllColumn): boolean;
  setAllIndeterminate(this: TestCtx, col: SetAllColumn): boolean;
  setAllBlockFields(
    this: TestCtx,
    key: CheckboxColumn,
    value: BlockRowData[keyof BlockRowData],
  ): void;
};

const defaultOptions: BlockOptions = {
  noBlock: false,
  override: false,
  tagUnattached: false,
  cuBlock: false,
  cuBlockOnly: false,
  addMasterNotice: false,
  addSockNotice: false,
  blankTalk: false,
  lockHideNames: false,
};

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
    },
    block: {
      block: false,
      duration: '',
      acb: false,
      abao: false,
      ntp: false,
      nem: false,
      lock: false,
      tags: [],
      ...block,
    },
  };
}

function makeBlockEntry(overrides: Partial<BlockEntry> = {}): BlockEntry {
  return {
    username: '',
    duration: 'indefinite',
    acb: false,
    abao: true,
    ntp: false,
    nem: false,
    reason: '',
    ...overrides,
  };
}

function makeCtx({
  blockOptions = {},
  userBlocks = new Map<string, BlockEntry>(),
  userLocks = new Map<string, boolean>(),
  accounts = [] as UserRow[],
  selectedRows = [] as number[],
}: {
  blockOptions?: Partial<BlockOptions>;
  userBlocks?: Map<string, BlockEntry>;
  userLocks?: Map<string, boolean>;
  accounts?: UserRow[];
  selectedRows?: number[];
} = {}): TestCtx {
  const ctx: TestCtx = {
    blockOptions: { ...defaultOptions, ...blockOptions },
    userBlocks,
    userLocks,
    accounts,
    selectedRows,
    getTargetRows() { return raw.getTargetRows.call(ctx); },
    isCheckboxDisabled(row, col) { return raw.isCheckboxDisabled.call(ctx, row, col); },
  };
  return ctx;
}

describe('isCheckboxDisabled', () => {
  describe('block', () => {
    test('set-all: disabled when noBlock is on', () => {
      const ctx = makeCtx({ blockOptions: { noBlock: true } });
      expect(ctx.isCheckboxDisabled(null, 'block')).toBe(true);
    });

    test('set-all: enabled when noBlock is off', () => {
      expect(makeCtx().isCheckboxDisabled(null, 'block')).toBe(false);
    });

    test('row: disabled when user has existing block and override is off', () => {
      const vandal = makeRow('Vandal');
      const ctx = makeCtx({
        accounts: [vandal],
        userBlocks: new Map([['Vandal', makeBlockEntry()]]),
      });
      expect(ctx.isCheckboxDisabled(vandal, 'block')).toBe(true);
    });

    test('row: enabled when user has existing block and override is on', () => {
      const vandal = makeRow('Vandal');
      const ctx = makeCtx({
        blockOptions: { override: true },
        accounts: [vandal],
        userBlocks: new Map([['Vandal', makeBlockEntry()]]),
      });
      expect(ctx.isCheckboxDisabled(vandal, 'block')).toBe(false);
    });
  });

  describe('acb', () => {
    test('row: disabled when block is unchecked', () => {
      const vandal = makeRow('Vandal');
      expect(makeCtx({ accounts: [vandal] }).isCheckboxDisabled(vandal, 'acb')).toBe(true);
    });

    test('row: disabled when existing block has acb and override is off', () => {
      const vandal = makeRow('Vandal', { block: true });
      const ctx = makeCtx({
        accounts: [vandal],
        userBlocks: new Map([['Vandal', makeBlockEntry({ acb: true })]]),
      });
      expect(ctx.isCheckboxDisabled(vandal, 'acb')).toBe(true);
    });

    test('row: enabled when existing block has acb but override is on', () => {
      const vandal = makeRow('Vandal', { block: true });
      const ctx = makeCtx({
        blockOptions: { override: true },
        accounts: [vandal],
        userBlocks: new Map([['Vandal', makeBlockEntry({ acb: true })]]),
      });
      expect(ctx.isCheckboxDisabled(vandal, 'acb')).toBe(false);
    });

    test('set-all: disabled when no target rows have block checked', () => {
      const ctx = makeCtx({ accounts: [makeRow('Vandal'), makeRow('Bob')] });
      expect(ctx.isCheckboxDisabled(null, 'acb')).toBe(true);
    });

    test('set-all: enabled when at least one target row has block checked', () => {
      const ctx = makeCtx({
        accounts: [makeRow('Vandal', { block: true }), makeRow('Bob')],
      });
      expect(ctx.isCheckboxDisabled(null, 'acb')).toBe(false);
    });
  });
});

describe('setAllBlockFields syncs with isCheckboxDisabled', () => {
  test('skips row when override is off and the block setting already exists', () => {
    const vandal = makeRow('Vandal', { block: true });
    const ctx = makeCtx({
      accounts: [vandal],
      userBlocks: new Map([['Vandal', makeBlockEntry({ acb: true })]]),
    });
    raw.setAllBlockFields.call(ctx, 'acb', true);
    expect(vandal.block.acb).toBe(false);
  });

  test('applies to row when override is on even if the block setting exists', () => {
    const vandal = makeRow('Vandal', { block: true });
    const ctx = makeCtx({
      blockOptions: { override: true },
      accounts: [vandal],
      userBlocks: new Map([['Vandal', makeBlockEntry({ acb: true })]]),
    });
    raw.setAllBlockFields.call(ctx, 'acb', true);
    expect(vandal.block.acb).toBe(true);
  });
});

describe('setAllValue / setAllIndeterminate', () => {
  test('all rows checked = value true, not indeterminate', () => {
    const ctx = makeCtx({
      accounts: [makeRow('Vandal', { lock: true }), makeRow('Bob', { lock: true })],
    });
    expect(raw.setAllValue.call(ctx, 'lock')).toBe(true);
    expect(raw.setAllIndeterminate.call(ctx, 'lock')).toBe(false);
  });

  test('no rows checked = value false, not indeterminate', () => {
    const ctx = makeCtx({ accounts: [makeRow('Vandal'), makeRow('Bob')] });
    expect(raw.setAllValue.call(ctx, 'lock')).toBe(false);
    expect(raw.setAllIndeterminate.call(ctx, 'lock')).toBe(false);
  });

  test('some rows checked = value false, indeterminate', () => {
    const ctx = makeCtx({
      accounts: [makeRow('Vandal', { lock: true }), makeRow('Bob')],
    });
    expect(raw.setAllValue.call(ctx, 'lock')).toBe(false);
    expect(raw.setAllIndeterminate.call(ctx, 'lock')).toBe(true);
  });

  test('no applicable rows = value false, not indeterminate', () => {
    const ctx = makeCtx({
      blockOptions: { noBlock: true },
      accounts: [makeRow('Vandal'), makeRow('Bob')],
    });
    expect(raw.setAllValue.call(ctx, 'acb')).toBe(false);
    expect(raw.setAllIndeterminate.call(ctx, 'acb')).toBe(false);
  });
});
