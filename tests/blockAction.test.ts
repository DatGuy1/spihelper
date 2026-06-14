import { describe, expect, test } from 'bun:test';
import type { BlockEntry, BlockOptions, BlockRowData, InputColumn, UserRow } from '../src/types';
import { BlockActionComponent } from '../src/ui/views/top';
import { isInputDisabled } from '../src/ui/utils.ts';

type SetAllColumn = Exclude<InputColumn, 'duration'>;

interface TestCtx {
  blockOptions: BlockOptions;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  accounts: UserRow[];
  selectedRows: number[];
  getTargetRows(): UserRow[];
  isInputDisabled(row: UserRow | null, col: InputColumn): boolean;
}

// defineComponent returns the options object at runtime; cast its methods
// to a typed shape so we can call them with a hand-built context object.
const raw = BlockActionComponent.methods as unknown as {
  getTargetRows(this: TestCtx): UserRow[];
  isInputDisabled(this: TestCtx, row: UserRow | null, col: InputColumn): boolean;
  setAllValue(this: TestCtx, col: SetAllColumn): boolean;
  setAllIndeterminate(this: TestCtx, col: SetAllColumn): boolean;
  setAllBlockFields(
    this: TestCtx,
    key: InputColumn,
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
    isInputDisabled(row, col) { return raw.isInputDisabled.call(ctx, row, col); },
  };
  return ctx;
}

const noBlocks = new Map<string, BlockEntry>();
const noLocks = new Map<string, boolean>();

describe('isInputDisabled', () => {
  describe('lock column', () => {
    test('set-all: never disabled', () => {
      expect(isInputDisabled(null, 'lock', defaultOptions, noBlocks, noLocks, [])).toBe(false);
    });

    test('set-all: never disabled even when noBlock is on', () => {
      expect(isInputDisabled(null, 'lock', { ...defaultOptions, noBlock: true }, noBlocks, noLocks, [])).toBe(false);
    });

    test('row: disabled when user is already locked', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'lock', defaultOptions, noBlocks, new Map([['Vandal', true]]), [])).toBe(true);
    });

    test('row: enabled when user is not locked', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'lock', defaultOptions, noBlocks, noLocks, [])).toBe(false);
    });
  });

  describe('block column', () => {
    test('set-all: disabled when noBlock is on', () => {
      expect(isInputDisabled(null, 'block', { ...defaultOptions, noBlock: true }, noBlocks, noLocks, [])).toBe(true);
    });

    test('set-all: enabled when noBlock is off', () => {
      expect(isInputDisabled(null, 'block', defaultOptions, noBlocks, noLocks, [])).toBe(false);
    });

    test('row: disabled when noBlock is on', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'block', { ...defaultOptions, noBlock: true }, noBlocks, noLocks, [])).toBe(true);
    });

    test('row: disabled when user has existing block and override is off', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'block', defaultOptions, new Map([['Vandal', makeBlockEntry()]]), noLocks, [])).toBe(true);
    });

    test('row: enabled when user has existing block but override is on', () => {
      const row = makeRow('Vandal');
      const opts = { ...defaultOptions, override: true };
      expect(isInputDisabled(row, 'block', opts, new Map([['Vandal', makeBlockEntry()]]), noLocks, [])).toBe(false);
    });

    test('row: enabled when user has no existing block', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'block', defaultOptions, noBlocks, noLocks, [])).toBe(false);
    });
  });

  describe('duration column', () => {
    test('disabled when noBlock is on', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'duration', { ...defaultOptions, noBlock: true }, noBlocks, noLocks, [])).toBe(true);
    });

    test('set-all: disabled when no accounts have block checked', () => {
      const accounts = [makeRow('Vandal'), makeRow('Bob')];
      expect(isInputDisabled(null, 'duration', defaultOptions, noBlocks, noLocks, accounts)).toBe(true);
    });

    test('set-all: enabled when at least one account has block checked', () => {
      const accounts = [makeRow('Vandal', { block: true }), makeRow('Bob')];
      expect(isInputDisabled(null, 'duration', defaultOptions, noBlocks, noLocks, accounts)).toBe(false);
    });

    test('row: disabled when block is unchecked', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'duration', defaultOptions, noBlocks, noLocks, [])).toBe(true);
    });

    test('row: disabled when user has existing block and override is off', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'duration', defaultOptions, new Map([['Vandal', makeBlockEntry()]]), noLocks, [])).toBe(true);
    });

    test('row: enabled when user has existing block but override is on', () => {
      const row = makeRow('Vandal', { block: true });
      const opts = { ...defaultOptions, override: true };
      expect(isInputDisabled(row, 'duration', opts, new Map([['Vandal', makeBlockEntry()]]), noLocks, [])).toBe(false);
    });

    test('row: enabled when user is being blocked with no existing block', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'duration', defaultOptions, noBlocks, noLocks, [])).toBe(false);
    });
  });

  describe('block settings subcolumns (acb)', () => {
    test('disabled when noBlock is on', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'acb', { ...defaultOptions, noBlock: true }, noBlocks, noLocks, [])).toBe(true);
    });

    test('disabled when block is unchecked', () => {
      const row = makeRow('Vandal');
      expect(isInputDisabled(row, 'acb', defaultOptions, noBlocks, noLocks, [])).toBe(true);
    });

    test('disabled when existing block has the setting and override is off', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'acb', defaultOptions, new Map([['Vandal', makeBlockEntry({ acb: true })]]), noLocks, [])).toBe(true);
    });

    test('enabled when existing block does not have the setting', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'acb', defaultOptions, new Map([['Vandal', makeBlockEntry({ acb: false })]]), noLocks, [])).toBe(false);
    });

    test('enabled when existing block has the setting but override is on', () => {
      const row = makeRow('Vandal', { block: true });
      const opts = { ...defaultOptions, override: true };
      expect(isInputDisabled(row, 'acb', opts, new Map([['Vandal', makeBlockEntry({ acb: true })]]), noLocks, [])).toBe(false);
    });

    test('enabled when user is being blocked with no existing block', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'acb', defaultOptions, noBlocks, noLocks, [])).toBe(false);
    });
  });
});

describe('BlockActionComponent', () => {
  describe('setAllBlockFields', () => {
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
});
