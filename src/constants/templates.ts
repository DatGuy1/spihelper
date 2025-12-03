import type { SelectOption } from '../types/spi.ts';

/** List of templates that CUs might insert */
export const spiHelperCUTemplates: SelectOption[] = [
  { label: 'CU templates', selected: true, value: '', disabled: true },
  { label: 'Confirmed', selected: false, value: '{{confirmed}}' },
  { label: 'Confirmed/No Comment', selected: false, value: '{{confirmed-nc}}' },
  { label: 'Indistinguishable', selected: false, value: '{{tallyho}}' },
  { label: 'Likely', selected: false, value: '{{likely}}' },
  { label: 'Possilikely', selected: false, value: '{{possilikely}}' },
  { label: 'Possible', selected: false, value: '{{possible}}' },
  { label: 'Unlikely', selected: false, value: '{{unlikely}}' },
  { label: 'Unrelated', selected: false, value: '{{unrelated}}' },
  { label: 'Inconclusive', selected: false, value: '{{inconclusive}}' },
  { label: 'Need behavioral eval', selected: false, value: '{{behav}}' },
  { label: 'No sleepers', selected: false, value: '{{nosleepers}}' },
  { label: 'Stale', selected: false, value: '{{IPstale}}' },
  { label: 'No comment (IP)', selected: false, value: '{{ncip}}' },
];

/** @type {SelectOption[]} Templates that a clerk or admin might insert */
export const spiHelperAdminTemplates: SelectOption[] = [
  { label: 'Admin/clerk templates', selected: true, value: '', disabled: true },
  { label: 'Duck', selected: false, value: '{{duck}}' },
  { label: 'Megaphone Duck', selected: false, value: '{{megaphone duck}}' },
  { label: 'IP blocked', selected: false, value: '{{IPblock}}' },
  { label: 'Blocked and tagged', selected: false, value: '{{bnt}}' },
  { label: 'Blocked, no tags', selected: false, value: '{{bwt}}' },
  { label: 'Blocked, awaiting tags', selected: false, value: '{{sblock}}' },
  { label: 'Blocked, tagged, closed', selected: false, value: '{{btc}}' },
  { label: 'Requested actions completed, closing', selected: false, value: '{{Action and close}}' },
  { label: 'Closing without action', selected: false, value: '{{Closing without action}}' },
  { label: 'Diffs needed', selected: false, value: '{{DiffsNeeded|moreinfo}}' },
  { label: 'Locks requested', selected: false, value: '{{GlobalLocksRequested}}' },
];
