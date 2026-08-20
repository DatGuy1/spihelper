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

export interface CaseAction<T> {
  enabled: boolean;
  data: T;
}

export interface CaseActions {
  sections: CaseAction<{ section: CaseActionSection }>;
  comment: CaseAction<{
    text: string; bySection: Map<number, { text: string; enabled: boolean }>;
  }>;
  status: CaseAction<{
    old: string; new: string;
    bySection: Map<number, { old: string; new: string; enabled: boolean }>;
  }>;
  block: CaseAction<BlockActionData>;
  link: { enabled: boolean };
  management: CaseAction<{ flags: Set<ManagementFlag> }>;
  move: CaseAction<{ target: string; suppress: boolean; addNote: boolean }>;
  archive: { enabled: boolean };
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

export interface LinkRowData {
  analyser: boolean;
  timeline: boolean;
  timecard: boolean;
  pages: boolean;
  summary: boolean;
  cuwiki: boolean;
  interleaved: boolean;
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
