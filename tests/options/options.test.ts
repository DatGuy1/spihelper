import { describe, expect, test } from 'bun:test';
import { mergeOptions } from '../../src/options/options.ts';
import { spiHelperDefaultSettings } from '../../src/constants/settings.ts';
import type { ScriptSettings } from '../../src/options/types.ts';

describe('mergeOptions', () => {
  const freshSettings = (): ScriptSettings => structuredClone(spiHelperDefaultSettings);

  describe('nested groups', () => {
    test('keeps the default of a key the saved group predates', () => {
      const settings = freshSettings();
      // Saved before defaultBlockDuration existed
      const saved = JSON.parse(JSON.stringify({
        interface: { displayIPv6As64: false, fullPreview: true, pinned: false, buttonLayout: true },
      })) as Record<string, unknown>;

      mergeOptions(settings, saved);

      expect(settings.interface).toEqual({
        defaultBlockDuration: spiHelperDefaultSettings.interface.defaultBlockDuration,
        displayIPv6As64: false,
        fullPreview: true,
        pinned: false,
        buttonLayout: true,
      });
    });

    test('leaves groups the saved options lack untouched', () => {
      const settings = freshSettings();

      mergeOptions(settings, { clerk: false });

      expect(settings.clerk).toBe(false);
      expect(settings.watch).toEqual(spiHelperDefaultSettings.watch);
    });
  });

  describe('arrays', () => {
    test('replaces rather than merges them', () => {
      const settings = freshSettings();
      settings.defaultActions = ['comment', 'block'];

      mergeOptions(settings, { defaultActions: ['archive'] });

      expect(settings.defaultActions).toEqual(['archive']);
    });
  });

  test('replaces a group when the saved value is not an object', () => {
    const settings = freshSettings();

    mergeOptions(settings, { log: null });

    expect(settings.log as unknown).toBeNull();
  });

  test('ignores a __proto__ key instead of writing to Object.prototype', () => {
    const settings = freshSettings();
    const saved = JSON.parse('{"__proto__": {"polluted": true}}') as Record<string, unknown>;

    mergeOptions(settings, saved);

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  test('does not touch the defaults it was cloned from', () => {
    const settings = freshSettings();

    mergeOptions(settings, { interface: { pinned: false } });

    expect(spiHelperDefaultSettings.interface.pinned).toBe(true);
  });
});
