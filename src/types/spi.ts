import type { WatchOption } from './api.ts';
import { spiHelperGetPageText } from '../api.ts';
import { context } from '../context.ts';

export type SectionSelection = | { type: 'all' } | { type: 'specific'; section: SectionEntry };

export type TableType = 'block' | 'link';

export interface SelectOption {
  label: string; // Text to display in the drop-down
  value: string; // Value to return if this option is selected
  selected: boolean; // Whether this item should be selected by default
  disabled?: boolean; // Whether this item should be disabled
}

export interface BlockEntry {
  username: string; // Username to block
  duration: string; // Duration of block
  acb: boolean; // Account creation blocked
  ab: boolean; // Autoblock enabled / logged-in IP block
  ntp: boolean; // Talk page access blocked
  nem: boolean; // Email access blocked
  tpn: string; // Type of talk page notice to apply
  reason?: string; // Block reason
}

export interface TagEntry {
  username: string; // Username to tag
  tag: string; // Tag to apply
  altmasterTag: string; // Altmaster tag, if relevant
  blocking: boolean; // Whether this account is also marked for block
}

export class SectionEntry {
  private _text: string | null = null;

  constructor(public readonly id: number, public readonly name: string) {
  }

  async getText() {
    if (this._text !== null) return this._text;
    this._text = await spiHelperGetPageText(context.pageName, false, this.id);
    return this._text;
  }
}

export class ParsedArchiveNotice {
  username: string;
  xwiki: boolean;
  deny: boolean;
  notalk: boolean;
  moot: boolean;

  constructor(
    username: string = context.caseName,
    xwiki: boolean = false,
    deny: boolean = false,
    notalk: boolean = false,
    moot: boolean = false,
  ) {
    this.username = username;
    this.xwiki = xwiki;
    this.deny = deny;
    this.notalk = notalk;
    this.moot = moot;
  }

  generateWikitext() {
    let notice = '{{SPI archive notice|1=' + this.username;
    if (this.xwiki) {
      notice += '|crosswiki=yes';
    }
    if (this.deny) {
      notice += '|deny=yes';
    }
    if (this.notalk) {
      notice += '|notalk=yes';
    }
    if (this.moot) {
      notice += '|moot=yes';
    }
    notice += '}}';

    return notice;
  }
}

export interface GlobalUser {
  name: string;
  locked: boolean;
  existsLocally: boolean;
}

export interface ScriptSettings {
  watch: {
    case: WatchOption;
    archive: WatchOption;
    tagged: WatchOption;
    categories: WatchOption;
    blocked: boolean;
  };
  expiry: {
    case: string;
    archive: string;
    tagged: string;
    categories: string;
    blocked: string;
  };
  clerk: boolean;
  log: {
    enabled: boolean;
    reversed: boolean;
    page: string;
  };
  iUnderstandSectionMoves: boolean;
  tickArchiveWhenCaseClosed: boolean;
  useCheckuserblockAccount: boolean;
  displayIPv6As64: boolean;
  debugForceCheckuserState: boolean | null;
  debugForceAdminState: boolean | null;
}

export interface CaseActions {
  Status: boolean;
  Block: boolean;
  Link: boolean;
  Note: boolean;
  Close: boolean;
  Rename: boolean;
  Archive: boolean;
  SpiMgmt: boolean;
}
