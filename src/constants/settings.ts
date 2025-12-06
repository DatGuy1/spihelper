// User-configurable settings, these are the defaults but will be updated by
// spiHelperLoadSettings()

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
