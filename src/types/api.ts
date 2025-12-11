type ProtectionType = 'edit' | 'move' | 'create';

export interface SectionResult {
  tocLevel: number;
  hLevel: string;
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
  limitreportdata: Array<{
    name: string;
    0: string | number;
    1: string | number;
  }>;
}

type ParseDataMap = {
  text: ParseResponseText;
  toc: ParseResponseToc;
  limit: ParseResponseLimitData;
};

export interface ParseResponse<T extends keyof ParseDataMap> {
  parse: ParseDataMap[T];
}

export interface BlocksResponse {
  query: {
    blocks: Array<{
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
    }>;
  };
}

export interface GlobalAllUseresResponse {
  query: {
    globalallusers: Array<{
      id: number;
      name: string;
      existslocally?: string;
      locked?: string;
    }>;
  };
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

type RevisionsDataMap = {
  ids: RevisionsResponseIDs;
  content: RevisionsResponseContent;
};

export interface RevisionsResponse<T extends keyof RevisionsDataMap> {
  query: {
    pages: Array<{
      pageid: number;
      ns: number;
      title: string;
      missing?: boolean;
      revisions: Array<RevisionsDataMap[T]>;
    }>;
  };
}

export interface BacklinksResponse {
  query: {
    backlinks: Array<{
      pageid: number;
      ns: number;
      title: string;
    }>;
  };
}

export interface InfoResponse {
  query: {
    pages: Array<{
      protection: Protection[];
    }>;
  };
}

export interface FlaggedResponse {
  query: {
    pages: Array<{
      flagged?: PendingChanges;
    }>;
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

export type RelativeExpiry = string & { __type: 'RelativeExpiry' };
export type AbsoluteExpiry = string & { __type: 'AbsoluteExpiry' };
export type NoExpiry = 'infinite' | 'indefinite' | 'infinity' | 'never';

// The full MediaWiki expiry type
export type Expiry
  = | RelativeExpiry // "5 months", "2 weeks", "36 hours", etc.
    | AbsoluteExpiry // "2014-09-18T12:34:56Z"
    | NoExpiry;
