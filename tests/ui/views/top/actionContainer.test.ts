import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { ActionContainerComponent } from '../../../../src/ui/views/top';

interface TestCtx {
  built: boolean;
  enabled: boolean;
}

const container = ActionContainerComponent as unknown as {
  data(this: { enabled: boolean }): { built: boolean };
  watch: { enabled(this: TestCtx, newValue: boolean): void };
};

/** Runs whatever the component queued for the next frame */
let frameCallbacks: FrameRequestCallback[];

beforeEach(() => {
  frameCallbacks = [];
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    frameCallbacks.push(callback);
    return frameCallbacks.length;
  };
});

afterEach(() => {
  frameCallbacks = [];
});

function runFrame() {
  const pending = frameCallbacks;
  frameCallbacks = [];
  for (const callback of pending) {
    callback(0);
  }
}

describe('ActionContainerComponent', () => {
  describe('initial build state', () => {
    test('a form that starts enabled is built immediately, with no deferred frame', () => {
      expect(container.data.call({ enabled: true }).built).toBe(true);
      expect(frameCallbacks).toHaveLength(0);
    });

    test('a form that starts disabled is not built', () => {
      expect(container.data.call({ enabled: false }).built).toBe(false);
    });
  });

  describe('first enable', () => {
    test('defers building by a frame so the toggle can repaint first', () => {
      const ctx: TestCtx = { built: false, enabled: true };

      container.watch.enabled.call(ctx, true);

      expect(ctx.built).toBe(false);
      runFrame();
      expect(ctx.built).toBe(true);
    });

    test('does not build if the form was switched off again within that frame', () => {
      const ctx: TestCtx = { built: false, enabled: true };

      container.watch.enabled.call(ctx, true);
      ctx.enabled = false;
      runFrame();

      expect(ctx.built).toBe(false);
    });
  });

  describe('later toggles', () => {
    test('disabling keeps the body built, so v-show can hide it instead', () => {
      const ctx: TestCtx = { built: true, enabled: false };

      container.watch.enabled.call(ctx, false);

      expect(ctx.built).toBe(true);
      expect(frameCallbacks).toHaveLength(0);
    });

    test('re-enabling an already built form schedules no rebuild', () => {
      const ctx: TestCtx = { built: true, enabled: true };

      container.watch.enabled.call(ctx, true);

      expect(frameCallbacks).toHaveLength(0);
      expect(ctx.built).toBe(true);
    });
  });
});
