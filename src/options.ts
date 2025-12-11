// Validator type system
import type { ScriptSettings } from './types/spi.ts';

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
  // Log all actions to Special:MyPage/spihelper_log
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
  useCheckuserblockAccount: false,
  // Default IPv6 listings to /64 in the block/tag socks menu
  displayIPv6As64: true,
  // These are for debugging to view as other roles. If you're picking apart the code and
  // decide to set these (especially the CU option), it is YOUR responsibility to make sure
  // you don't do something that violates policy
  debugForceCheckuserState: null,
  debugForceAdminState: null,
};
