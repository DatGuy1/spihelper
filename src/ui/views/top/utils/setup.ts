import { spiHelperIsAdmin } from '../../../../role.ts';
import type { ActionLabel, CaseActionName, CaseActions } from '../../../../types';
import { context } from '../../../../context.ts';
import { setupBlockActionData } from '../../../../utils.ts';

type ActionButton
  = | { label: string; selectionType: 'case' | 'section' }
    | { label: string | ActionLabel; selectionType: 'both' };

export type ActionButtons = Record<CaseActionName, ActionButton>;

export function getActionButtons(): ActionButtons {
  return {
    sections: {
      label: 'Sections',
      selectionType: 'both',
    },
    comment: {
      label: 'Comment',
      selectionType: 'section',
    },
    status: {
      label: 'Case Status',
      selectionType: 'section',
    },
    block: {
      label: spiHelperIsAdmin() ? 'Block/Tag Socks' : 'Tag Socks',
      selectionType: 'both',
    },
    link: {
      label: 'Generate Links',
      selectionType: 'both',
    },
    move: {
      label: {
        case: 'Move/Merge Full Case',
        section: 'Move Section',
      },
      selectionType: 'both',
    },
    archive: {
      label: {
        case: 'Archive Closed',
        section: 'Archive',
      },
      selectionType: 'both',
    },
    management: {
      label: 'SPI Management',
      selectionType: 'case',
    },
  };
}

export function getInitialCaseActions(): CaseActions {
  return {
    sections: {
      enabled: true,
      data: {
        section: null,
      },
    },
    comment: {
      enabled: false,
      data: {
        text: '* ',
        bySection: new Map(),
      },
    },
    status: {
      enabled: false,
      data: {
        old: '',
        new: 'nochange',
        bySection: new Map(),
      },
    },
    block: {
      enabled: false,
      data: setupBlockActionData(context.userName),
    },
    link: {
      enabled: false,
    },
    management: {
      enabled: false,
      data: {
        flags: new Set(),
      },
    },
    move: {
      enabled: false,
      data: {
        target: '',
        suppress: false,
        addNote: false,
      },
    },
    archive: {
      enabled: false,
    },
  };
}

// Actions that are only available when not in archives
export const NonArchiveActions = new Set<CaseActionName>(['status', 'management', 'comment', 'move', 'archive']);
// Actions only available for clerks
export const ClerkOnlyActions = new Set<CaseActionName>(['move', 'archive', 'management']);
// Actions available both for single and for all sections
export const AlwaysAvailableActions = new Set<CaseActionName>(['sections', 'move', 'archive', 'block', 'link']);
// Actions available only when a single section is selected
export const SpecificSectionActions = new Set<CaseActionName>(['status', 'comment']);
// Actions available only when 'all sections' is selected
export const AllSectionActions = new Set<CaseActionName>(['management']);
