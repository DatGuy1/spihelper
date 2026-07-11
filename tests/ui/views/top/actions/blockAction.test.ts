import { describe, expect, spyOn, test } from 'bun:test';
import type { BlockEntry, BlockOptions, BlockRowData, InputColumn, Tag, TagRowPopoverState, UserRow } from '../../../../../src/types';
import { SockpuppetTag } from '../../../../../src/types';
import { BlockActionComponent } from '../../../../../src/ui/views/top';
import { isInputDisabled } from '../../../../../src/ui/utils.ts';

type SetAllColumn = Exclude<InputColumn, 'duration'>;

interface TestCtx {
  blockOptions: BlockOptions;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  accounts: UserRow[];
  selectedRows: number[];
  defaultMaster: string;
  popovers: { row: TagRowPopoverState };
  $refs: { rowTagPopover: { setTag(tag: Tag | null): void } };
  setTagCalls: (Tag | null)[];
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
  setAllTags(this: TestCtx, tag: Tag): void;
  showTagPopover(
    this: TestCtx, tag: Tag | null, tagIndex: number, rowId: string, $event: MouseEvent
  ): void;
  handleTagUpdate(this: TestCtx, updatedTag: Tag): void;
  handleTagDelete(this: TestCtx): void;
  handleTagAdd(this: TestCtx, rowId: string): Tag | null;
  getRowTagsWithDefault(this: TestCtx, tags: Tag[]): (Tag | null)[];
  validateTag(this: TestCtx, tag: Tag): boolean;
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
      interleaved: false,
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
  defaultMaster = '',
  popoverRow = {},
}: {
  blockOptions?: Partial<BlockOptions>;
  userBlocks?: Map<string, BlockEntry>;
  userLocks?: Map<string, boolean>;
  accounts?: UserRow[];
  selectedRows?: number[];
  defaultMaster?: string;
  popoverRow?: Partial<TagRowPopoverState>;
} = {}): TestCtx {
  const setTagCalls: (Tag | null)[] = [];
  const ctx: TestCtx = {
    blockOptions: { ...defaultOptions, ...blockOptions },
    userBlocks,
    userLocks,
    accounts,
    selectedRows,
    defaultMaster,
    popovers: {
      row: { anchor: null, open: false, tagIndex: 0, rowId: null, ...popoverRow },
    },
    $refs: { rowTagPopover: { setTag(tag) { setTagCalls.push(tag); } } },
    setTagCalls,
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

function makeSockTag(
  overrides: Partial<ConstructorParameters<typeof SockpuppetTag>[0]> = {},
): SockpuppetTag {
  return new SockpuppetTag({ master: 'Foo', status: 'blocked', ...overrides });
}

describe('showTagPopover', () => {
  const fakeEvent = { currentTarget: {} as HTMLElement } as unknown as MouseEvent;

  test('selecting a row for the first time seeds the popover via the ref', () => {
    const ctx = makeCtx();
    const tag = makeSockTag();
    raw.showTagPopover.call(ctx, tag, 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([tag]);
    expect(ctx.popovers.row).toMatchObject({ rowId: 'row1', tagIndex: 0, open: true });
  });

  test('reselecting the same row/tag slot does not reseed the popover', () => {
    const ctx = makeCtx({ popoverRow: { rowId: 'row1', tagIndex: 0, open: false } });
    raw.showTagPopover.call(ctx, makeSockTag(), 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([]);
    expect(ctx.popovers.row.open).toBe(true);
  });

  test('selecting a different, also-untagged row still reseeds the popover', () => {
    // Regression test: two different rows both being untagged (tag === null) must not be
    // treated as "nothing changed" just because the tag value is the same both times.
    const ctx = makeCtx({ popoverRow: { rowId: 'row1', tagIndex: 0, open: false } });
    raw.showTagPopover.call(ctx, null, 0, 'row2', fakeEvent);
    expect(ctx.setTagCalls).toEqual([null]);
    expect(ctx.popovers.row).toMatchObject({ rowId: 'row2', tagIndex: 0, open: true });
  });

  test('selecting a different tag index on the same row reseeds the popover', () => {
    const ctx = makeCtx({ popoverRow: { rowId: 'row1', tagIndex: 0, open: false } });
    const secondTag = makeSockTag({ master: 'Second' });
    raw.showTagPopover.call(ctx, secondTag, 1, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([secondTag]);
  });
});

describe('handleTagUpdate', () => {
  test('replaces the tag at the popover-tracked index on the target row', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'Old' })] });
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'Vandal', tagIndex: 0 } });
    const updated = makeSockTag({ master: 'New' });
    raw.handleTagUpdate.call(ctx, updated);
    expect(vandal.block.tags).toEqual([updated]);
  });

  test('does nothing when the tracked row id no longer exists', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag()] });
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'gone', tagIndex: 0 } });
    const spy = spyOn(console, 'error').mockImplementation(() => { /* suppress expected error log */ });
    raw.handleTagUpdate.call(ctx, makeSockTag({ master: 'New' }));
    expect(vandal.block.tags).toEqual([makeSockTag()]);
    expect(spy).toHaveBeenCalledWith('Could not find target row for tag update', 'gone');
    spy.mockRestore();
  });
});

describe('handleTagDelete', () => {
  test('removes the tag at the popover-tracked index from the target row', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'A' }), makeSockTag({ master: 'B' })] });
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'Vandal', tagIndex: 0 } });
    raw.handleTagDelete.call(ctx);
    expect(vandal.block.tags).toEqual([makeSockTag({ master: 'B' })]);
  });

  test('does nothing when the tracked row id no longer exists', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag()] });
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'gone', tagIndex: 0 } });
    const spy = spyOn(console, 'error').mockImplementation(() => { /* suppress expected error log */ });
    raw.handleTagDelete.call(ctx);
    expect(vandal.block.tags).toHaveLength(1);
    expect(spy).toHaveBeenCalledWith('Could not find target row for tag delete', 'gone');
    spy.mockRestore();
  });
});

describe('handleTagAdd', () => {
  test('pushes a new default sockpuppet tag onto the target row and returns it', () => {
    const vandal = makeRow('Vandal');
    const ctx = makeCtx({ accounts: [vandal], defaultMaster: 'DefaultMaster' });
    const added = raw.handleTagAdd.call(ctx, 'Vandal');
    if (added === null) throw new Error('expected handleTagAdd to return the new tag');
    expect(added).toEqual(makeSockTag({ master: 'DefaultMaster' }));
    expect(vandal.block.tags).toEqual([added]);
  });

  test('returns null and adds nothing when the row id does not exist', () => {
    const vandal = makeRow('Vandal');
    const ctx = makeCtx({ accounts: [vandal] });
    const spy = spyOn(console, 'error').mockImplementation(() => { /* suppress expected error log */ });
    expect(raw.handleTagAdd.call(ctx, 'gone')).toBeNull();
    expect(vandal.block.tags).toEqual([]);
    expect(spy).toHaveBeenCalledWith('Could not find target row for tag add', 'gone');
    spy.mockRestore();
  });
});

describe('setAllTags', () => {
  test('overwrites tags with a clone of the given tag for every target row', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'Old' })] });
    const bob = makeRow('Bob');
    const ctx = makeCtx({ accounts: [vandal, bob] });
    const tag = makeSockTag({ master: 'New' });
    raw.setAllTags.call(ctx, tag);
    expect(vandal.block.tags).toEqual([tag]);
    expect(bob.block.tags).toEqual([tag]);
    expect(vandal.block.tags[0]).not.toBe(tag);
  });

  test('skips non-registered accounts such as IPs', () => {
    const spy = spyOn(mw.util, 'isIPAddress').mockImplementation(name => name === '192.0.2.1');
    const ip = makeRow('192.0.2.1');
    const ctx = makeCtx({ accounts: [ip] });
    raw.setAllTags.call(ctx, makeSockTag());
    expect(ip.block.tags).toEqual([]);
    spy.mockRestore();
  });

  test('only applies to the selected rows when a selection is active', () => {
    const vandal = makeRow('Vandal');
    const bob = makeRow('Bob');
    const ctx = makeCtx({ accounts: [vandal, bob], selectedRows: [0] });
    const tag = makeSockTag();
    raw.setAllTags.call(ctx, tag);
    expect(vandal.block.tags).toEqual([tag]);
    expect(bob.block.tags).toEqual([]);
  });
});

describe('getRowTagsWithDefault', () => {
  test('returns a single null placeholder for an empty tags array', () => {
    const ctx = makeCtx();
    expect(raw.getRowTagsWithDefault.call(ctx, [])).toEqual([null]);
  });

  test('returns the tags array itself when non-empty', () => {
    const ctx = makeCtx();
    const tags = [makeSockTag()];
    expect(raw.getRowTagsWithDefault.call(ctx, tags)).toBe(tags);
  });
});

describe('validateTag', () => {
  test('rejects a sockpuppet tag with no master', () => {
    const ctx = makeCtx();
    expect(raw.validateTag.call(ctx, makeSockTag({ master: '' }))).toBe(false);
  });

  test('accepts a sockpuppet tag with a master', () => {
    const ctx = makeCtx();
    expect(raw.validateTag.call(ctx, makeSockTag({ master: 'Foo' }))).toBe(true);
  });
});
