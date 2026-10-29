import { afterAll, beforeAll, describe, expect, mock, spyOn, test } from 'bun:test';
import { compile, reactive, toRaw } from 'vue';
import { OptionsComponent } from '../../../../src/ui/views/options/modal.ts';
import * as optionsModule from '../../../../src/options/options.ts';
import { spiHelperSettings } from '../../../../src/options';
import { spiHelperBuiltinLinkTools, spiHelperDefaultSettings } from '../../../../src/constants';
import type { ScriptSettings } from '../../../../src/options/types.ts';
import type { LinkTool } from '../../../../src/types';
import { setToRaw } from '../../../../src/ui/runtime.ts';

interface LoadDefaultsThis {
  instanceSettings: ScriptSettings;
  resetTrigger: number;
}

interface SettingsThis {
  instanceSettings: ScriptSettings;
  expandedLinkTool: string | null;
}

interface CloseThis {
  instanceSettings: ScriptSettings;
  oldSettings: ScriptSettings;
  showExtraHandler: null;
  toaster: { info: () => string; success: () => void; error: () => void; dismiss: () => void };
}

const methods = OptionsComponent.methods as unknown as {
  loadDefaults(this: LoadDefaultsThis): void;
  addLinkTool(this: SettingsThis): void;
  restoreBuiltinLinkTools(this: SettingsThis): void;
  linkToolPreview(tool: LinkTool): { href: string; text: string } | null;
};

const watchers = OptionsComponent.watch as unknown as {
  open(this: CloseThis, newVal: boolean): void;
};

// The dialog is filled from the global, which on a real page has been through reconcileLinkTools
const freshSettings = (): ScriptSettings => structuredClone(spiHelperDefaultSettings);

describe('OptionsComponent', () => {
  // The component works on reactive copies, so these run with Vue's toRaw as bootstrap installs it
  beforeAll(() => {
    setToRaw(toRaw);
  });
  afterAll(() => {
    setToRaw(<T>(observed: T) => observed);
  });

  test('template compiles cleanly', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      compile(OptionsComponent.template as string);
      expect(warn).not.toHaveBeenCalled();
    }
    finally {
      warn.mockRestore();
    }
  });

  describe('link tools', () => {
    const makeThis = (): SettingsThis => ({
      instanceSettings: freshSettings(),
      expandedLinkTool: null,
    });

    test('adds user tools at the end, switched on and open for editing', () => {
      const context = makeThis();

      methods.addLinkTool.call(context);
      methods.addLinkTool.call(context);

      const added = context.instanceSettings.linkTools.slice(spiHelperBuiltinLinkTools.length);
      expect(added).toHaveLength(2);
      expect(new Set(added.map(t => t.id)).size).toBe(2);
      expect(added.every(t => t.id.startsWith('custom-') && t.enabled)).toBe(true);
      expect(context.expandedLinkTool).toBe(added[1]?.id ?? null);
    });

    describe('preview', () => {
      const tool = (id: string): LinkTool => {
        const found = spiHelperBuiltinLinkTools.find(t => t.id === id);
        if (!found) throw new Error(`No built-in link tool ${id}`);
        return { ...found };
      };

      test('links to the real URL but shows the separator as typed', () => {
        expect(methods.linkToolPreview(tool('timecard'))).toEqual({
          href: 'https://sandals.toolforge.org/timecard?users=Sock1%7CSock2',
          text: 'https://sandals.toolforge.org/timecard?users=Sock1|Sock2',
        });
      });

      test('fills in the sample case', () => {
        expect(methods.linkToolPreview(tool('spitools-pages'))?.text)
          .toBe('https://spi-tools.toolforge.org/spi/pages/Master?users=Sock1&users=Sock2');
      });

      test('is absent while the tool has a problem', () => {
        expect(methods.linkToolPreview({ ...tool('timecard'), url: 'http://insecure.example/' })).toBeNull();
      });
    });

    test('restoring built-ins undoes edits in place', () => {
      const context = reactive(makeThis());
      const timeline = context.instanceSettings.linkTools.find(t => t.id === 'timeline');
      if (!timeline) throw new Error('No timeline tool');
      timeline.url = 'https://mine.example/';

      methods.restoreBuiltinLinkTools.call(context);

      expect(context.instanceSettings.linkTools).toEqual(spiHelperDefaultSettings.linkTools);
      // Proxies left inside the list would make the next save throw
      expect(() => structuredClone(toRaw(context.instanceSettings))).not.toThrow();
    });
  });

  describe('closing', () => {
    const saveOptions = spyOn(optionsModule, 'saveOptions').mockImplementation(
      () => ({ then: () => ({ catch: () => ({ always: () => undefined }) }) }) as never,
    );
    // Closing with changes replaces the global, which other files read
    const originalSettings = optionsModule.spiHelperSettings;
    afterAll(() => {
      saveOptions.mockRestore();
      optionsModule.setGlobalSettings(originalSettings);
    });

    const close = (instanceSettings: ScriptSettings) => {
      saveOptions.mockClear();
      const context = reactive<CloseThis>({
        instanceSettings,
        oldSettings: freshSettings(),
        showExtraHandler: null,
        toaster: { info: mock(() => 'id'), success: mock(), error: mock(), dismiss: mock() },
      });
      watchers.open.call(context, false);
      return context;
    };

    test('does not save when nothing changed', () => {
      close(freshSettings());
      expect(saveOptions).not.toHaveBeenCalled();
    });

    test('flags an edited built-in so the next load keeps it', () => {
      const settings = freshSettings();
      const timeline = settings.linkTools.find(t => t.id === 'timeline');
      if (!timeline) throw new Error('No timeline tool');
      timeline.label = 'Mine';

      const context = close(settings);

      const saved = context.instanceSettings.linkTools.find((t: LinkTool) => t.id === 'timeline');
      expect(saved?.edited).toBe(true);
      expect(saveOptions).toHaveBeenCalledTimes(1);
    });

    test('applies a change to the global settings, link tools included', () => {
      const settings = freshSettings();
      const analyser = settings.linkTools.find(t => t.id === 'analyser');
      if (!analyser) throw new Error('No analyser tool');
      analyser.enabled = false;
      settings.clerk = false;

      close(settings);

      expect(saveOptions).toHaveBeenCalledTimes(1);
      expect(optionsModule.spiHelperSettings.clerk).toBe(false);
      expect(optionsModule.spiHelperSettings.linkTools.find(t => t.id === 'analyser')?.enabled).toBe(false);
    });
  });

  describe('loadDefaults', () => {
    const run = () => {
      const context: LoadDefaultsThis = {
        instanceSettings: structuredClone(spiHelperSettings),
        resetTrigger: 0,
      };
      context.instanceSettings.interface.pinned = false;
      methods.loadDefaults.call(context);
      return context;
    };

    test('resets the dialog copy to a detached copy of the defaults', () => {
      const context = run();

      expect(context.instanceSettings).toEqual(spiHelperDefaultSettings);
      expect(context.instanceSettings.interface).not.toBe(spiHelperDefaultSettings.interface);
      expect(context.resetTrigger).toBe(1);
    });

    test('leaves the global settings for the close watcher to apply', () => {
      const before = spiHelperSettings.interface;

      run();

      expect(spiHelperSettings.interface).toBe(before);
      expect(spiHelperSettings.interface).not.toBe(spiHelperDefaultSettings.interface);
    });
  });
});
