import type { MenuGroupData } from '@wikimedia/codex';

/** List of templates that CUs might insert */
export const spiHelperCUTemplates: MenuGroupData[] = [
  {
    label: 'Results', items: [
      { value: '{{confirmed}}', label: 'Confirmed' },
      { value: '{{confirmed-nc}}', label: 'Confirmed, no comment for IPs' },
      { value: '{{tallyho}}', label: 'Indistinguishable' },
      { value: '{{highly likely}}', label: 'Highly likely' },
      { value: '{{likely}}', label: 'Likely' },
      { value: '{{possilikely}}', label: 'Possilikely' },
      { value: '{{possible}}', label: 'Possible' },
      { value: '{{unlikely}}', label: 'Unlikely' },
      { value: '{{unrelated}}', label: 'Unrelated' },
      { value: '{{inconclusive}}', label: 'Inconclusive' },
      { value: '{{IPstale}}', label: 'Stale' },
    ],
  },
  {
    label: 'Addendums', items: [
      { value: '{{behav}}', label: 'Needs behavioral evaluation' },
      { value: '{{nosleepers}}', label: 'No sleepers' },
      { value: '{{ncip}}', label: 'No comment for IPs' },
      { value: '{{ncta}}', label: 'No comment for TAs' },
    ],
  },
  {
    label: 'Novelties',
    items: [
      { value: '{{8ball}} ', label: 'Magic 8-Ball' },
      { value: '{{crystalball', label: 'Not a crystal ball' },
      { value: '{{fishing}}', label: 'Not fishing' },
      { value: '{{pixiedust}}', label: 'Not pixie dust' },
    ],
  },
];

/** Templates that a clerk or admin might insert */
export const spiHelperClerkTemplates: MenuGroupData[] = [
  {
    label: 'Ducks',
    items: [
      { value: '{{duck}}', label: 'Duck' },
      { value: '{{megaphone duck}}', label: 'Megaphone duck' },
      { value: '{{megaphone duck|ultimate}}', label: 'Ultimate duck' },
    ],
  },
  {
    label: 'Results',
    items: [
      { value: '{{IPblock}}', label: 'IP blocked' },
      { value: '{{bnt}}', label: 'Blocked and tagged' },
      { value: '{{bwt}}', label: 'Blocked without tags' },
      { value: '{{sblock}}', label: 'Blocked, awaiting tags' },
      { value: '{{btc}}', label: 'Blocked, tagged, closed' },
      { value: '{{Action and close}}', label: 'Requested actions completed, closing' },
      { value: '{{Closing without action}}', label: 'Closing without action' },
    ],
  }, {
    label: 'Other',
    items: [
      { value: '{{subst:DiffsNeeded|moreinfo}}', label: 'Diffs needed' },
      { value: '{{GlobalLocksRequested}}', label: 'Locks requested' },
      { value: '{{Decline-IP}}', label: 'IP check declined' },
    ],
  },
];
