import { context } from '../context.ts';
import type { BlockEntry } from './api.ts';

export class ParsedArchiveNotice {
  username: string;
  crosswiki: boolean;
  deny: boolean;
  notalk: boolean;
  moot: boolean;

  constructor(opts?: {
    username: string;
    crosswiki?: boolean;
    deny?: boolean;
    notalk?: boolean;
    moot?: boolean;
  }) {
    this.username = opts?.username ?? context.caseName;
    this.crosswiki = opts?.crosswiki ?? false;
    this.deny = opts?.deny ?? false;
    this.notalk = opts?.notalk ?? false;
    this.moot = opts?.moot ?? false;
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

export interface GlobalUser {
  name: string;
  locked: boolean;
  existsLocally: boolean;
}

type SockTag = 'Ssuspected' | 'Sproven' | 'Sconfirmed';
type MasterTag = 'Mblocked' | 'Mconfirmed' | 'Mbanned';
export type Tag = SockTag | MasterTag | 'none';
export type AltmasterTag = 'suspected' | 'proven' | 'none';

export type ManagementFlag = 'crosswiki' | 'deny' | 'notalk' | 'moot';

export type CaseActionSection = number | 'all' | null;

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

export interface CaseAction<T> {
  enabled: boolean;
  data: T;
}

export interface CaseActions {
  sections: CaseAction<{ section: CaseActionSection }>;
  comment: CaseAction<{ text: string }>;
  status: CaseAction<{ old: string; new: string }>;
  block: CaseAction<BlockActionData>;
  link: CaseAction<{ rows: LinkRow[] }>;
  management: CaseAction<{ flags: Set<ManagementFlag> }>;
  move: CaseAction<{ target: string }>;
  archive: { enabled: boolean };
}

export interface BlockActionData {
  accounts: SockRow[];
  options: BlockOptions;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  userTags: Map<string, Tag>;
  master: string;
  altmaster: string;
  lockcomment: string;
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

export interface SockRow {
  username: string;
  block: boolean;
  duration: string;
  acb: boolean;
  abao: boolean;
  ntp: boolean;
  nem: boolean;
  tag: Tag;
  altmaster: AltmasterTag;
  lock: boolean;
}

export interface LinkRow {
  username: string;
  analyser: boolean;
  timeline: boolean;
  timecard: boolean;
  pages: boolean;
  summary: boolean;
  cuwiki: boolean;
}

export interface ArchiveSection {
  header: Date;
  fullText: string;
}
