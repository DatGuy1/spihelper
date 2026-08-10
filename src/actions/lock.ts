import { context } from '../context.ts';
import { spiHelperEditPage, spiHelperGetPageText } from '../api.ts';
import { VueMessage } from '../ui/messages.ts';
import { buildTitleLinkHtml, isNonRegisteredAccount } from '../utils.ts';
import type { GlobalRequestResults } from '../types';

// Parts of this code were adapted from https://github.com/Xi-Plus/twinkle-global

const SRG_PAGE = 'meta:Steward requests/Global';

/**
 * Anchors to splice our added text ahead of
 */
const SRG_SECTION_ANCHORS = {
  block: /\n+(== Requests for global \(un\)lock and \(un\)hiding == *\n)/,
  lock: /\n+(== See also == *\n)/,
} as const;

/**
 * Registered accounts get a CentralAuth link, temporary accounts and IPs get a contributions link
 */
function buildTargetLink(target: string): string {
  const special = isNonRegisteredAccount(target) ? 'Special:Contributions' : 'Special:CentralAuth';
  return `[[${special}/${target}|${target}]]`;
}

/**
 * Builds the SRG section heading, plus the section anchor text.
 * Both are returned without the "Global (b)lock for " prefix.
 */
export function buildRequestHeading(opts: {
  targets: string[];
  master: string;
  hideNames: boolean;
}): { heading: string; headingText: string } {
  const { targets, master, hideNames } = opts;
  if (hideNames || !master) {
    const heading = targets.length > 1 ? `${targets.length} sockpuppets` : 'a sockpuppet';
    return { heading, headingText: heading };
  }
  const masterLink = buildTargetLink(master);
  // The master may be a target themselves, in which case
  // they shouldn't be counted among their own socks
  const sockCount = targets.filter(target => target !== master).length;
  if (sockCount === 0) {
    return { heading: masterLink, headingText: master };
  }
  const usePlural = sockCount > 1;
  if (sockCount < targets.length) {
    // Only count the socks when there's more than one
    if (usePlural) {
      return {
        heading: `${masterLink} and ${sockCount} socks`,
        headingText: `${master} and ${sockCount} socks`,
      };
    }
    return { heading: `${masterLink} and their sock`, headingText: `${master} and their sock` };
  }
  if (usePlural) {
    return {
      heading: `${sockCount} ${masterLink} socks`,
      headingText: `${sockCount} ${master} socks`,
    };
  }
  return { heading: `${masterLink} sock`, headingText: `${master} sock` };
}

/** Where the socks were found, which is the standing behind the request */
function buildContextSentence(usePlural: boolean): string {
  const subject = usePlural ? 'Sockpuppets' : 'Sockpuppet';
  if (context.source === 'spi' && context.valid) {
    return `${subject} found in enwiki sockpuppet investigation, see [[${context.prefixedName}]].`;
  }
  if (context.source === 'spi') {
    return `${subject} found in enwiki sockpuppet investigation.`;
  }
  return `${subject} found in enwiki.`;
}

/** One request ready to be spliced into SRG */
interface SrgRequest {
  kind: keyof typeof SRG_SECTION_ANCHORS;
  targets: string[];
  /** Full wikitext, starting with its === heading === */
  body: string;
  /** Plain-text heading, used as the diff's section anchor */
  headingText: string;
}

/**
 * Lists accounts for stewards to act on, by their central account. A lone account reads
 * better as {{LockHide}}, which is also how SRG lists single-target requests.
 */
function buildLockTemplate(targets: string[], hideNames = false): string {
  const [onlyTarget] = targets;
  if (targets.length === 1 && onlyTarget) {
    return `* {{LockHide|1=${onlyTarget}${hideNames ? '|hidename=1' : ''}}}`;
  }
  let template = '{{MultiLock';
  targets.forEach((user, i) => {
    template += `|${i + 1}=${user}`;
  });
  if (hideNames) {
    template += '|hidename=1';
  }
  return `${template}}}`;
}

/** Shared tail of both request bodies: where the socks were found, plus the comment */
function buildRequestTail(opts: { usePlural: boolean; comment: string }): string {
  const comment = opts.comment.trim().replace(/\.+$/, '');
  let tail = `\n${buildContextSentence(opts.usePlural)}`;
  if (comment !== '') {
    tail += ` ${comment}.`;
  }
  return `${tail} ~~~~`;
}

export function buildLockRequest(opts: {
  targets: string[];
  master: string;
  hideNames: boolean;
  comment: string;
}): SrgRequest | null {
  const { targets, master, hideNames } = opts;
  if (targets.length === 0) {
    return null;
  }

  const { heading, headingText } = buildRequestHeading({ targets, master, hideNames });
  let body = `=== Global lock for ${heading} ===`;
  body += '\n{{status}}';
  body += `\n${buildLockTemplate(targets, hideNames)}`;
  body += buildRequestTail({ usePlural: targets.length > 1, comment: opts.comment });

  return { kind: 'lock', targets, body, headingText: `Global lock for ${headingText}` };
}

export function buildGlobalBlockRequest(opts: {
  targets: string[];
  master: string;
  comment: string;
}): SrgRequest | null {
  const { targets, master } = opts;
  if (targets.length === 0) {
    return null;
  }

  const tempAccounts = targets.filter(target => mw.util.isTemporaryUser(target));
  const ips = targets.filter(target => !mw.util.isTemporaryUser(target));

  const { heading, headingText } = buildRequestHeading({ targets, master, hideNames: false });
  let body = `=== Global block for ${heading} ===`;
  body += '\n{{status}}';
  if (tempAccounts.length > 0) {
    body += `\n${buildLockTemplate(tempAccounts)}`;
  }
  for (const ip of ips) {
    body += `\n* {{Luxotool|${ip}}}`;
  }
  body += buildRequestTail({ usePlural: targets.length > 1, comment: opts.comment });

  return { kind: 'block', targets, body, headingText: `Global block for ${headingText}` };
}

/** 'Global lock request' / 'Global block request' / 'Global lock and block requests' */
function buildRequestLabel(requests: SrgRequest[]): string {
  const [first] = requests;
  if (requests.length === 1 && first) {
    return `Global ${first.kind} request`;
  }
  return 'Global lock and block requests';
}

/**
 * Files lock and global block requests on SRG.
 *
 * The two go in different sections of the same page, so they are spliced into one edit
 * rather than saved separately — two edits would conflict with each other, and could
 * leave a case half-filed if the second failed.
 *
 * @return Which targets each request was filed for, empty if the edit did not go through
 */
export async function spiHelperRequestGlobalActions(opts: {
  lockTargets: string[];
  blockTargets: string[];
  master: string;
  hideNames: boolean;
  comment: string;
}): Promise<GlobalRequestResults> {
  const { lockTargets, blockTargets, master, hideNames, comment } = opts;
  const nothingFiled: GlobalRequestResults = { lockedUsers: [], globalBlockedUsers: [] };

  const lockRequest = buildLockRequest({ targets: lockTargets, master, hideNames, comment });
  const blockRequest = buildGlobalBlockRequest({ targets: blockTargets, master, comment });
  const requests = [blockRequest, lockRequest].filter(request => request !== null);
  if (requests.length === 0) {
    return nothingFiled;
  }
  const actionLabel = buildRequestLabel(requests);

  let newText = await spiHelperGetPageText(SRG_PAGE, false);
  for (const request of requests) {
    const splicedText = newText.replace(
      SRG_SECTION_ANCHORS[request.kind], `\n\n${request.body}\n\n$1`,
    );
    if (splicedText === newText) {
      // The section headings are what we splice against, so a rename upstream would
      // otherwise leave us saving the page unchanged and reporting success
      new VueMessage({
        type: 'error',
        content: `${actionLabel} failed: could not find the global ${request.kind} section on ${SRG_PAGE}.`,
      }).show();
      return nothingFiled;
    }
    newText = splicedText;
  }

  new VueMessage({ type: 'notice', content: `Filing ${actionLabel.toLowerCase()}` }).show();
  const editId = await spiHelperEditPage({
    title: SRG_PAGE,
    newText,
    // Named over every target at once, the per-section headings covering them individually
    summary: `${actionLabel} for ${buildRequestHeading({
      targets: [...blockTargets, ...lockTargets], master, hideNames,
    }).heading}`,
    createonly: false,
    watch: 'nochange',
  });
  if (!editId) {
    new VueMessage({ type: 'warning', content: `${actionLabel} failed.` }).show();
    return nothingFiled;
  }

  // One message per request, each anchored to its own section of the shared diff
  for (const request of requests) {
    const linkHtml = buildTitleLinkHtml(
      `meta:Special:Diff/${editId}#${request.headingText}`, 'filed',
    );
    new VueMessage({
      type: 'success',
      content: `Global ${request.kind} request ${linkHtml} successfully!`,
      isHtml: true,
    }).show();
  }

  return {
    lockedUsers: lockRequest?.targets ?? [],
    globalBlockedUsers: blockRequest?.targets ?? [],
  };
}
