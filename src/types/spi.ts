import type { Tag } from '../tags.ts';
import type { BlockEntry, GlobalBlockEntry } from './api.ts';

export class ParsedArchiveNotice {
  username: string;
  crosswiki: boolean;
  deny: boolean;
  notalk: boolean;
  moot: boolean;

  constructor(opts: {
    username: string;
    crosswiki?: boolean;
    deny?: boolean;
    notalk?: boolean;
    moot?: boolean;
  }) {
    this.username = opts.username;
    this.crosswiki = opts.crosswiki ?? false;
    this.deny = opts.deny ?? false;
    this.notalk = opts.notalk ?? false;
    this.moot = opts.moot ?? false;
  }

  generateWikitext() {
    let notice = '{{SPI archive notice|1=' + this.username;
    if (this.crosswiki) {
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

export class SectionEntry {
  id: number;
  name: string;

  _text: string | null = null;
  _loadingPromise: Promise<string> | null = null;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export interface GlobalUser {
  name: string;
  locked: boolean;
  existsLocally: boolean;
}

export type ManagementFlag = 'crosswiki' | 'deny' | 'notalk' | 'moot';

// number[] represents a multi-section selection of two or more section ids
export type CaseActionSection = number | number[] | 'all' | null;

export const CASE_ACTION_NAMES = [
  'sections',
  'management',
  'block',
  'status',
  'link',
  'comment',
  'move',
  'archive',
] as const;

export type CaseActionName = typeof CASE_ACTION_NAMES[number];

export interface ActionLabel { case: string; section: string }

export interface UserRow {
  id: string;
  username: string;
  link: LinkRowData;
  block: BlockRowData;
}

/**
 * A status a section can actually be in: what normalizeCaseStatus resolves the
 * {{SPI case status}} parameter to, and what spihelper writes back
 */
export type CaseStatus
  = | 'new' | 'open' | 'closed'
    | 'CUrequest' | 'clerk' | 'admin'
    | 'inprogress' | 'checked' | 'relist'
    | 'decline' | 'cudecline'
    | 'endorse' | 'cuendorse'
    | 'moreinfo' | 'cumoreinfo'
    | 'hold' | 'cuhold';

/**
 * What the status dropdown can be set to: any real status, the two pseudo-statuses
 * spiHelperHandleStatus rewrites before writing (reopen -> open, selfendorse -> endorse),
 * and the sentinel for leaving the status alone
 */
export type CaseStatusChoice = CaseStatus | 'reopen' | 'selfendorse' | 'nochange';

export interface CaseAction<T> {
  enabled: boolean;
  data: T;
}

export interface CaseActions {
  sections: CaseAction<{ section: CaseActionSection }>;
  comment: CaseAction<{
    text: string; bySection: Map<number, { text: string; enabled: boolean }>;
  }>;
  status: CaseAction<StatusChange & {
    bySection: Map<number, SectionStatusChange>;
  }>;
  block: CaseAction<BlockActionData>;
  link: { enabled: false };
  management: CaseAction<{ flags: Set<ManagementFlag> }>;
  move: CaseAction<{ target: string; suppress: boolean; addNote: boolean }>;
  archive: { enabled: boolean };
}

/** The status a section is at, and the status it's being set to */
export interface StatusChange {
  old: CaseStatus;
  new: CaseStatusChoice;
}

/** One section's status change in a multi-section selection, which carries its own toggle */
export interface SectionStatusChange extends StatusChange {
  enabled: boolean;
}

/**
 * Everything one lookup of a user turned up, exactly as the API gave it back. Absent fields
 * mean "nothing there", a username missing from the cache means "never looked up".
 */
export interface PrefetchedUser {
  block: BlockEntry | undefined;
  userPage: string | undefined;
  globalUser: GlobalUser | undefined;
  globalBlock: GlobalBlockEntry | undefined;
}

export interface BlockActionData {
  options: BlockOptions;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  userGlobalBlocks: Map<string, boolean>;
  // Users already looked up this session, so switching sections doesn't refetch them
  fetchedUsers: Map<string, PrefetchedUser>;
  master: string;
  lockcomment: string;
  skipCUVerifyUsers: Set<string>;
}

export interface BlockOptions {
  noBlock: boolean;
  override: boolean;
  tagUnattached: boolean;
  cuBlock: boolean;
  cuBlockOnly: boolean;
  addMasterNotice: boolean;
  addSockNotice: boolean;
  blankTalk: boolean;
  lockHideNames: boolean;
}

export interface BlockRowData {
  block: boolean;
  duration: string;
  acb: boolean;
  abao: boolean;
  ntp: boolean;
  nem: boolean;
  tags: Tag[];
  lock: boolean;
}

// Whether each link tool includes this user, keyed by LinkTool.id. A missing key is unchecked
export type LinkRowData = Record<string, boolean>;

/**
 * A tool the link action builds a URL for
 */
export interface LinkTool {
  // A built-in's id from spiHelperBuiltinLinkTools, or custom-<uuid> for one the user added
  id: string;
  enabled: boolean;
  // Set on a built-in whose fields the user changed, which stops updates replacing them
  edited?: boolean;
  // Viewable name
  label: string;
  // May contain {case}, which is replaced with the case name
  url: string;
  // The query parameter the usernames go in
  userParam: string;
  // Joins the users when they share a single parameter
  separator: string;
  // Placed on both sides of each username, e.g. quotes for a phrase search
  wrapper: string;
  // Whether we repeat userParam for every user (&users=user1&users=user2)
  repeatParam: boolean;
}

export interface ArchiveSection {
  header: Date;
  fullText: string;
}

export interface MasterNeeds {
  confirmed: boolean;
  suspected: boolean;
}

export interface GlobalRequestResults {
  lockedUsers: string[];
  globalBlockedUsers: string[];
}
