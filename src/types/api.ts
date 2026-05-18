type ProtectionType = 'edit' | 'move' | 'create';

export interface SectionResult {
  tocLevel: number;
  hLevel: number;
  line: string;
  number: string;
  index: string;
  anchor: string;
}

export interface Protection {
  type: ProtectionType;
  level: string;
  expiry: string;
}

export interface PendingChanges {
  stable_revid: number;
  level: number;
  level_text: string;
  protection_level: 'autoconfirmed' | 'none';
  protection_expiry: string;
}

export interface NewPendingChanges {
  level: 'autoconfirmed' | 'none' | '';
  expiry?: string;
}

export type WatchOption = 'preferences' | 'watch' | 'nochange' | 'unwatch';

interface ParseResponseBase {
  title: string;
  pageid: number;
}

interface ParseResponseText extends ParseResponseBase {
  text: { '*': string };
}

interface ParseResponseToc extends ParseResponseBase {
  tocdata: {
    sections: SectionResult[];
  };
}

interface ParseResponseLimitData extends ParseResponseBase {
  limitreportdata: {
    name: string;
    0: string | number;
    1: string | number;
  }[];
}

interface ParseDataMap {
  text: ParseResponseText;
  toc: ParseResponseToc;
  limit: ParseResponseLimitData;
}

export interface ParseResponse<T extends keyof ParseDataMap> {
  parse?: ParseDataMap[T];
}

export interface BlockEntry {
  // Username to block
  username: string;
  // Duration of block
  duration: string;
  // Account creation blocked
  acb: boolean;
  // Autoblock enabled / logged-in IP block
  abao: boolean;
  // Talk page access blocked
  ntp: boolean;
  // Email access blocked
  nem: boolean;
  // Block reason
  reason: string;
}

export interface BlocksResponse {
  query: {
    blocks: {
      user: string;
      expiry: string;
      reason: string;
      automatic: boolean;
      anononly: boolean;
      nocreate: boolean;
      autoblock: boolean;
      noemail: boolean;
      hidden: boolean;
      allowusertalk: boolean;
      partial: boolean;
    }[];
  };
}

export interface CategoriesResponse {
  query: {
    pages: {
      pageid: number;
      ns: number;
      title: string;
      categories?: {
        ns: number;
        title: string;
      }[];
    }[];
  };
}

export interface GlobalAllUsersResponse {
  query: {
    globalallusers: {
      id: number;
      name: string;
      existslocally?: string;
      locked?: string;
    }[];
  };
}

export interface AllUsersResponse {
  query: {
    allusers: AllUser[];
  };
}

export interface AllUser {
  userid: number;
  name: string;
  attachedlocal?: {
    CentralAuth: boolean;
    local: boolean;
  };
  blockid?: number;
  blockexpiry?: string;
  blocknocreate?: boolean;
  blockanononly?: boolean;
  blockautoblocking?: boolean;
  blockemail?: boolean;
  blockowntalk?: boolean;
}

export interface AllPagesResponse {
  query: {
    allpages: AllPage[];
  };
}

export interface AllPage {
  pageid: number;
  ns: number;
  title: string;
}

interface RevisionsResponseIDs {
  revid: number;
  parentid: number;
}

interface RevisionsResponseContent {
  slots: {
    main: {
      contentmodel: string;
      contentformat: string;
      content: string;
    };
  };
}

interface RevisionsDataMap {
  ids: RevisionsResponseIDs;
  content: RevisionsResponseContent;
}

export interface RevisionsResponse<T extends keyof RevisionsDataMap> {
  query: {
    pages: {
      pageid: number;
      ns: number;
      title: string;
      missing?: boolean;
      revisions?: RevisionsDataMap[T][];
    }[];
  };
}

export interface BacklinksResponse {
  query: {
    backlinks: {
      pageid: number;
      ns: number;
      title: string;
    }[];
  };
}

export interface InfoResponse {
  query: {
    pages: {
      protection: Protection[];
    }[];
  };
}

export interface FlaggedResponse {
  query: {
    pages: {
      flagged?: PendingChanges;
    }[];
  };
}

export interface EditResponse {
  edit: {
    newrevid?: number;
    nochange?: boolean;
  };
}

export interface Restrictions {
  types: string[];
  levels: string[];
  cascadinglevels: string[];
  semiprotectedlevels: string[];
}

export interface SiteInfoResponse {
  query: {
    restrictions: Restrictions;
  };
}

export interface CategoryMembersResponse {
  query: {
    categorymembers: {
      pageid: number;
      ns: number;
      title: string;
    }[];
  };
}

export interface BlockActionResponse {
  block: {
    user: string;
    id: number;
  };
}

export type RelativeExpiry = string & { __type: 'RelativeExpiry' };
export type AbsoluteExpiry = string & { __type: 'AbsoluteExpiry' };
export type NoExpiry = 'infinite' | 'indefinite' | 'infinity' | 'never';

// The full MediaWiki expiry type
export type Expiry
  = | RelativeExpiry // "5 months", "2 weeks", "36 hours", etc.
    | AbsoluteExpiry // "2014-09-18T12:34:56Z"
    | NoExpiry;
