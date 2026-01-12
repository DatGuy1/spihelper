// User-configurable settings, these are the defaults but will be updated by
// spiHelperLoadSettings()

import { spiHelperIsCheckuser } from '../role.ts';
import type { ScriptSettings } from '../options/types.ts';

export const spiHelperDefaultSettings: ScriptSettings = {
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
  log: {
    enabled: false,
    reversed: false,
    page: 'spihelper_log',
  },
  clerk: true,
  iUnderstandSectionMoves: false,
  tickArchiveWhenCaseClosed: true,
  useCheckuserblockAccount: spiHelperIsCheckuser(false),
  displayIPv6As64: true,
  useLookup: true,
  interface: {
    pinned: true,
    buttonLayout: true,
  },
  debug: {
    enabled: false,
    forceCheckuser: false,
    forceAdmin: false,
  },
};

// Advert to append to the edit summary of edits
export const spiHelperAdvert = ' (using [[:w:en:WP:SPIH|spihelper.js]])';

export const FeedbackConfig = {
  title: new mw.Title('User talk:DatGuy/spihelper.js'),
  bugsLink: '//github.com/DatGuy1/spihelper/issues/new',
  showUseragentCheckbox: true,
  useragentCheckboxMessage: 'I want to share my user agent publicly alongside my feedback. This is optional.',
};
