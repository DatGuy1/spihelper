import { spiHelperCaseClosedRegex, spiHelperClerkStatusRegex } from '../../../../constants';
import type { CaseStatus, CaseStatusChoice } from '../../../../types';

export function getStatusTemplate(status: CaseStatusChoice): string | null {
  switch (status) {
    case 'CUrequest':
      return '{{CURequest}}';
    case 'admin':
      return '{{awaitingadmin}}';
    case 'clerk':
      return '{{Clerk Request}}';
    case 'selfendorse':
      return '{{Requestandendorse}}';
    case 'inprogress':
      return '{{Inprogress}}';
    case 'decline':
      return '{{Decline}}';
    case 'cudecline':
      return '{{Cudecline}}';
    case 'endorse':
      return '{{Endorse}}';
    case 'cuendorse':
      return '{{cu-endorsed}}';
    case 'moreinfo':
    case 'cumoreinfo':
      return '{{moreinfo}}';
    case 'relist':
      return '{{relisted}}';
    case 'hold':
    case 'cuhold':
      return '{{onhold}}';
    case 'reopen':
      return '{{reopen}}';
    // Statuses with no template of their own
    case 'checked':
    case 'closed':
    case 'new':
    case 'open':
    case 'nochange':
      return null;
    default: {
      console.warn('New case status', status, 'is unexpected');
      return null;
    }
  }
}

export function updateCommentWithStatus(commentText: string, newStatus: CaseStatusChoice): string {
  const newTemplate = getStatusTemplate(newStatus);
  if (newTemplate === null) {
    return commentText;
  }

  if (spiHelperClerkStatusRegex.test(commentText)) {
    let updatedText = commentText.replace(spiHelperClerkStatusRegex, newTemplate);
    if (!newTemplate) {
      // If the new template is empty, get rid of the stray dash
      updatedText = updatedText.replace(/^(\s*\*\s*)? [-–] /, '$1');
    }
    return updatedText;
  }
  else if (newTemplate) {
    // Don't try to insert if the "new template" is empty, and remove the leading *
    return '* ' + newTemplate + ' – ' + commentText.replace(/^\s*\*\s*/, '');
  }

  return commentText;
}

export function normalizeCaseStatus(caseStatus: string): CaseStatus {
  if (spiHelperCaseClosedRegex.test(caseStatus)) return 'closed';
  if (/^open$/i.test(caseStatus)) return 'open';
  if (/^(?:inprogress|checking)$/i.test(caseStatus)) return 'inprogress';
  if (/^relist(ed)?$/i.test(caseStatus)) return 'relist';
  if (/^(?:checked|completed)$/i.test(caseStatus)) return 'checked';
  if (/^declined?$/i.test(caseStatus)) return 'decline';
  if (/^cudeclined?$/i.test(caseStatus)) return 'cudecline';
  if (/^endorsed?$/i.test(caseStatus)) return 'endorse';
  if (/^cuendorsed?$/i.test(caseStatus)) return 'cuendorse';
  if (/^(?:CU|checkuser|CUrequest|request)$/i.test(caseStatus)) return 'CUrequest';
  if (/^cumoreinfo$/i.test(caseStatus)) return 'cumoreinfo';
  if (/^moreinfo$/i.test(caseStatus)) return 'moreinfo';
  if (/^hold$/i.test(caseStatus)) return 'hold';
  if (/^cuhold$/i.test(caseStatus)) return 'cuhold';
  if (/^clerk$/i.test(caseStatus)) return 'clerk';
  if (/^admin(?:istrator)?$/i.test(caseStatus)) return 'admin';

  return 'new';
}
