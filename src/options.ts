// Validator type system
import type { ScriptSettings } from './types/spi.ts';
import type { WatchOption } from './types/api.ts';
import type { ApiParseParams } from 'types-mediawiki-api';
import { spiHelperGetAPI } from './api.ts';

type Validator<T> = (value: unknown) => value is T;

type SettingValidator<K extends keyof ScriptSettings> = {
  validate: Validator<ScriptSettings[K]>;
  customValidate?: (value: ScriptSettings[K]) => Promise<boolean>;
};

// Reusable validators
const validators = {
  watchOption: (value: unknown): value is WatchOption => {
    return typeof value === 'string'
      && ['preferences', 'watch', 'nochange', 'unwatch'].includes(value);
  },

  boolean: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },

  nullableBoolean: (value: unknown): value is boolean | null => {
    return value === null || typeof value === 'boolean';
  },

  string: (value: unknown): value is string => {
    return typeof value === 'string';
  },
};

// Setting validators configuration
const settingValidators: {
  [K in keyof ScriptSettings]: SettingValidator<K>;
} = {
  watchCase: { validate: validators.watchOption },
  watchCaseExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate,
  },
  watchArchive: { validate: validators.watchOption },
  watchArchiveExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate,
  },
  watchTaggedUser: { validate: validators.watchOption },
  watchTaggedUserExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate,
  },
  watchNewCats: { validate: validators.watchOption },
  watchNewCatsExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate,
  },
  watchBlockedUser: { validate: validators.boolean },
  watchBlockedUserExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate,
  },
  clerk: { validate: validators.boolean },
  log: { validate: validators.boolean },
  reversedLog: { validate: validators.boolean },
  iUnderstandSectionMoves: { validate: validators.boolean },
  tickArchiveWhenCaseClosed: { validate: validators.boolean },
  useCheckuserblockAccount: { validate: validators.boolean },
  displayIPv6As64: { validate: validators.boolean },
  debugForceCheckuserState: { validate: validators.nullableBoolean },
  debugForceAdminState: { validate: validators.nullableBoolean },
};

export const spiHelperSettings: ScriptSettings = {
  // Choices are 'watch' (unconditionally add to watchlist), 'preferences'
  // (follow default preferences), 'nochange' (don't change the watchlist
  // status of the page), and 'unwatch' (unconditionally remove)
  watchCase: 'preferences',
  watchCaseExpiry: 'indefinite',
  watchArchive: 'nochange',
  watchArchiveExpiry: 'indefinite',
  watchTaggedUser: 'preferences',
  watchTaggedUserExpiry: 'indefinite',
  watchNewCats: 'nochange',
  watchNewCatsExpiry: 'indefinite',
  watchBlockedUser: true,
  watchBlockedUserExpiry: 'indefinite',
  // Lets people disable clerk options if they're not a clerk
  clerk: true,
  // Log all actions to Special:MyPage/spihelper_log
  log: false,
  // Reverse said log, so that the newest actions are at the top.
  reversedLog: false,
  // Enable the "move section" button
  iUnderstandSectionMoves: false,
  // Automatically tick the "Archive case" option if the case is closed
  tickArchiveWhenCaseClosed: true,
  // Use checkuserblock-account when CU blocking. False when not a CU, by default true when a CU
  useCheckuserblockAccount: false,
  // Default IPv6 listings to /64 in the block/tag socks menu
  displayIPv6As64: true,
  // These are for debugging to view as other roles. If you're picking apart the code and
  // decide to set these (especially the CU option), it is YOUR responsibility to make sure
  // you don't do something that violates policy
  debugForceCheckuserState: null,
  debugForceAdminState: null,
};

/**
 * Validates and applies custom options to settings
 */
export async function applyCustomSettings(
  customOpts: Record<string, unknown>,
  settings: ScriptSettings,
): Promise<void> {
  for (const [key, value] of Object.entries(customOpts)) {
    // Check if key exists in settings
    if (!(key in settingValidators)) {
      mw.log.warn(`Unknown option in spihelper-options.js: ${key}`);
      continue;
    }

    const typedKey = key as keyof ScriptSettings;
    const validator = settingValidators[typedKey];

    // Type validation
    if (!validator.validate(value)) {
      mw.log.warn(`Invalid type for setting "${key}" in spihelper-options.js`);
      continue;
    }

    // Custom validation (e.g., date validation)
    if (validator.customValidate) {
      const isValid = await validator.customValidate(value as never);
      if (!isValid) {
        mw.log.warn(`Invalid value for setting "${key}" in spihelper-options.js`);
        continue;
      }
    }

    // All validations passed - apply the setting
    settings[typedKey] = value as never;
  }
}

/**
 * Returns true if the date provided is a valid date for strtotime in PHP,
 * determined by using the time parser function and a parse API call
 */
async function spiHelperValidateDate(dateInStringFormat: string) {
  // Is this really the best way to do this? It's pretty funny
  const response = await spiHelperParseWikitext('{{#time:r|' + dateInStringFormat + '}}');
  return !response.includes('Error: Invalid time.');
}

/**
 * Parse given text as wikitext without it needing to be currently saved onwiki.
 *
 */
async function spiHelperParseWikitext(wikitext: string) {
  // For enwiki only for now
  const api = spiHelperGetAPI();
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'text',
    text: wikitext,
    wrapoutputclass: '',
    disablelimitreport: true,
    disableeditsection: true,
    contentmodel: 'wikitext',
  };
  try {
    const response = await api.get(request);
    return response.parse.text['*'];
  }
  catch {
    return '';
  }
}

declare global {
  let spiHelperCustomOpts: Record<string, unknown>;
}

/**
 * Checks for the existence of Special:MyPage/spihelper-options.js, and if it exists,
 * loads the settings from that page.
 */
export async function spiHelperLoadSettings() {
  // Dynamically load a user's settings
  const settings = spiHelperSettings;
  try {
    await mw.loader.getScript('/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript');
    // I have no idea if this is any good
    if (typeof spiHelperCustomOpts !== 'undefined') {
      await applyCustomSettings(spiHelperCustomOpts, settings);
    }
  }
  catch (error) {
    mw.log.error('Error retrieving your spihelper-options.js');
    // More detailed error in the console
    console.error('Error getting local spihelper-options.js: ' + error);
  }
  return settings;
}
