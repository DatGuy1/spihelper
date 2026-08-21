import { parseTemplates } from '../../../../template.ts';
import { getStatusTemplate } from './status.ts';

type ClaimMatcher = (comment: ParsedComment) => string | null;

/** A comment, parsed once so every matcher can reuse the template names */
interface ParsedComment {
  wikitext: string;
  templateNames: Set<string>;
}

export interface UnfulfilledClaim {
  /** The keyword in the comment that triggered the claim */
  quoted: string;
  /** Interpolated to be 'The comment includes <quoted>, but <reason>' */
  reason: string;
}

/** A check for a claim the comment makes, and how to tell whether the submission carries it out */
interface ClaimCheck {
  /** Ways the comment can claim the action happened, strongest matchers first */
  matchers: ClaimMatcher[];
  /** Whether spihelper is actually set to carry the action out */
  fulfilled: boolean;
  /** Becomes the warning's `reason` if the comment turns out to make this claim */
  unfulfilledText: string;
}

/** What the submission will actually do */
export interface SubmissionFacts {
  /** The status the case will be left at, with 'nochange' already resolved */
  effectiveStatus: string;
  /** A block will be applied to at least one user */
  blockPlanned: boolean;
  /** A lock or global block will be requested for at least one user */
  globalRequestPlanned: boolean;
}

/** Matches a comment that transcludes any of `names` */
function templateMatcher(...names: string[]): ClaimMatcher {
  return ({ templateNames }) => {
    const claimed = names.find(name => templateNames.has(name.toLowerCase()));
    return claimed ? `{{${claimed}}}` : null;
  };
}

/** Matches `word` as a whole word anywhere in the comment */
function textMatcher(word: string): ClaimMatcher {
  const pattern = new RegExp(String.raw`\b${word}\b`, 'i');
  return ({ wikitext }) => {
    const match = pattern.exec(wikitext);
    return match ? `the word "${match[0]}"` : null;
  };
}

// Statuses that getStatusTemplate has a template for. Aliases that share a template
// (moreinfo/cumoreinfo, hold/cuhold) are grouped by the inversion below, so a comment
// carrying the shared template is fulfilled by either of them.
const statusesWithTemplates = [
  'CUrequest', 'admin', 'clerk', 'selfendorse', 'inprogress', 'decline', 'cudecline',
  'endorse', 'cuendorse', 'moreinfo', 'cumoreinfo', 'relist', 'hold', 'cuhold', 'reopen',
];

/** Template name (without braces) to the statuses it can stand for */
const statusesByTemplate = statusesWithTemplates.reduce((byTemplate, status) => {
  const template = getStatusTemplate(status);
  if (template) {
    const name = template.slice('{{'.length, -'}}'.length);
    byTemplate.set(name, (byTemplate.get(name) ?? new Set()).add(status));
  }
  return byTemplate;
}, new Map<string, Set<string>>());

/**
 * One check per status template: transcluding one asserts that the case is being left at
 * that status. Closing has no status template of its own, so it gets the clerk templates
 * that imply it, plus a free-text fallback.
 */
function statusChecks(effectiveStatus: string): ClaimCheck[] {
  const unfulfilledText = `the case status is set to ${effectiveStatus}`;
  return [
    {
      matchers: [
        templateMatcher('btc', 'Action and close', 'Closing without action', 'cwa'),
        textMatcher('closing'),
      ],
      fulfilled: effectiveStatus === 'closed',
      unfulfilledText,
    },
    ...[...statusesByTemplate].map(([name, statuses]) => ({
      matchers: [templateMatcher(name)],
      fulfilled: statuses.has(effectiveStatus),
      unfulfilledText,
    })),
  ];
}

function actionChecks(facts: SubmissionFacts): ClaimCheck[] {
  return [
    {
      matchers: [templateMatcher('bnt', 'btc', 'bwt', 'sblock', 'IPblock')],
      fulfilled: facts.blockPlanned,
      unfulfilledText: 'no block is set to be applied',
    },
    {
      matchers: [templateMatcher('GlobalLocksRequested', 'glr')],
      fulfilled: facts.globalRequestPlanned,
      unfulfilledText: 'no lock or global block is set to be requested',
    },
  ];
}

/**
 * Finds everything the comment claims that the submission won't actually carry out
 */
export function findCommentClaims(
  commentText: string, facts: SubmissionFacts,
): UnfulfilledClaim[] {
  const comment: ParsedComment = {
    wikitext: commentText,
    templateNames: new Set(parseTemplates(commentText).map(t => t.name)),
  };
  const checks = [...statusChecks(facts.effectiveStatus), ...actionChecks(facts)];
  return checks.flatMap(({ matchers, fulfilled, unfulfilledText }) => {
    if (fulfilled) {
      return [];
    }
    const quoted = matchers.map(match => match(comment)).find(result => result !== null);
    return quoted ? [{ quoted, reason: unfulfilledText }] : [];
  });
}
