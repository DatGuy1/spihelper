import type { LinkRowData } from './spi.ts';

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
