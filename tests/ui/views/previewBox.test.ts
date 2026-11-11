import { afterAll, afterEach, beforeEach, describe, expect, jest, spyOn, test } from 'bun:test';
import * as apiModule from '../../../src/api.ts';
import { PREVIEW_DEBOUNCE_MS, PreviewBoxComponent } from '../../../src/ui/views/previewBox.ts';

const mockRender = spyOn(apiModule, 'spiHelperRenderText');

afterAll(() => {
  mockRender.mockRestore();
});

interface Ctx {
  source: string | null;
  title: string;
  active: boolean;
  html: string;
  loading: boolean;
  failed: boolean;
  renderedSource: string | null;
  timer: ReturnType<typeof setTimeout> | null;
  controller: AbortController | null;
  cancel(): void;
  schedule(delay: number): void;
  render(): Promise<void>;
}

const methods = PreviewBoxComponent.methods as unknown as {
  cancel(this: Ctx): void;
  schedule(this: Ctx, delay: number): void;
  render(this: Ctx): Promise<void>;
};
const watch = PreviewBoxComponent.watch as unknown as {
  source(this: Ctx): void;
  active(this: Ctx, isActive: boolean): void;
};

function makeCtx(overrides: Partial<Ctx> = {}): Ctx {
  const ctx = {
    source: 'Foo',
    title: 'Wikipedia:Sockpuppet investigations/Alice',
    active: true,
    html: '',
    loading: false,
    failed: false,
    renderedSource: null,
    timer: null,
    controller: null,
    ...overrides,
  } as Ctx;
  ctx.cancel = methods.cancel.bind(ctx);
  ctx.schedule = methods.schedule.bind(ctx);
  ctx.render = methods.render.bind(ctx);
  return ctx;
}

/** Fire the debounce and let the render's response land */
async function settle(ms = PREVIEW_DEBOUNCE_MS) {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
  await Promise.resolve();
}

describe('PreviewBoxComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockRender.mockReset();
    mockRender.mockImplementation((_title, text) => Promise.resolve(`<p>${text}</p>`));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('rendering as the text changes', () => {
    test('waits for typing to pause', async () => {
      const ctx = makeCtx();

      watch.source.call(ctx);
      await settle(PREVIEW_DEBOUNCE_MS - 1);
      expect(mockRender).not.toHaveBeenCalled();

      await settle(1);
      expect(mockRender).toHaveBeenCalledTimes(1);
      expect(ctx.html).toBe('<p>Foo</p>');
    });

    test('renders once for a burst of changes, with the latest text', async () => {
      const ctx = makeCtx();

      for (const source of ['F', 'Fo', 'Foo']) {
        ctx.source = source;
        watch.source.call(ctx);
        await settle(PREVIEW_DEBOUNCE_MS / 2);
      }
      await settle();

      expect(mockRender).toHaveBeenCalledTimes(1);
      expect(mockRender.mock.calls[0]?.[1]).toBe('Foo');
    });

    test('skips text it has already rendered', async () => {
      const ctx = makeCtx({ renderedSource: 'Foo', html: '<p>Foo</p>' });

      watch.source.call(ctx);
      await settle();

      expect(mockRender).not.toHaveBeenCalled();
    });

    test('keeps the last preview while there is nothing to render', async () => {
      const ctx = makeCtx({ source: null, renderedSource: 'Foo', html: '<p>Foo</p>' });

      watch.source.call(ctx);
      await settle();

      expect(mockRender).not.toHaveBeenCalled();
      expect(ctx.html).toBe('<p>Foo</p>');
    });
  });

  describe('visibility', () => {
    test('sends nothing while hidden', async () => {
      const ctx = makeCtx({ active: false });

      watch.source.call(ctx);
      await settle();

      expect(mockRender).not.toHaveBeenCalled();
    });

    test('renders straight away on being shown', async () => {
      const ctx = makeCtx({ active: true });

      watch.active.call(ctx, true);
      await settle(0);

      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    test('drops a pending render on being hidden', async () => {
      const ctx = makeCtx();

      watch.source.call(ctx);
      ctx.active = false;
      watch.active.call(ctx, false);
      await settle();

      expect(mockRender).not.toHaveBeenCalled();
    });
  });

  describe('requests in flight', () => {
    test('cancels the one in flight when the text changes, and ignores its response', async () => {
      let resolveFirst: (html: string) => void = () => undefined;
      mockRender.mockImplementationOnce(() => new Promise((resolve) => {
        resolveFirst = resolve;
      }));
      const ctx = makeCtx({ source: 'Alice' });

      void ctx.render();
      const firstSignal = mockRender.mock.calls[0]?.[2];
      ctx.source = 'Bob';
      watch.source.call(ctx);
      await settle();
      resolveFirst('<p>Alice</p>');
      await Promise.resolve();

      expect(firstSignal?.aborted).toBe(true);
      expect(ctx.html).toBe('<p>Bob</p>');
    });

    test('keeps the last good preview when a render fails', async () => {
      mockRender.mockImplementationOnce(() => Promise.resolve(''));
      const ctx = makeCtx({ source: 'Bob', renderedSource: 'Alice', html: '<p>Alice</p>' });

      await ctx.render();

      expect(ctx.html).toBe('<p>Alice</p>');
      expect(ctx.failed).toBe(true);
      expect(ctx.loading).toBe(false);
    });
  });
});
