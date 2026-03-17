import type { WatchOption } from '../types/api.ts';
import type { CaseActionName } from '../types/spi.ts';

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
  tickArchiveWhenCaseClosed: boolean;
  useCheckuserblockAccount: boolean;
  useLookup: boolean;
  defaultActions: CaseActionName[];
  interface: {
    defaultBlockDuration: string;
    displayIPv6As64: boolean;
    fullPreview: boolean;
    pinned: boolean;
    buttonLayout: boolean;
  };
  debug: {
    enabled: boolean;
    forceCheckuser: boolean;
    forceAdmin: boolean;
  };
  lastSeenVersion: string;
}
