import type {WatchOption} from "./api.ts";

export interface SelectOption {
    label: string;       // Text to display in the drop-down
    value: string;       // Value to return if this option is selected
    selected: boolean;   // Whether this item should be selected by default
    disabled?: boolean;  // Whether this item should be disabled
}

export interface BlockEntry {
    username: string;   // Username to block
    duration: string;   // Duration of block
    acb: boolean;       // Account creation blocked
    ab: boolean;        // Autoblock enabled / logged-in IP block
    ntp: boolean;       // Talk page access blocked
    nem: boolean;       // Email access blocked
    tpn: string;        // Type of talk page notice to apply
    reason?: string;    // Block reason
}

export interface TagEntry {
    username: string;     // Username to tag
    tag: string;          // Tag to apply
    altmasterTag: string; // Altmaster tag, if relevant
    blocking: boolean;    // Whether this account is also marked for block
}

export interface ParsedArchiveNotice {
    username: string; // Case username
    xwiki: boolean;   // Crosswiki flag
    deny: boolean;    // Deny flag
    notalk: boolean;  // Notalk flag
}

export interface GlobalUser {
  name: string;
  locked: boolean;
  exists_locally: boolean;
}

export interface ScriptSettings {
  watchCase: WatchOption,
  watchCaseExpiry: string,
  watchArchive: WatchOption,
  watchArchiveExpiry: string,
  watchTaggedUser: WatchOption,
  watchTaggedUserExpiry: string,
  watchNewCats: WatchOption,
  watchNewCatsExpiry: string,
  watchBlockedUser: boolean,
  watchBlockedUserExpiry: string,
  clerk: boolean,
  log: boolean,
  reversed_log: boolean,
  iUnderstandSectionMoves: boolean,
  tickArchiveWhenCaseClosed: boolean,
  useCheckuserblockAccount: boolean,
  displayIPv6As64: boolean,
  debugForceCheckuserState: boolean | null,
  debugForceAdminState: boolean | null
}