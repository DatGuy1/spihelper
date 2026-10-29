import { describe, expect, test } from 'bun:test';
import { OptionsComponent } from '../../../../src/ui/views/options/modal.ts';
import { spiHelperSettings } from '../../../../src/options';
import { spiHelperDefaultSettings } from '../../../../src/constants';
import type { ScriptSettings } from '../../../../src/options/types.ts';

interface LoadDefaultsThis {
  instanceSettings: ScriptSettings;
  resetTrigger: number;
}

const methods = OptionsComponent.methods as unknown as {
  loadDefaults(this: LoadDefaultsThis): void;
};

describe('OptionsComponent', () => {
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
