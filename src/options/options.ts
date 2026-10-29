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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Lays saved options over the current settings. Nested objects are merged key by key, so
 * a setting added to a group after the user last saved keeps its default rather than the
 * saved group replacing it wholesale. Arrays and primitives are replaced.
 *
 * @param target Mutated in place to receive the saved options
 * @param saved The saved options, as read by loadOptions
 */
export function mergeOptions(target: object, saved: Record<string, unknown>) {
  const targetRecord = target as Record<string, unknown>;
  for (const [key, value] of Object.entries(saved)) {
    // JSON.parse makes __proto__ an own key, and recursing into it would write to Object.prototype
    if (key === '__proto__') {
      continue;
    }
    const current = targetRecord[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      mergeOptions(current, value);
    }
    else {
      targetRecord[key] = value;
    }
  }
}

declare let spiHelperCustomOpts: Record<string, unknown> | undefined;

export async function migrateOptions() {
  mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'migrate' });
  try {
    const optionsPage = `User:${mw.config.get('wgUserName')}/spihelper-options.js`;
    await mw.loader.getScript(mw.util.getUrl(optionsPage, { action: 'raw', ctype: 'text/javascript' }));
    if (spiHelperCustomOpts !== undefined) {
      await migrateSettings(spiHelperCustomOpts, spiHelperSettings);
    }
  }
  catch (error) {
    mw.notify('Error retrieving your spihelper-options.js', { type: 'error' });
    // More detailed error in the console
    console.error('Error getting local spihelper-options.js: ', error);
  }
}
