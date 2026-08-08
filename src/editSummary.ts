import { pluralise } from './utils.ts';

/**
 * What the case page edit did, collected as the actions run and turned into summary
 * phrases by buildEditSummaryActions once everything has settled
 */
export interface EditSummaryFacts {
  /** Whether the edit spans several sections, which decides how the facts below read */
  multiSection: boolean;
  /** Single-section only */
  status: string;
  /** Multi-section only */
  closedCount: number;
  statusChangedCount: number;
  /** Shared in single and multi-section **/
  commentedCount: number;
  archiveNoticeUpdated: boolean;
  /** Who each user action landed on, not just how many - see groupByAccounts */
  blockedUsers: string[];
  taggedUsers: string[];
  lockedUsers: string[];
}

export function setupEditSummaryFacts(multiSection: boolean): EditSummaryFacts {
  return {
    multiSection,
    status: '',
    closedCount: 0,
    statusChangedCount: 0,
    commentedCount: 0,
    archiveNoticeUpdated: false,
    blockedUsers: [],
    taggedUsers: [],
    lockedUsers: [],
  };
}

/** 'blocking' / 'blocking and tagging' / 'blocking, tagging, and requesting locks for' */
function joinVerbs(verbs: string[]): string {
  const last = verbs.at(-1);
  if (!last) {
    return '';
  }
  const rest = verbs.slice(0, -1);
  if (rest.length === 0) {
    return last;
  }
  return `${rest.join(', ')}${rest.length > 1 ? ',' : ''} and ${last}`;
}

interface UserAction {
  /** Reads into a shared '... N accounts' tail when this action merges with others */
  verb: string;
  users: string[];
  /** Phrasing to prefer when this action ends up in a group of its own */
  solo?: (count: number) => string;
}

/**
 * Collapses the user actions that landed on exactly the same accounts into one phrase,
 * so the usual case of blocking and tagging the same socks reads as
 * 'blocking and tagging 3 accounts' rather than repeating the count.
 *
 * Grouping is on the accounts themselves, never on the counts: a row can be tagged
 * without being blocked (and vice versa), so two actions can share a count while
 * naming different people.
 */
function groupByAccounts(facts: EditSummaryFacts): string[] {
  const userActions: UserAction[] = [
    { verb: 'blocking', users: facts.blockedUsers },
    { verb: 'tagging', users: facts.taggedUsers },
    {
      verb: 'requesting locks for',
      users: facts.lockedUsers,
      solo: count => `requesting ${pluralise(count, 'lock')}`,
    },
  ];

  const groups = new Map<string, UserAction[]>();
  for (const userAction of userActions.filter(({ users }) => users.length > 0)) {
    const key = [...userAction.users].sort().join('|');
    groups.set(key, [...groups.get(key) ?? [], userAction]);
  }

  return [...groups.values()].map((group) => {
    const [firstAction, ...rest] = group;
    if (!firstAction) {
      return '';
    }
    const count = firstAction.users.length;
    if (rest.length === 0 && firstAction.solo) {
      return firstAction.solo(count);
    }
    return `${joinVerbs(group.map(({ verb }) => verb))} ${pluralise(count, 'account')}`;
  });
}

/**
 * Turns the collected facts into the ordered list of edit summary phrases in the present participle
 */
export function buildEditSummaryActions(facts: EditSummaryFacts): string[] {
  const editSummaryActions: string[] = [];
  if (facts.archiveNoticeUpdated) {
    editSummaryActions.push('updating archivenotice');
  }
  if (facts.commentedCount > 0) {
    editSummaryActions.push(facts.multiSection
      ? `commenting on ${pluralise(facts.commentedCount, 'section')}`
      : 'commenting');
  }
  editSummaryActions.push(...groupByAccounts(facts));
  if (facts.multiSection) {
    if (facts.statusChangedCount > 0) {
      editSummaryActions.push(`changing status on ${pluralise(facts.statusChangedCount, 'section')}`);
    }
    if (facts.closedCount > 0) {
      editSummaryActions.push(`closing ${pluralise(facts.closedCount, 'section')}`);
    }
  }
  else if (facts.status) {
    editSummaryActions.push(facts.status);
  }
  // Fallback: if we somehow managed to not make an edit summary, add a default one
  if (editSummaryActions.length === 0) {
    editSummaryActions.push('saving page');
  }
  return editSummaryActions;
}

export function formatEditSummary(
  editSummaryActions: string[], sectionName: string | null,
): string {
  const [firstAction, ...rest] = editSummaryActions;
  if (!firstAction) {
    return '';
  }
  const formattedStart = firstAction.charAt(0).toUpperCase() + firstAction.slice(1);
  const remainder = rest.length ? `, ${rest.join(', ')}` : '';
  const sectionPrefix = sectionName ? `/* ${sectionName} */ ` : '';
  return sectionPrefix + formattedStart + remainder;
}
