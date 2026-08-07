import { describe, expect, spyOn, test } from 'bun:test';
import type { BlockEntry, BlockOptions, BlockRowData, InputColumn, Tag, TagRowPopoverState, TagStatusDisplay, UserRow } from '../../../../../src/types';
import { SockmasterTag, SockpuppetTag } from '../../../../../src/types';
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
  isSameTagTarget(tag: Tag | null, tagIndex: number, rowId: string): boolean;
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
  isSameTagTarget(this: TestCtx, tag: Tag | null, tagIndex: number, rowId: string): boolean;
  handleTagUpdate(this: TestCtx, updatedTag: Tag): void;
  handleTagDelete(this: TestCtx): void;
  handleTagAdd(this: TestCtx, rowId: string | null, currentDraft: Tag | null): void;
  getRowTagsWithDefault(this: TestCtx, tags: Tag[]): (Tag | null)[];
  validateTag(this: TestCtx, tag: Tag): boolean;
  tagStatusDisplay(this: TestCtx, tag: Tag): TagStatusDisplay;
  tagLabel(this: TestCtx, tag: Tag | null): string;
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
      row: { anchor: null, open: false, tagIndex: 0, rowId: null, sourceTag: null, ...popoverRow },
    },
    $refs: { rowTagPopover: { setTag(tag) { setTagCalls.push(tag); } } },
    setTagCalls,
    getTargetRows() { return raw.getTargetRows.call(ctx); },
    isInputDisabled(row, col) { return raw.isInputDisabled.call(ctx, row, col); },
    isSameTagTarget(tag, tagIndex, rowId) {
      return raw.isSameTagTarget.call(ctx, tag, tagIndex, rowId);
    },
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

    test('disabled when existing block does not have the setting and override is off', () => {
      const row = makeRow('Vandal', { block: true });
      expect(isInputDisabled(row, 'acb', defaultOptions, new Map([['Vandal', makeBlockEntry({ acb: false })]]), noLocks, [])).toBe(true);
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

  test('reopening the same tag does not reseed, keeping edits in progress', () => {
    const tag = makeSockTag();
    const ctx = makeCtx({ popoverRow: { rowId: 'row1', tagIndex: 0, open: false, sourceTag: tag } });
    raw.showTagPopover.call(ctx, tag, 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([]);
    expect(ctx.popovers.row.open).toBe(true);
  });

  test('reopening the same tag a second time collapses it again', () => {
    const tag = makeSockTag();
    const ctx = makeCtx({ popoverRow: { rowId: 'row1', tagIndex: 0, open: true, sourceTag: tag } });
    raw.showTagPopover.call(ctx, tag, 0, 'row1', fakeEvent);
    expect(ctx.popovers.row.open).toBe(false);
  });

  test('a different tag at the same index reseeds, even though the index matches', () => {
    // Deleting a tag shifts the survivors down, so the tag now at the
    // previously-open index is a different one and must not inherit the stale draft
    const deleted = makeSockTag({ master: 'Deleted' });
    const survivor = makeSockTag({ master: 'Survivor' });
    const ctx = makeCtx({
      popoverRow: { rowId: 'row1', tagIndex: 0, open: false, sourceTag: deleted },
    });
    raw.showTagPopover.call(ctx, survivor, 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([survivor]);
    expect(ctx.popovers.row.sourceTag).toBe(survivor);
  });

  test('an equal-but-distinct tag object still reseeds', () => {
    // Matching is by identity, not value. Two tags can be structurally identical
    // while being different entries in the row.
    const ctx = makeCtx({
      popoverRow: { rowId: 'row1', tagIndex: 0, open: false, sourceTag: makeSockTag() },
    });
    const twin = makeSockTag();
    raw.showTagPopover.call(ctx, twin, 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([twin]);
  });

  test('reopening the same empty placeholder does not reseed', () => {
    const ctx = makeCtx({ popoverRow: { rowId: 'row1', tagIndex: 0, open: false, sourceTag: null } });
    raw.showTagPopover.call(ctx, null, 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([]);
  });

  test('an empty placeholder reseeds once the slot previously held a tag', () => {
    const ctx = makeCtx({
      popoverRow: { rowId: 'row1', tagIndex: 0, open: false, sourceTag: makeSockTag() },
    });
    raw.showTagPopover.call(ctx, null, 0, 'row1', fakeEvent);
    expect(ctx.setTagCalls).toEqual([null]);
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

  test('stores a copy, so the popover keeps no handle on the saved tag', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'Old' })] });
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'Vandal', tagIndex: 0 } });
    const draft = makeSockTag({ master: 'New' });
    raw.handleTagUpdate.call(ctx, draft);
    expect(vandal.block.tags[0]).not.toBe(draft);
  });

  test('further edits to the popover draft do not reach the saved tag', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'Old' })] });
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'Vandal', tagIndex: 0 } });
    const draft = makeSockTag({ master: 'Saved' });
    raw.handleTagUpdate.call(ctx, draft);
    draft.master = 'EditedAfterSaving';
    expect((vandal.block.tags[0] as SockpuppetTag).master).toBe('Saved');
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
  test('pushes a new default sockpuppet tag onto the target row', () => {
    const vandal = makeRow('Vandal');
    const ctx = makeCtx({ accounts: [vandal], defaultMaster: 'DefaultMaster' });
    raw.handleTagAdd.call(ctx, 'Vandal', null);
    expect(vandal.block.tags).toEqual([makeSockTag({ master: 'DefaultMaster' })]);
  });

  test('adds nothing when the row id does not exist', () => {
    const vandal = makeRow('Vandal');
    const ctx = makeCtx({ accounts: [vandal] });
    const spy = spyOn(console, 'error').mockImplementation(() => { /* suppress expected error log */ });
    raw.handleTagAdd.call(ctx, 'gone', null);
    expect(vandal.block.tags).toEqual([]);
    expect(spy).toHaveBeenCalledWith('Could not find target row for tag add', 'gone');
    spy.mockRestore();
  });

  test('adds nothing when there is no row tracked at all', () => {
    const vandal = makeRow('Vandal');
    const ctx = makeCtx({ accounts: [vandal] });
    const spy = spyOn(console, 'error').mockImplementation(() => { /* suppress expected error log */ });
    raw.handleTagAdd.call(ctx, null, null);
    expect(vandal.block.tags).toEqual([]);
    spy.mockRestore();
  });

  test('moves the in-progress draft onto the new tag instead of discarding it', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'Saved' })] });
    const ctx = makeCtx({
      accounts: [vandal],
      defaultMaster: 'DefaultMaster',
      popoverRow: { rowId: 'Vandal', tagIndex: 0 },
    });
    raw.handleTagAdd.call(ctx, 'Vandal', makeSockTag({ master: 'EditedButNotSaved' }));
    expect(vandal.block.tags).toEqual([
      makeSockTag({ master: 'Saved' }),
      makeSockTag({ master: 'EditedButNotSaved' }),
    ]);
  });

  test('leaves the tag that was open at its last saved value', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'Saved' })] });
    const ctx = makeCtx({
      accounts: [vandal],
      popoverRow: { rowId: 'Vandal', tagIndex: 0 },
    });
    raw.handleTagAdd.call(ctx, 'Vandal', makeSockTag({ master: 'EditedButNotSaved' }));
    expect(vandal.block.tags[0]).toEqual(makeSockTag({ master: 'Saved' }));
  });

  test('stores a copy of the draft, not the popover draft object itself', () => {
    const vandal = makeRow('Vandal');
    const ctx = makeCtx({ accounts: [vandal], popoverRow: { rowId: 'Vandal', tagIndex: 0 } });
    const draft = makeSockTag({ master: 'Draft' });
    raw.handleTagAdd.call(ctx, 'Vandal', draft);
    expect(vandal.block.tags[0]).not.toBe(draft);
  });

  test('retargets the open popover onto the newly added tag', () => {
    const vandal = makeRow('Vandal', { tags: [makeSockTag({ master: 'First' })] });
    const ctx = makeCtx({
      accounts: [vandal],
      defaultMaster: 'DefaultMaster',
      popoverRow: { rowId: 'Vandal', tagIndex: 0 },
    });
    raw.handleTagAdd.call(ctx, 'Vandal', null);
    const added = vandal.block.tags[1];
    expect(ctx.popovers.row.tagIndex).toBe(1);
    expect(ctx.popovers.row.sourceTag).toBe(added ?? null);
    expect(ctx.setTagCalls).toEqual([added ?? null]);
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

describe('tagLabel', () => {
  test('shows the master name for a sockpuppet tag', () => {
    const ctx = makeCtx();
    expect(raw.tagLabel.call(ctx, makeSockTag({ master: 'Foo' }))).toBe('Foo');
  });

  test('shows the status label for a sockmaster tag', () => {
    const ctx = makeCtx();
    expect(raw.tagLabel.call(ctx, new SockmasterTag({ status: 'blocked' }))).toBe('Blocked');
  });

  test('spells out the sockmaster banned status as 3X Banned', () => {
    const ctx = makeCtx();
    expect(raw.tagLabel.call(ctx, new SockmasterTag({ status: 'banned' }))).toBe('3X Banned');
  });

  test('returns None for the empty placeholder', () => {
    const ctx = makeCtx();
    expect(raw.tagLabel.call(ctx, null)).toBe('None');
  });
});

describe('tagStatusDisplay', () => {
  // {{sockpuppet|blocked}} = 'suspected' in text
  test('labels the sockpuppet blocked status as Suspected', () => {
    const ctx = makeCtx();
    expect(raw.tagStatusDisplay.call(ctx, makeSockTag({ status: 'blocked' })).label)
      .toBe('Suspected');
  });

  test('labels the sockmaster blocked status as Blocked', () => {
    const ctx = makeCtx();
    expect(raw.tagStatusDisplay.call(ctx, new SockmasterTag({ status: 'blocked' })).label)
      .toBe('Blocked');
  });

  test('gives every status a distinct icon within its tag kind', () => {
    const ctx = makeCtx();
    const sockIcons = (['blocked', 'proven', 'confirmed'] as const)
      .map(status => raw.tagStatusDisplay.call(ctx, makeSockTag({ status })).icon);
    expect(new Set(sockIcons).size).toBe(3);

    const masterIcons = (['blocked', 'confirmed', 'banned'] as const)
      .map(status => raw.tagStatusDisplay.call(ctx, new SockmasterTag({ status })).icon);
    expect(new Set(masterIcons).size).toBe(3);
  });

  test('uses the same icon for both confirmed statuses', () => {
    const ctx = makeCtx();
    expect(raw.tagStatusDisplay.call(ctx, makeSockTag({ status: 'confirmed' })).icon)
      .toBe(raw.tagStatusDisplay.call(ctx, new SockmasterTag({ status: 'confirmed' })).icon);
  });
});
