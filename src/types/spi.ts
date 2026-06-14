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

export class SockpuppetTag {
  master: string;
  status: SockpuppetTagStatus;
  locked: boolean;
  evidence: string;
  altmaster: string;
  altmasterStatus?: AltmasterTagStatus;

  constructor(opts: {
    master: string;
    status: SockpuppetTagStatus;
    locked?: boolean;
    evidence?: string;
    altmaster?: string;
    altmasterStatus?: AltmasterTagStatus;
  }) {
    this.master = opts.master;
    this.status = opts.status;
    this.locked = opts.locked ?? false;
    this.evidence = opts.evidence ?? '';
    this.altmaster = opts.altmaster ?? '';
    this.altmasterStatus = opts.altmasterStatus;
  }

  generateWikitext(blocked?: boolean): string {
    let tag = '{{sockpuppet';
    tag += `\n| 1 = ${this.master}`;
    tag += `\n| 2 = ${this.status}`;
    if (this.locked) {
      tag += '\n| locked = yes';
    }
    // Explicit comparison to not match undefined
    if (blocked === false) {
      tag += '\n| notblocked = yes';
    }
    if (this.evidence) {
      tag += `\n| evidence = ${this.evidence}`;
    }
    if (this.altmaster) {
      tag += `\n| altmaster = ${this.altmaster}`;
      tag += `\n| altmaster-status = ${this.altmasterStatus ?? 'suspected'}`;
    }
    tag += '\n}}';
    return tag;
  }

  clone(): SockpuppetTag {
    // Intentionally don't clone this.locked
    return new SockpuppetTag({
      master: this.master,
      status: this.status,
      evidence: this.evidence,
      altmaster: this.altmaster,
      altmasterStatus: this.altmasterStatus,
    });
  };

  equals(other: Tag): boolean {
    if (!(other instanceof SockpuppetTag)) return false;
    return this.master === other.master
      && this.status === other.status
      && this.locked === other.locked
      && this.evidence === other.evidence
      && this.altmaster === other.altmaster
      && this.altmasterStatus === other.altmasterStatus;
  }
}

export class SockmasterTag {
  status: SockmasterTagStatus;
  checked: boolean;
  locked: boolean;
  ltapage: string;
  spipage: string;
  evidence: string;

  constructor(opts: {
    status: SockmasterTagStatus;
    checked?: boolean;
    locked?: boolean;
    ltapage?: string;
    spipage?: string;
    evidence?: string;
  }) {
    this.status = opts.status;
    this.checked = opts.checked ?? false;
    this.locked = opts.locked ?? false;
    this.ltapage = opts.ltapage ?? '';
    this.spipage = opts.spipage ?? '';
    this.evidence = opts.evidence ?? '';
  }

  generateWikitext(): string {
    let tag = '{{sockpuppeteer';

    // The template is very weird. 'Confirmed' is a sort of fake option
    const outputStatus = this.status === 'banned' ? 'banned' : 'blocked';
    // 'Confirmed' or 'banned' neccesitate use of the CU tool, so mark as checked
    const isChecked = this.checked || this.status !== 'blocked';

    tag += `\n| 1 = ${outputStatus}`;
    if (isChecked) {
      tag += '\n| checked = yes';
    }
    if (this.locked) {
      tag += `\n| locked = yes`;
    }
    if (this.ltapage) {
      tag += `\n| ltapage = ${this.ltapage}`;
    }
    if (this.spipage) {
      tag += `\n| spipage = ${this.spipage}`;
    }
    if (this.evidence) {
      tag += `\n| evidence = ${this.evidence}`;
    }
    tag += '\n}}';
    return tag;
  }

  clone(): SockmasterTag {
    // Intentionally don't clone this.locked
    return new SockmasterTag({
      status: this.status,
      checked: this.checked,
      ltapage: this.ltapage,
      spipage: this.spipage,
      evidence: this.evidence,
    });
  }

  equals(other: Tag): boolean {
    if (!(other instanceof SockmasterTag)) return false;
    return this.status === other.status
      && this.checked === other.checked
      && this.locked === other.locked
      && this.ltapage === other.ltapage
      && this.spipage === other.spipage
      && this.evidence === other.evidence;
  }
}

export type SockpuppetTagStatus = 'blocked' | 'proven' | 'confirmed';
export type SockmasterTagStatus = 'blocked' | 'confirmed' | 'banned';
export type AltmasterTagStatus = 'suspected' | 'proven';
export type Tag = SockmasterTag | SockpuppetTag;

export interface GlobalUser {
  name: string;
  locked: boolean;
  existsLocally: boolean;
}

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
  comment: CaseAction<{ text: string }>;
  status: CaseAction<{ old: string; new: string }>;
  block: CaseAction<BlockActionData>;
  link: { enabled: boolean };
  management: CaseAction<{ flags: Set<ManagementFlag> }>;
  move: CaseAction<{ target: string; suppress: boolean }>;
  archive: { enabled: boolean };
}

export interface BlockActionData {
  options: BlockOptions;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  userTags: Map<string, Tag[]>;
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
