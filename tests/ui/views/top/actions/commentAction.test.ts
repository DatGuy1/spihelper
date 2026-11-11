import { describe, expect, test } from 'bun:test';
import { CommentActionComponent } from '../../../../../src/ui/views/top/actions/commentAction.ts';
import { SectionEntry } from '../../../../../src/types';

interface Ctx {
  text: string;
  enabled: boolean;
  isClerk: boolean;
  isAdmin: boolean;
  previewContext: string | null;
  previewSection: SectionEntry | null;
}

const computed = CommentActionComponent.computed as unknown as {
  previewSource(this: Ctx): string | null;
};
const methods = CommentActionComponent.methods as unknown as {
  loadPreviewContext(this: Ctx): Promise<void>;
};

function makeCtx(overrides: Partial<Ctx> = {}): Ctx {
  return {
    text: '* Foo',
    enabled: true,
    isClerk: false,
    isAdmin: false,
    previewContext: '',
    previewSection: null,
    ...overrides,
  };
}

/** A section whose text is already loaded, so loading it makes no request */
function makeSection(id: number, text: string): SectionEntry {
  const section = new SectionEntry(id, 'Alice');
  section._text = text;
  return section;
}

describe('CommentActionComponent preview', () => {
  describe('previewSource', () => {
    test('signs the comment', () => {
      expect(computed.previewSource.call(makeCtx())).toBe('* Foo ~~~~');
    });

    test('has nothing to render for the starting bullet alone', () => {
      expect(computed.previewSource.call(makeCtx({ text: '* ' }))).toBeNull();
    });

    test('waits for the subsection of a full preview to load', () => {
      expect(computed.previewSource.call(makeCtx({ previewContext: null }))).toBeNull();
    });

    test('puts the comment after the subsection in a full preview', () => {
      expect(computed.previewSource.call(makeCtx({ previewContext: '* Bob ~~~~' })))
        .toBe('* Bob ~~~~\n* Foo ~~~~');
    });
  });

  describe('loadPreviewContext', () => {
    const sectionText = '=== Alice ===\n'
      + '==== <big>Comments by other users</big> ====\n* Bob ~~~~\n'
      + '==== <big>Clerk, CheckUser, and/or patrolling admin comments</big> ====\n* Carol ~~~~\n----';

    test('has no subsection when there is no single section to show', async () => {
      const ctx = makeCtx({ previewContext: null });

      await methods.loadPreviewContext.call(ctx);

      expect(ctx.previewContext).toBe('');
    });

    test('takes the subsection the user comments in', async () => {
      const ctx = makeCtx({ previewContext: null, previewSection: makeSection(1, sectionText) });

      await methods.loadPreviewContext.call(ctx);

      expect(ctx.previewContext).toBe('==== <big>Comments by other users</big> ====\n* Bob ~~~~');
    });

    test('loads nothing until the action is enabled', async () => {
      const ctx = makeCtx({ enabled: false, previewContext: '', previewSection: makeSection(1, sectionText) });

      await methods.loadPreviewContext.call(ctx);

      expect(ctx.previewContext).toBeNull();
    });

    test('drops a subsection that loaded after the selection moved on', async () => {
      const first = makeSection(1, sectionText);
      const ctx = makeCtx({ previewContext: null, previewSection: first });

      const loading = methods.loadPreviewContext.call(ctx);
      ctx.previewSection = makeSection(2, 'Foo');
      await loading;

      expect(ctx.previewContext).toBeNull();
    });
  });
});
