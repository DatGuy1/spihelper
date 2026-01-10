import type { LinkRow, SockRow } from './spi.ts';

export const WatchOptionsSelect = [
  { label: 'Follow preferences', value: 'preferences' },
  { label: 'No change', value: 'nochange' },
  { label: 'Watch', value: 'watch' },
  { label: 'Unwatch', value: 'unwatch' },
];

export const WatchOptions = ['preferences', 'watch', 'nochange', 'unwatch'];

export const DefaultSockRow: SockRow = {
  username: '',
  block: false,
  duration: '',
  acb: true,
  abao: true,
  ntp: false,
  nem: false,
  tag: 'none',
  altmaster: 'none',
  lock: false,
};

export const DefaultLinkRow: LinkRow = {
  username: '',
  analyser: false,
  timeline: false,
  timecard: false,
  pages: false,
  summary: false,
  cuwiki: false,
};

export type SelectionType = 'section' | 'case' | 'both';
