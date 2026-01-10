import { spiHelperIsAdmin } from '../../../../role.ts';
import type { ActionLabel, CaseActionName, CaseActions } from '../../../../types/spi.ts';
import { context } from '../../../../context.ts';

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
    management: {
      label: 'SPI Management',
      selectionType: 'case',
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
        case: 'Archive All Closed',
        section: 'Archive',
      },
      selectionType: 'both',
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
      },
    },
    status: {
      enabled: false,
      data: {
        old: '',
        new: 'nochange',
      },
    },
    block: {
      enabled: false,
      data: {
        options: {
          noBlock: false,
          override: false,
          tagUnattached: true,
          cuBlock: false,
          cuBlockOnly: false,
          addMasterNotice: true,
          addSockNotice: true,
          blankTalk: false,
          lockHideNames: false,
        },
        accounts: [],
        userlocks: new Map(),
        master: context.caseName,
        altmaster: context.caseName,
        lockcomment: '',
      },
    },
    link: {
      enabled: false,
      data: {
        rows: [],
      },
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
      },
    },
    archive: {
      enabled: false,
    },
  };
}

export const NonArchiveActions = new Set<CaseActionName>(['status', 'management', 'comment', 'move', 'archive']);
