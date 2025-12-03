// Validator type system
import type {ScriptSettings} from "./types/spi.ts";
import type {WatchOption} from "./types/api.ts";
import {spiHelperSettings} from "./constants/settings.ts";
import type {ApiParseParams} from "types-mediawiki-api";

type Validator<T> = (value: unknown) => value is T;

type SettingValidator<K extends keyof ScriptSettings> = {
  validate: Validator<ScriptSettings[K]>;
  customValidate?: (value: ScriptSettings[K]) => Promise<boolean>;
};

// Reusable validators
const validators = {
  watchOption: (value: unknown): value is WatchOption => {
    return typeof value === 'string' &&
      ['preferences', 'watch', 'nochange', 'unwatch'].includes(value);
  },

  boolean: (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  },

  nullableBoolean: (value: unknown): value is boolean | null => {
    return value === null || typeof value === 'boolean';
  },

  string: (value: unknown): value is string => {
    return typeof value === 'string';
  }
};

// Setting validators configuration
const settingValidators: {
  [K in keyof ScriptSettings]: SettingValidator<K>;
} = {
  watchCase: { validate: validators.watchOption },
  watchCaseExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate
  },
  watchArchive: { validate: validators.watchOption },
  watchArchiveExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate
  },
  watchTaggedUser: { validate: validators.watchOption },
  watchTaggedUserExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate
  },
  watchNewCats: { validate: validators.watchOption },
  watchNewCatsExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate
  },
  watchBlockedUser: { validate: validators.boolean },
  watchBlockedUserExpiry: {
    validate: validators.string,
    customValidate: spiHelperValidateDate
  },
  clerk: { validate: validators.boolean },
  log: { validate: validators.boolean },
  reversed_log: { validate: validators.boolean },
  iUnderstandSectionMoves: { validate: validators.boolean },
  tickArchiveWhenCaseClosed: { validate: validators.boolean },
  useCheckuserblockAccount: { validate: validators.boolean },
  displayIPv6As64: { validate: validators.boolean },
  debugForceCheckuserState: { validate: validators.nullableBoolean },
  debugForceAdminState: { validate: validators.nullableBoolean }
};

/**
 * Validates and applies custom options to settings
 */
export async function applyCustomSettings(
  customOpts: Record<string, unknown>,
  settings: ScriptSettings = spiHelperSettings
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
 * Returns true if the date provided is a valid date for strtotime in PHP (determined by using the time parser function and a parse API call)
 */
async function spiHelperValidateDate (dateInStringFormat: string) {
  // Is this really the best way to do this? It's pretty funny
  const response = await spiHelperParseWikitext('{{#time:r|' + dateInStringFormat + '}}')
  return !response.includes('Error: Invalid time.')
}


/**
 * Parse given text as wikitext without it needing to be currently saved onwiki.
 *
 */
async function spiHelperParseWikitext (wikitext: string) {
  // For enwiki only for now
  const api = new mw.Api()
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'text',
    text: wikitext,
    wrapoutputclass: '',
    disablelimitreport: true,
    disableeditsection: true,
    contentmodel: 'wikitext'
  };
  try {
    const response = await api.get(request);
    return response.parse.text['*']
  } catch {
    return ''
  }
}


/**
 * Checks for the existence of Special:MyPage/spihelper-options.js, and if it exists,
 * loads the settings from that page.
 */
export async function spiHelperLoadSettings () {
  // Dynamically load a user's settings
  try {
    let spiHelperCustomOpts;
    await mw.loader.getScript('/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript')
    // I have no idea if this is any good
    if (typeof spiHelperCustomOpts !== 'undefined') {
      await applyCustomSettings(spiHelperCustomOpts);
    }
  } catch (error) {
    mw.log.error('Error retrieving your spihelper-options.js')
    // More detailed error in the console
    console.error('Error getting local spihelper-options.js: ' + error)
  }
}