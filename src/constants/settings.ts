import type { ScriptSettings } from '../options/types.ts';

// Advert to append to the edit summary of edits
export const spiHelperAdvert = ' (using [[:w:en:User:DatGuy/spihelper|User:DatGuy/spihelper.js]])';

export const FeedbackConfig = {
  title: new mw.Title('User talk:DatGuy/spihelper'),
  bugsLink: '//github.com/DatGuy1/spihelper/issues/new',
  showUseragentCheckbox: true,
  useragentCheckboxMessage: 'I want to share my user agent publicly alongside my feedback. This is optional.',
};

// @ts-expect-error Ignore __VERSION__ not existing error because Bun should replace it on compile
export const VERSION: string = __VERSION__ as string;
// @ts-expect-error Same as above
export const MODE = __MODE__ as 'live' | 'dev' | 'production';

// User-configurable settings, these are the defaults but will be updated by
// spiHelperLoadSettings()
export const spiHelperDefaultSettings: ScriptSettings = {
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
  // Automatically tick the "Archive case" option if the case is closed
  tickArchiveWhenCaseClosed: false,
  // Use checkuserblock-account when CU blocking. False when not a CU, by default true when a CU
  useCheckuserblockAccount: mw.config.get('wgUserGroups')?.includes('checkuser') ?? false,
  // Whether to lookup usernames and pages while writing in the menu
  useLookup: true,
  // Actions that should start enabled by default
  // Can this be merged with tickArchiveWhenCaseClosed?
  defaultActions: ['comment'],
  interface: {
    // Default block duration to prefill
    defaultBlockDuration: 'indefinite',
    // Default IPv6 listings to /64 in the block/tag socks menu
    displayIPv6As64: true,
    // Should we include the entire section in the comment preview box
    fullPreview: false,
    // Should we pin the top view to the top, or make it sticky
    pinned: true,
    // Whether to use the button layout (true) or the accordion layout (false)
    buttonLayout: true,
  },
  // Should we highlight the selected section
  highlightSection: true,
  // These are for debugging to view as other roles. If you're picking apart the code and
  // decide to set these (especially the CU option), it is YOUR responsibility to make sure
  // you don't do something that violates policy
  debug: {
    enabled: false,
    forceCheckuser: false,
    forceAdmin: false,
  },
  lastSeenVersion: VERSION,
};
