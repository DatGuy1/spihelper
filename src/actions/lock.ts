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

export async function spiHelperRequestLocks(opts: {
  lockTargets: string[];
  master: string;
  hideNames: boolean;
  lockComment: string;
}) {
  const { master, hideNames } = opts;
  // If we're mass requesting locks don't do all those requests.
  // May want to change this in the future.
  const lockTargets = opts.lockTargets.length < 6
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
  let heading: string;
  let headingText: string;
  if (hideNames) {
    heading = usePlural ? `${lockTargets.length} sockpuppets` : 'a sockpuppet';
    headingText = heading;
  }
  else {
    heading = `${lockTargets.length} [[Special:CentralAuth/${master}|${master}]] ${usePlural ? 'socks' : 'sock'}`;
    headingText = `${lockTargets.length} ${master} ${usePlural ? 'socks' : 'sock'}`;
  }
  // Trim and remove a trailing period since we add our own
  const lockComment = opts.lockComment.trim().replace(/\.+$/, '');
  let message = `=== Global lock for ${heading} ===`;
  message += '\n{{status}}';
  message += `\n${lockTemplate}`;
  message += `\n${usePlural ? 'Sockpuppets' : 'Sockpuppet'} found in enwiki sockpuppet investigation, see [[${context.prefixedName}]].`;
  if (lockComment !== '') {
    message += ` ${lockComment}.`;
  }
  message += ' ~~~~';

  // Write lock request to [[meta:Steward requests/Global]]
  let srgText = await spiHelperGetPageText('meta:Steward requests/Global', false);
  srgText = srgText.replace(/\n+(== See also == *\n)/, '\n\n' + message + '\n\n$1');
  new VueMessage({ type: 'notice', content: 'Filing global lock request' }).show();
  const editSuccess = await spiHelperEditPage({
    title: 'meta:Steward requests/Global',
    newText: srgText,
    summary: `Global lock request for ${heading}`,
    createonly: false,
    watch: 'nochange',
  });
  if (editSuccess) {
    const linkHtml = buildTitleLinkHtml(`meta:Steward requests/Global#${headingText}`, 'filed');
    new VueMessage({ type: 'success', content: `Global lock request ${linkHtml} successfully!`, isHtml: true }).show();
  }
  else {
    new VueMessage({ type: 'warning', content: 'Global lock request failed.' }).show();
  }

  return lockTargets;
}
