// Validator type system
import { spiHelperGetAPI } from '../api.ts';
import type { ScriptSettings } from './types.ts';
import { migrateSettings } from './migration.ts';
import { spiHelperDefaultSettings } from '../constants/settings.ts';

export let spiHelperSettings: ScriptSettings = structuredClone(spiHelperDefaultSettings);
export function setGlobalSettings(settings: ScriptSettings) {
  spiHelperSettings = structuredClone(settings);
}

const saveKey = 'userjs-spihelper';

export function saveOptions() {
  return spiHelperGetAPI().saveOption(saveKey, JSON.stringify(spiHelperSettings));
}

export function loadOptions(): Record<string, unknown> | null {
  const rawData = String(mw.user.options.get(saveKey));
  try {
    return rawData ? JSON.parse(rawData) as Record<string, unknown> : null;
  }
  catch (e) {
    console.warn('Failed to parse saved options', e);
    return null;
  }
}

declare let spiHelperCustomOpts: Record<string, unknown> | undefined;

export async function migrateOptions() {
  mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'migrate' });
  try {
    await mw.loader.getScript('/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript');
    if (spiHelperCustomOpts !== undefined) {
      await migrateSettings(spiHelperCustomOpts);
    }
  }
  catch (error) {
    mw.notify('Error retrieving your spihelper-options.js', { type: 'error' });
    // More detailed error in the console
    console.error('Error getting local spihelper-options.js: ', error);
  }
}
