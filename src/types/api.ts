type ProtectionType = "edit" | "move" | "create";

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
  protection_level: "autoconfirmed" | "none";
  protection_expiry: string;
}

export interface NewPendingChanges {
  level: "autoconfirmed" | "none" | "";
  expiry?: string;
}

export type WatchOption = "preferences" | "watch" | "nochange" | "unwatch";