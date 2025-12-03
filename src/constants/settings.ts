// User-configurable settings, these are the defaults but will be updated by
// spiHelperLoadSettings()
import type { ScriptSettings } from '../types/spi.ts';

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
  reversed_log: false,
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

// Valid options for spiHelperSettings. Prevents invalid setting options being specified in the spioptions user subpage.
// This method only works options with discrete possible values. Settings without discrete possible values are checked for in spiHelperLoadSettings().
export const spiHelperValidSettings: Record<string, unknown[]> = {
  watchCase: ['preferences', 'watch', 'nochange', 'unwatch'],
  watchArchive: ['preferences', 'watch', 'nochange', 'unwatch'],
  watchTaggedUser: ['preferences', 'watch', 'nochange', 'unwatch'],
  watchNewCats: ['preferences', 'watch', 'nochange', 'unwatch'],
  watchBlockedUser: [true, false],
  clerk: [true, false],
  log: [true, false],
  reversed_log: [true, false],
  iUnderstandSectionMoves: [true, false],
  tickArchiveWhenCaseClosed: [true, false],
  useCheckuserblockAccount: [true, false],
  debugForceCheckuserState: [null, true, false],
  debugForceAdminState: [null, true, false],
};

// These user settings must be a valid date as defined by MediaWiki API. This is checked for in spiHelperValidateDate() via spiHelperLoadSettings()
export const spiHelperSettingsNeedingValidDate = [
  'watchCaseExpiry',
  'watchArchiveExpiry',
  'watchTaggedUserExpiry',
  'watchNewCatsExpiry',
  'watchBlockedUserExpiry',
];

// Advert to append to the edit summary of edits
export const spiHelperAdvert: string = ' (using [[:w:en:WP:SPIH|spihelper.js]])';
