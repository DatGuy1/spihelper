import { describe, expect, test } from 'bun:test';
import { SockmasterTag, SockpuppetTag, type Tag } from '../../../src/tags.ts';
import { TagPopoverComponent } from '../../../src/ui/views';
import { silenceConsoleError } from '../../fixtures/console.ts';
import { makeSockTag } from '../../fixtures/spi.ts';

interface TestCtx {
  temporaryTag: Tag | null;
  originalTag: Tag | null;
  clipboardTag: Tag | null;
  defaultMaster: string;
  open: boolean;
  emitted: { event: string; args: unknown[] }[];
  $emit(event: string, ...args: unknown[]): void;
  openValue: boolean;
  normaliseMasters(tag: Tag): Tag;
}

// defineComponent returns the options object at runtime; cast its methods/computed
// to a typed shape so we can call them with a hand-built context object.
const methods = TagPopoverComponent.methods as unknown as {
  setTag(this: TestCtx, newTag: Tag | null): void;
  handleSave(this: TestCtx): void;
  handleCancel(this: TestCtx): void;
  handleDeleteTag(this: TestCtx): void;
  handleCopyTag(this: TestCtx): void;
  handlePasteTag(this: TestCtx): void;
  handleAddTag(this: TestCtx): void;
  normaliseMasters(tag: Tag): Tag;
};

const tagCategory = (TagPopoverComponent.computed as unknown as {
  tagCategory: {
    get(this: TestCtx): 'sock' | 'master' | null;
    set(this: TestCtx, value: 'sock' | 'master'): void;
  };
}).tagCategory;

function makeCtx(overrides: Partial<Pick<TestCtx, 'temporaryTag' | 'clipboardTag' | 'defaultMaster' | 'open'>> = {}): TestCtx {
  const emitted: { event: string; args: unknown[] }[] = [];
  return {
    temporaryTag: overrides.temporaryTag ?? null,
    originalTag: null,
    clipboardTag: overrides.clipboardTag ?? null,
    defaultMaster: overrides.defaultMaster ?? '',
    open: overrides.open ?? false,
    emitted,
    $emit(event, ...args) {
      emitted.push({ event, args });
    },
    get openValue() { return this.open; },
    set openValue(value: boolean) { this.$emit('update:open', value); },
    normaliseMasters: (tag: Tag) => methods.normaliseMasters(tag),
  };
}

describe('setTag', () => {
  test('clones a given tag rather than aliasing it', () => {
    const ctx = makeCtx();
    const source = makeSockTag({ master: 'Bar' });
    methods.setTag.call(ctx, source);
    expect(ctx.temporaryTag).not.toBe(source);
    expect(ctx.temporaryTag).toEqual(source);
  });

  test('resets to null when given null, discarding any previous tag', () => {
    const ctx = makeCtx({ temporaryTag: makeSockTag() });
    methods.setTag.call(ctx, null);
    expect(ctx.temporaryTag).toBeNull();
  });

  test('editing the result does not mutate the source tag', () => {
    const ctx = makeCtx();
    const source = makeSockTag({ master: 'Bar' });
    methods.setTag.call(ctx, source);
    if (ctx.temporaryTag && 'master' in ctx.temporaryTag) {
      ctx.temporaryTag.master = 'Changed';
    }
    expect(source.master).toBe('Bar');
  });
});

describe('handleSave', () => {
  test('emits saveTag with the temporary tag and closes the popover', () => {
    const tag = makeSockTag();
    const ctx = makeCtx({ temporaryTag: tag, open: true });
    methods.handleSave.call(ctx);
    expect(ctx.emitted).toEqual([
      { event: 'saveTag', args: [tag] },
      { event: 'update:open', args: [false] },
    ]);
  });

  test('does nothing when there is no temporary tag to save', () => {
    const ctx = makeCtx({ temporaryTag: null, open: true });
    const spy = silenceConsoleError();
    methods.handleSave.call(ctx);
    expect(ctx.emitted).toEqual([]);
    expect(spy).toHaveBeenCalledWith('No tag to save');
    spy.mockRestore();
  });

  // The master fields are bound straight to their inputs with v-model, so they bypass the
  // constructor's normalisation and have to be canonicalised when the draft is committed
  test('normalises master names typed into the fields', () => {
    const tag = makeSockTag();
    tag.master = ' User:Bar ';
    tag.altmaster = ' User:Alt ';
    const ctx = makeCtx({ temporaryTag: tag, open: true });
    methods.handleSave.call(ctx);
    expect(tag.master).toBe('Bar');
    expect(tag.altmaster).toBe('Alt');
  });

  test('leaves a sockmaster tag alone, since it has no master field', () => {
    const tag = new SockmasterTag({ status: 'blocked' });
    const ctx = makeCtx({ temporaryTag: tag, open: true });
    methods.handleSave.call(ctx);
    expect(ctx.emitted[0]).toEqual({ event: 'saveTag', args: [tag] });
  });
});

describe('handleAddTag', () => {
  test('normalises the master before emitting', () => {
    const tag = makeSockTag();
    tag.master = ' User:Bar ';
    const ctx = makeCtx({ temporaryTag: tag });
    methods.handleAddTag.call(ctx);
    expect(ctx.emitted).toEqual([{ event: 'addTag', args: [tag] }]);
    expect(tag.master).toBe('Bar');
  });

  test('emits null when there is no draft tag', () => {
    const ctx = makeCtx({ temporaryTag: null });
    methods.handleAddTag.call(ctx);
    expect(ctx.emitted).toEqual([{ event: 'addTag', args: [null] }]);
  });
});

describe('handleCancel', () => {
  test('closes without emitting a tag update', () => {
    const ctx = makeCtx({ temporaryTag: makeSockTag(), open: true });
    methods.handleCancel.call(ctx);
    expect(ctx.emitted).toEqual([{ event: 'update:open', args: [false] }]);
  });

  test('discards the draft by restoring the snapshot taken when it opened', () => {
    const ctx = makeCtx({ open: true });
    methods.setTag.call(ctx, makeSockTag({ master: 'Original' }));
    if (ctx.temporaryTag && 'master' in ctx.temporaryTag) {
      ctx.temporaryTag.master = 'Abandoned';
    }
    methods.handleCancel.call(ctx);
    expect(ctx.temporaryTag).toEqual(makeSockTag({ master: 'Original' }));
  });

  test('restores a copy, so the next round of edits is discardable too', () => {
    const ctx = makeCtx({ open: true });
    methods.setTag.call(ctx, makeSockTag({ master: 'Original' }));
    methods.handleCancel.call(ctx);
    expect(ctx.temporaryTag).not.toBe(ctx.originalTag);
  });

  test('leaves the draft null when the popover was seeded with no tag', () => {
    const ctx = makeCtx({ open: true });
    methods.setTag.call(ctx, null);
    methods.handleCancel.call(ctx);
    expect(ctx.temporaryTag).toBeNull();
  });
});

describe('handleDeleteTag', () => {
  test('emits deleteTag then closes the popover', () => {
    const ctx = makeCtx({ open: true });
    methods.handleDeleteTag.call(ctx);
    expect(ctx.emitted).toEqual([
      { event: 'deleteTag', args: [] },
      { event: 'update:open', args: [false] },
    ]);
  });
});

describe('handleCopyTag', () => {
  test('emits copyTag with the current temporary tag', () => {
    const tag = makeSockTag();
    const ctx = makeCtx({ temporaryTag: tag });
    methods.handleCopyTag.call(ctx);
    expect(ctx.emitted).toEqual([{ event: 'copyTag', args: [tag] }]);
  });

  test('does nothing when there is no temporary tag', () => {
    const ctx = makeCtx({ temporaryTag: null });
    methods.handleCopyTag.call(ctx);
    expect(ctx.emitted).toEqual([]);
  });
});

describe('handlePasteTag', () => {
  test('replaces the temporary tag with a clone of the clipboard tag', () => {
    const clipboardTag = makeSockTag({ master: 'Clipboard' });
    const ctx = makeCtx({ temporaryTag: makeSockTag({ master: 'Old' }), clipboardTag });
    methods.handlePasteTag.call(ctx);
    expect(ctx.temporaryTag).not.toBe(clipboardTag);
    expect(ctx.temporaryTag).toEqual(clipboardTag);
  });

  test('does nothing when the clipboard is empty', () => {
    const original = makeSockTag({ master: 'Old' });
    const ctx = makeCtx({ temporaryTag: original, clipboardTag: null });
    methods.handlePasteTag.call(ctx);
    expect(ctx.temporaryTag).toBe(original);
  });
});

describe('tagCategory computed', () => {
  test('get returns null when there is no temporary tag', () => {
    const ctx = makeCtx({ temporaryTag: null });
    expect(tagCategory.get.call(ctx)).toBeNull();
  });

  test('get returns sock for a SockpuppetTag and master for a SockmasterTag', () => {
    expect(tagCategory.get.call(makeCtx({ temporaryTag: makeSockTag() }))).toBe('sock');
    expect(tagCategory.get.call(makeCtx({ temporaryTag: new SockmasterTag({ status: 'blocked' }) })))
      .toBe('master');
  });

  test('set sock builds a fresh SockpuppetTag using defaultMaster and carries over evidence', () => {
    const ctx = makeCtx({
      temporaryTag: new SockmasterTag({ status: 'blocked', evidence: 'some evidence' }),
      defaultMaster: 'DefaultMaster',
    });
    tagCategory.set.call(ctx, 'sock');
    expect(ctx.temporaryTag).toEqual(new SockpuppetTag({
      master: 'DefaultMaster',
      status: 'blocked',
      evidence: 'some evidence',
    }));
  });

  test('set master builds a fresh SockmasterTag and carries over evidence', () => {
    const ctx = makeCtx({ temporaryTag: makeSockTag({ evidence: 'some evidence' }) });
    tagCategory.set.call(ctx, 'master');
    expect(ctx.temporaryTag).toEqual(new SockmasterTag({ status: 'blocked', evidence: 'some evidence' }));
  });
});
