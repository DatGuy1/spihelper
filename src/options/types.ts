import type { WatchOption } from '../types/api.ts';

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
  useLookup: boolean;
  interface: {
    pinned: boolean;
    buttonLayout: boolean;
  };
  debug: {
    enabled: boolean;
    forceCheckuser: boolean;
    forceAdmin: boolean;
  };
}
