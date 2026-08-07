import {
  type Icon,
  cdxIconBlock,
  cdxIconCancel,
  cdxIconCheck,
  cdxIconCheckAll,
  cdxIconHelp,
} from '@wikimedia/codex-icons';
import type {
  AltmasterTagStatus,
  LinkRowData,
  SockmasterTagStatus,
  SockpuppetTagStatus,
  Tag,
} from './spi.ts';

export const WatchOptionsSelect = [
  { label: 'Follow preferences', value: 'preferences' },
  { label: 'No change', value: 'nochange' },
  { label: 'Watch', value: 'watch' },
  { label: 'Unwatch', value: 'unwatch' },
];

export const WatchOptions = ['preferences', 'watch', 'nochange', 'unwatch'];

export const DefaultLinkRowData: LinkRowData = {
  analyser: false,
  timeline: false,
  timecard: false,
  pages: false,
  summary: false,
  cuwiki: false,
  interleaved: false,
};

export type SelectionType = 'section' | 'case' | 'both';

export interface FeedbackDialog {
  launch: ((contents?: {
    subject?: string;
    message?: string;
  }) => void);
}

export type InputColumn = 'block' | 'duration' | 'acb' | 'abao' | 'ntp' | 'nem' | 'lock';

export interface TagRowPopoverState {
  anchor: HTMLElement | null;
  open: boolean;
  tagIndex: number;
  rowId: string | null;
  sourceTag: Tag | null;
}

export interface TagStatusDisplay {
  label: string;
  icon: Icon;
}

export const SockpuppetTagStatuses: Record<SockpuppetTagStatus, TagStatusDisplay> = {
  blocked: { label: 'Suspected', icon: cdxIconHelp },
  proven: { label: 'Proven', icon: cdxIconCheck },
  confirmed: { label: 'Confirmed', icon: cdxIconCheckAll },
};

export const SockmasterTagStatuses: Record<SockmasterTagStatus, TagStatusDisplay> = {
  blocked: { label: 'Blocked', icon: cdxIconBlock },
  confirmed: { label: 'Confirmed', icon: cdxIconCheckAll },
  banned: { label: '3X Banned', icon: cdxIconCancel },
};

export const AltmasterTagStatuses: Record<AltmasterTagStatus, TagStatusDisplay> = {
  suspected: { label: 'Suspected', icon: cdxIconHelp },
  proven: { label: 'Proven', icon: cdxIconCheck },
};
