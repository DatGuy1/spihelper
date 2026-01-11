// Validator type system
import { spiHelperIsCheckuser } from '../role.ts';
import { spiHelperGetAPI } from '../api.ts';
import type { ScriptSettings } from './types.ts';
import { migrateSettings } from './migration.ts';

export const spiHelperSettings: ScriptSettings = {
  // Choices are 'watch' (unconditionally add to watchlist), 'preferences'
  // (follow default preferences), 'nochange' (don't change the watchlist
  // status of the page), and 'unwatch' (unconditionally remove)
  watch: {
    case: 'preferences',
    archive: 'nochange',
    tagged: 'preferences',
    categories: 'nochange',
    blocked: true,
  },
  expiry: {
    case: 'indefinite',
    archive: 'indefinite',
    tagged: 'indefinite',
    categories: 'indefinite',
    blocked: 'indefinite',
  },
  // Log all actions to log.page
  log: {
    enabled: false,
    reversed: false,
    page: 'spihelper_log',
  },
  // Lets people disable clerk options if they're not a clerk
  clerk: true,
  // Enable the "move section" button
  iUnderstandSectionMoves: false,
  // Automatically tick the "Archive case" option if the case is closed
  tickArchiveWhenCaseClosed: true,
  // Use checkuserblock-account when CU blocking. False when not a CU, by default true when a CU
  useCheckuserblockAccount: spiHelperIsCheckuser(false),
  // Default IPv6 listings to /64 in the block/tag socks menu
  displayIPv6As64: true,
  // Whether to lookup usernames and pages while writing in the menu
  useLookup: true,
  interface: {
    // Should we pin the top view to the top, or make it sticky
    pinned: true,
    // Whether to use the button layout (true) or the accordion layout (false)
    buttonLayout: true,
  },
  // These are for debugging to view as other roles. If you're picking apart the code and
  // decide to set these (especially the CU option), it is YOUR responsibility to make sure
  // you don't do something that violates policy
  debug: {
    enabled: false,
    forceCheckuser: false,
    forceAdmin: false,
  },
};

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
