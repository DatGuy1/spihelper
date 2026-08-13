import { spiHelperCaseClosedRegex, spiHelperClerkStatusRegex } from '../../../../constants';
import { parseTemplates } from '../../../../template.ts';

export function getStatusTemplate(status: string): string | null {
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
    case 'new':
    case '':
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
  if (spiHelperCaseClosedRegex.test(caseStatus)) return 'closed';
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
  if (/^clerk$/i.test(caseStatus)) return 'clerk';
  if (/^admin$/i.test(caseStatus)) return 'admin';

  return 'new';
}

function templateName(template: string): string | null {
  return parseTemplates(template)[0]?.name ?? null;
}

// Multiple templates that all imply closed
const closingTemplateNames = new Set(
  ['{{btc}}', '{{Action and close}}', '{{Closing without action}}']
    .map(templateName)
    .filter((name): name is string => name !== null),
);

// Statuses whose expected comment template (per getStatusTemplate)
// we can compare against what's actually in the comment
const statusesWithTemplates = [
  'CUrequest', 'admin', 'clerk', 'selfendorse', 'inprogress', 'decline', 'cudecline',
  'endorse', 'cuendorse', 'moreinfo', 'relist', 'hold', 'reopen',
] as const;

const knownStatusTemplateNames = new Set(
  statusesWithTemplates
    .map(status => getStatusTemplate(status))
    .filter((template): template is string => template !== null)
    .map(templateName),
);

export interface StatusTemplateMismatch {
  // 'template': a known clerk template implies a status that doesn't match newStatus.
  // 'text': no such template was found, but the keyword appears in free text.
  // A weaker signal due to lack of context, so only used
  // as a fallback when no template evidence is available.
  kind: 'template' | 'text';
  match: string;
}

/**
 * Finds a clerk template in the comment whose implied status doesn't match newStatus: either
 * a "closing" template (btc/Action and close/Closing without action) while the case isn't being
 * closed, or one of getStatusTemplate()'s status templates while a different status is set.
 * Falls back to a free-text match if no template evidence is found either way.
 * Callers should resolve 'nochange' to the current status before calling this.
 */
export function findStatusTemplateMismatch(
  commentText: string, newStatus: string,
): StatusTemplateMismatch | null {
  const commentTemplateNames = new Set(parseTemplates(commentText).map(t => t.name));

  if (newStatus !== 'closed') {
    const closingTemplate = [...closingTemplateNames].find(name => commentTemplateNames.has(name));
    if (closingTemplate) {
      return { kind: 'template', match: closingTemplate };
    }
  }

  const expectedTemplate = getStatusTemplate(newStatus);
  const expectedName = expectedTemplate ? templateName(expectedTemplate) : null;
  for (const name of commentTemplateNames) {
    if (knownStatusTemplateNames.has(name) && name !== expectedName) {
      return { kind: 'template', match: name };
    }
  }

  if (newStatus !== 'closed' && /\bclosing\b/i.test(commentText)) {
    return { kind: 'text', match: 'closing' };
  }

  return null;
}
