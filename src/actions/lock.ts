import { context } from '../context.ts';
import { spiHelperEditPage, spiHelperGetGlobalUser, spiHelperGetPageText } from '../api.ts';
import { VueMessage } from '../ui/messages.ts';
import { buildTitleLinkHtml } from '../utils.ts';

/**
 * Removes locked accounts from the list
 */
async function filterLockedAccounts(users: string[]): Promise<string[]> {
  const lockResults = await Promise.all(
    users.map(async user =>
      (await spiHelperGetGlobalUser(user))?.locked ? null : user,
    ),
  );

  return lockResults.filter(user => user !== null);
}

const MAX_LOCK_FILTER_REQUESTS = 6;

/**
 * Builds the SRG section heading, plus the section anchor text.
 * Both are returned without the "Global lock for " prefix.
 */
export function buildLockHeading(opts: {
  lockTargets: string[];
  master: string;
  hideNames: boolean;
}): { heading: string; headingText: string } {
  const { lockTargets, master, hideNames } = opts;
  if (hideNames || !master) {
    const heading = lockTargets.length > 1 ? `${lockTargets.length} sockpuppets` : 'a sockpuppet';
    return { heading, headingText: heading };
  }
  const masterLink = `[[Special:CentralAuth/${master}|${master}]]`;
  // The master may be a lock target themselves, in which case
  // they shouldn't be counted among their own socks
  const sockCount = lockTargets.filter(target => target !== master).length;
  if (sockCount === 0) {
    return { heading: masterLink, headingText: master };
  }
  const usePlural = sockCount > 1;
  if (sockCount < lockTargets.length) {
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

// Parts of this code were adapted from https://github.com/Xi-Plus/twinkle-global
export async function spiHelperRequestLocks(opts: {
  lockTargets: string[];
  master: string;
  hideNames: boolean;
  lockComment: string;
}) {
  const { master, hideNames } = opts;
  // If we're mass requesting locks don't do all those requests.
  // May want to change this in the future.
  const lockTargets = opts.lockTargets.length < MAX_LOCK_FILTER_REQUESTS
    ? await filterLockedAccounts(opts.lockTargets)
    : opts.lockTargets;

  if (lockTargets.length === 0) {
    return [];
  }

  let lockTemplate: string;
  const usePlural = lockTargets.length > 1;
  if (!usePlural && lockTargets[0]) {
    lockTemplate = `* {{LockHide|1=${lockTargets[0]}}}`;
  }
  else {
    lockTemplate = '{{MultiLock';
    lockTargets.forEach((user, i) => {
      lockTemplate += `|${i + 1}=${user}`;
    });
    if (hideNames) {
      lockTemplate += '|hidename=1';
    }
    lockTemplate += '}}';
  }
  const { heading, headingText: headingSuffix } = buildLockHeading({
    lockTargets, master, hideNames,
  });
  const headingText = `Global lock for ${headingSuffix}`;
  // Trim and remove a trailing period since we add our own
  const lockComment = opts.lockComment.trim().replace(/\.+$/, '');
  let message = `=== Global lock for ${heading} ===`;
  message += '\n{{status}}';
  message += `\n${lockTemplate}`;
  if (context.source === 'spi' && context.valid) {
    message += `\n${usePlural ? 'Sockpuppets' : 'Sockpuppet'} found in enwiki sockpuppet investigation, see [[${context.prefixedName}]].`;
  }
  else if (context.source === 'spi') {
    message += `\n${usePlural ? 'Sockpuppets' : 'Sockpuppet'} found in enwiki sockpuppet investigation.`;
  }
  else {
    message += `\n${usePlural ? 'Sockpuppets' : 'Sockpuppet'} found in enwiki.`;
  }
  if (lockComment !== '') {
    message += ` ${lockComment}.`;
  }
  message += ' ~~~~';

  // Write lock request to [[meta:Steward requests/Global]]
  let srgText = await spiHelperGetPageText('meta:Steward requests/Global', false);
  srgText = srgText.replace(/\n+(== See also == *\n)/, '\n\n' + message + '\n\n$1');
  new VueMessage({ type: 'notice', content: 'Filing global lock request' }).show();
  const editId = await spiHelperEditPage({
    title: 'meta:Steward requests/Global',
    newText: srgText,
    summary: `Global lock request for ${heading}`,
    createonly: false,
    watch: 'nochange',
  });
  if (editId) {
    const linkHtml = buildTitleLinkHtml(`meta:Special:Diff/${editId}#${headingText}`, 'filed');
    new VueMessage({ type: 'success', content: `Global lock request ${linkHtml} successfully!`, isHtml: true }).show();
  }
  else {
    new VueMessage({ type: 'warning', content: 'Global lock request failed.' }).show();
  }

  return lockTargets;
}
