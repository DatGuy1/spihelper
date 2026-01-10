import { spiHelperCaseClosedRegex, spiHelperClerkStatusRegex } from '../../../../constants/regex.ts';

function getStatusTemplate(status: string): string | null {
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
    case 'checked':
    case 'closed':
      return null;
    default:
      console.warn('New case status', status, 'is unexpected');
      return null;
  }
}

export function updateCommentWithStatus(commentText: string, newStatus: string): string {
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

export function normalizeCaseStatus(caseStatus: string) {
  if (spiHelperCaseClosedRegex.test(caseStatus)) return 'reopen';
  if (/^open$/i.test(caseStatus)) return 'open';
  if (/^(?:inprogress|checking)$/i.test(caseStatus)) return 'inprogress';
  if (/^relist(ed)?$/i.test(caseStatus)) return 'relist';
  if (/^checked|completed$/i.test(caseStatus)) return 'checked';
  if (/^declined?$/i.test(caseStatus)) return 'decline';
  if (/^cudeclin(ed)?$/i.test(caseStatus)) return 'cudecline';
  if (/^endorsed?$/i.test(caseStatus)) return 'endorse';
  if (/^(?:CU|checkuser|CUrequest|request)$/i.test(caseStatus)) return 'CUrequest';
  if (/^cumoreinfo$/i.test(caseStatus)) return 'cumoreinfo';
  if (/^hold$/i.test(caseStatus)) return 'hold';
  if (/^cuhold$/i.test(caseStatus)) return 'cuhold';

  return 'new';
}
