import { OpState, finishOp, startOp } from './operations.ts';
import {
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
  spiHelperPurgePage,
} from './api.ts';
import { context } from './context.ts';
import {
  spiHelperAdminSectionWithPrecedingNewlinesRegex,
  spiHelperArchiveNoticeRegex,
  spiHelperCUBlockRegex,
  spiHelperCaseStatusRegex,
  spiHelperSectionRegex,
} from './constants/regex.ts';
import { spiHelperSettings } from './options';
import { spiHelperLog } from './actions/log.ts';
import { type CaseState, loadCaseText, loadSectionText, refreshSections } from './state.ts';
import {
  addSignature,
  buildUserActionLogMessage,
  isNonRegisteredAccount,
  spiHelperNormalizeUsername,
} from './utils.ts';
import {
  type BlockActionData,
  type CaseAction,
  type CaseActions,
  ParsedArchiveNotice,
  type UserRow,
} from './types/spi.ts';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from './role.ts';
import { spiHelperMoveCase, spiHelperMoveCaseSection } from './actions/move.ts';
import { createSockCategories, spiHelperTagUser } from './actions/tag.ts';
import { spiHelperProcessBlockRow } from './actions/block.ts';
import { spiHelperArchiveCase, spiHelperArchiveCaseSection } from './actions/archive.ts';
import { spiHelperRequestLocks } from './actions/lock.ts';
import { VueMessage } from './ui/messages.ts';

/**
 * Archives everything on the page that's eligible for archiving
 */
export async function spiHelperOneClickArchive(state: CaseState): Promise<void> {
  startOp('oneClickArchive');
  new VueMessage({ type: 'notice', content: 'Starting OCA' }).show();

  const pageText = await loadCaseText(state, { show: true, purge: true });
  if (!spiHelperSectionRegex.test(pageText)) {
    new VueMessage({ type: 'notice', content: 'Looks like the page has been archived already' }).show();
    finishOp('oneClickArchive', OpState.Success);
    return;
  }
  await refreshSections(state);

  await spiHelperArchiveCase(state);
  await spiHelperPurgePage(context.pageName);
  const logMessage = `* [[${context.pageName}]]: used one-click archiver ~~~~~`;
  if (spiHelperSettings.log.enabled) {
    await spiHelperLog(logMessage);
  }

  new VueMessage({ type: 'success', content: 'Done!' }).show();
  finishOp('oneClickArchive', OpState.Success);
}

/**
 * Goes through the action selections and executes them
 */
export async function spiHelperPerformActions(opts: {
  actions: CaseActions; accounts: UserRow[]; state: CaseState;
}) {
  const { actions, accounts, state } = opts;

  if (Object.values(actions).every((action: CaseAction<never>) => !action.enabled)) {
    new VueMessage({ type: 'warning', content: 'No actions are enabled' }).show();
    return;
  }
  if (!state.selectedSection) {
    console.error('spiHelperPerformActions: Expected a selected section, got null');
    new VueMessage({ type: 'error', content: 'Expected a selected section, got null' }).show();
    return;
  }
  if (!state.archiveNotice) {
    console.error('spiHelperPerformActions: Could not find archive notice');
    new VueMessage({ type: 'error', content: 'Could not find archive notice' }).show();
    return;
  }
  const { master, altmaster } = actions.block.data;
  if (!master) {
    console.error('spiHelperPerformActions: Could not get master');
    new VueMessage({ type: 'error', content: 'Could not get master' }).show();
    return;
  }
  if (!altmaster) {
    console.error('spiHelperPerformActions: Could not get altmaster');
    new VueMessage({ type: 'error', content: 'Could not get altmaster' }).show();
    return;
  }
  const sectionType = state.selectedSection.type;

  new VueMessage({ type: 'notice', content: 'Running actions' }).show();

  const editSummaryActions: string[] = [];
  let logMessage = `* [[${context.pageName}]]`;
  if (state.selectedSection.type === 'specific') {
    logMessage += ` (section ${state.selectedSection.section.name})`;
  }
  else {
    logMessage += ' (full case)';
  }
  logMessage += ' ~~~~~';

  let targetText = await (sectionType === 'specific'
    ? loadSectionText(state.selectedSection.section)
    : loadCaseText(state));
  if (!targetText) {
    new VueMessage({ type: 'error', content: 'Could not fetch text for the page' }).show();
    return;
  }

  const startText = targetText;

  let blockPromises: Promise<string | null>[] = [];
  let tagPromises: Promise<string | null>[] = [];
  let lockPromise: Promise<string[]> = Promise.resolve([]);
  if (actions.block.enabled) {
    ({ blockPromises, tagPromises, lockPromise } = await spiHelperHandleBlocks({
      accounts,
      blockData: actions.block.data,
    }));
  }
  const userActionsPromise = Promise.all([
    Promise.all(blockPromises),
    Promise.all(tagPromises),
    lockPromise,
  ]);

  if (!context.isArchive) {
    if (sectionType === 'specific') {
      const caseStatusResult = spiHelperCaseStatusRegex.exec(targetText);
      if (caseStatusResult === null) {
        // The case status is malformed, reset it
        targetText = targetText.replace(/^(\s*===.*===[^\S\r\n]*)/, '$1\n{{SPI case status|}}');
        actions.status.data.old = 'new';
      }
      if (actions.status.data.new === 'nochange') {
        actions.status.data.new = actions.status.data.old;
      }

      if (actions.status.enabled && actions.status.data.new !== actions.status.data.old) {
        const statusResult = spiHelperHandleStatus(actions.status.data.new, targetText);
        targetText = statusResult.targetText;
        if (statusResult.newStatus !== 'nochange') {
          // This should always be at the start
          editSummaryActions.push(statusResult.summaryItem);
          logMessage += `\n** changed case status from ${actions.status.data.old} to ${statusResult.newStatus}`;
        }
      }

      if (actions.comment.enabled && actions.comment.data.text.trim() !== '*') {
        targetText = spiHelperHandleComment(targetText, actions.comment.data.text);
        editSummaryActions.push('comment');
        logMessage += '\n** commented';
      }
    }
    else {
      if (actions.management.enabled) {
        const noticeOpts = actions.management.data.flags;
        state.archiveNotice = new ParsedArchiveNotice({
          username: state.archiveNotice.username || context.caseName,
          deny: noticeOpts.has('deny'),
          crosswiki: noticeOpts.has('crosswiki'),
          notalk: noticeOpts.has('notalk'),
          moot: noticeOpts.has('moot'),
        });
        const archiveNoticeWikitext = state.archiveNotice.generateWikitext();
        targetText = targetText.replace(spiHelperArchiveNoticeRegex, archiveNoticeWikitext);
        editSummaryActions.push('update archivenotice');
        logMessage += '\n** Updated archivenotice';
      }
    }
  }

  // Fallback: if we somehow managed to not make an edit summary, add a default one
  if (editSummaryActions.length === 0) {
    editSummaryActions.push('Saving page');
  }

  // Make all the requested edits synchronously since we might make more changes to the page,
  // unless the page is an archive
  if (!context.isArchive && targetText !== startText) {
    const sectionId = state.selectedSection.type === 'all'
      ? null
      : state.selectedSection.section.id;

    const editSummary = formatEditSummary(editSummaryActions);
    const newRevId = await context.edit({
      newText: targetText,
      summary: editSummary,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId,
      sectionId: sectionId,
    });
    if (newRevId === null) {
      // Page edit failed (probably an edit conflict)
      new VueMessage({ type: 'error', content: 'Failed to save edit' }).show();
    }
    else {
      context.startingRevId = newRevId;
    }
  }

  if (actions.archive.enabled) {
    switch (state.selectedSection.type) {
      case 'all': {
        logMessage += '\n** Archived case';
        await spiHelperArchiveCase(state);
        break;
      }
      case 'specific': {
        // Just archive the selected section
        logMessage += '\n** Archived section';
        await spiHelperArchiveCaseSection(state.selectedSection.section);
        break;
      }
    }
  }
  else if (actions.move.enabled) {
    const renameTarget = spiHelperNormalizeUsername(actions.move.data.target);
    if (renameTarget) {
      switch (state.selectedSection.type) {
        case 'all': {
          // Option 1: we selected "All cases," this is a whole-case move/merge
          logMessage += '\n** moved/merged case to ' + renameTarget;
          await spiHelperMoveCase(renameTarget, state.archiveNotice);
          break;
        }
        case 'specific': {
          // Option 2: this is a single-section case move or merge
          logMessage += '\n** moved section to ' + renameTarget;
          await spiHelperMoveCaseSection(renameTarget, state.selectedSection.section);
          break;
        }
      }
    }
  }

  const [blockedUsers, taggedUsers, lockedUsers] = await userActionsPromise;
  if (spiHelperSettings.log.enabled) {
    logMessage += buildUserActionLogMessage({ blockedUsers, taggedUsers, lockedUsers });
    await spiHelperLog(logMessage);
  }

  await spiHelperPurgePage(context.pageName);
  await refreshSections(state);
  new VueMessage({ type: 'success', content: 'Done!' }).show();
}

function spiHelperHandleComment(targetText: string, comment: string) {
  if (!targetText.includes('\n----')) {
    targetText.replace('<!--- All comments go ABOVE this line, please. -->', '');
    targetText.replace('<!-- All comments go ABOVE this line, please. -->', '');
    targetText += '\n----<!-- All comments go ABOVE this line, please. -->';
  }
  comment = addSignature(comment.trimEnd());
  // Clerks and admins post in the admin section
  if (spiHelperIsClerk() || spiHelperIsAdmin()) {
    // Find the invisible marker
    return targetText.replace(
      /\n*----(?!.*----)/s,
      `\n${comment}\n----`,
    );
  }
  else { // Everyone else posts in the "other users" section
    return targetText.replace(spiHelperAdminSectionWithPrecedingNewlinesRegex,
      '\n' + comment + '\n\n====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====\n');
  }
}

function spiHelperHandleStatus(newStatus: string, targetText: string) {
  let summaryItem = '';
  switch (newStatus) {
    case 'reopen':
      newStatus = 'open';
      summaryItem = 'Reopening';
      break;
    case 'open':
      summaryItem = 'Marking request as open';
      break;
    case 'CUrequest':
      summaryItem = 'Adding checkuser request';
      break;
    case 'admin':
      summaryItem = 'Requesting admin action';
      break;
    case 'clerk':
      summaryItem = 'Requesting clerk action';
      break;
    case 'selfendorse':
      newStatus = 'endorse';
      summaryItem = 'Adding checkuser request (self-endorsed for checkuser attention)';
      break;
    case 'checked':
      summaryItem = 'Marking request as checked';
      break;
    case 'inprogress':
      summaryItem = 'Marking request in progress';
      break;
    case 'decline':
      summaryItem = 'Declining checkuser';
      break;
    case 'cudecline':
      summaryItem = 'CU declining checkuser';
      break;
    case 'endorse':
      summaryItem = 'Endorsing for checkuser attention';
      break;
    case 'cuendorse':
      summaryItem = 'CU endorsing for checkuser attention';
      break;
    case 'moreinfo': // Intentional fallthrough
    case 'cumoreinfo':
      summaryItem = 'Requesting additional information';
      break;
    case 'relist':
      summaryItem = 'Relisting case for another check';
      break;
    case 'hold':
      summaryItem = 'Putting case on hold';
      break;
    case 'cuhold':
      summaryItem = 'Placing checkuser request on hold';
      break;
    case 'closed':
      summaryItem = 'Closing case';
      break;
    case 'nochange':
      // Do nothing
      break;
    default:
      console.error('Unexpected case status value', newStatus);
  }
  const caseStatusResult = spiHelperCaseStatusRegex.exec(targetText);
  if (caseStatusResult?.[0]) {
    targetText = targetText.replace(caseStatusResult[0], `{{SPI case status|${newStatus}}}`);
  }
  return { newStatus, summaryItem, targetText };
}

export async function spiHelperHandleBlocks(opts: {
  accounts: UserRow[];
  blockData: BlockActionData;
}): Promise<{
  blockPromises: Promise<string | null>[];
  tagPromises: Promise<string | null>[];
  lockPromise: Promise<string[]>;
}> {
  const blockPromises: Promise<string | null>[] = [];
  const tagPromises: Promise<string | null>[] = [];
  let lockPromise: Promise<string[]> = Promise.resolve([]);

  const {
    userLocks,
    userTags,
    options: blockOptions,
    lockcomment: lockComment,
    master,
    altmaster,
    skipCUVerifyUsers,
  } = opts.blockData;
  const userRows = opts.accounts.filter(userRow => userRow.username !== '');

  const lockTargets: string[] = [];
  const needsPurge = await createSockCategories({ userRows: userRows, master, altmaster });

  const blockAvailable = spiHelperIsAdmin() && !blockOptions.noBlock;

  const allUsernames = userRows.map(user => user.username);
  const allUserTalkPages = allUsernames.map(username => `User talk:${username}`);
  const fetchMessage = new VueMessage({ type: 'notice', content: 'Fetching user blocks and tags' }).show();
  // Don't reuse userBlocks because they might not have all our users
  const [userBlocks, userTalkPages] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(allUserTalkPages),
  ]);
  fetchMessage.update({ type: 'success', content: 'Got previous blocks and tags' });
  const tagSock = async (userRow: UserRow, blocked: boolean): Promise<string | null> => {
    if (userRow.block.tag === userTags.get(userRow.username)) {
      return null;
    }
    const tagSuccess = await spiHelperTagUser({
      sock: userRow,
      tagNonLocalAccounts: blockOptions.tagUnattached,
      blocked,
      master,
      altmaster,
    });
    if (tagSuccess) {
      // Purge the sock pages if we created a category to get rid of
      // the issue where the page says "click here to create category"
      // when the category was created after the page
      if (needsPurge) {
        await spiHelperPurgePage(`User:${userRow.username}`);
      }
    }

    return tagSuccess ? userRow.username : null;
  };
  for (const userRow of userRows) {
    // do not support locking IPs or TAs
    if (userRow.block.lock && !isNonRegisteredAccount(userRow.username)) {
      // If we already know we're locked. Explicit true check because it can be false or undefined
      if (userLocks.get(userRow.username) !== true) {
        lockTargets.push(userRow.username);
      }
    }
    const username = spiHelperNormalizeUsername(userRow.username);
    if (blockAvailable && userRow.block.block) {
      let noticeType: 'master' | 'sock' | null = null;
      const masterTag = userRow.block.tag.includes('master') || context.userName === username;
      if (blockOptions.addMasterNotice && masterTag) {
        noticeType = 'master';
      }
      else if (blockOptions.addSockNotice) {
        noticeType = 'sock';
      }

      const maxJitter = Math.max(500, userRows.length * 100);
      blockPromises.push((async () => {
        const userBlock = userBlocks.get(userRow.username);
        if (userBlock !== undefined && !blockOptions.override) {
          // If the user is already blocked, and we haven't asked
          // to override, exit before we get to API block error
          new VueMessage({
            type: 'warning',
            content: `Block target ${userRow.username} is already blocked. Check the "override existing blocks" box to re-block them`,
          }).show();
          return null;
        }
        const blockReason = userBlock?.reason;
        if (
          !spiHelperIsCheckuser() && !skipCUVerifyUsers.has(userRow.username)
          && blockOptions.override && blockReason && spiHelperCUBlockRegex.exec(blockReason)
        ) {
          // If you're not a checkuser, we've asked to overwrite existing blocks, and the block
          // target has a CU block on them, check whether that was intended
          const prompt = 'User ' + userRow.username + ' is CheckUser-blocked, are you SURE you want to re-block them?\n'
            + 'Current block message:\n' + blockReason;
          if (!confirm(prompt)) {
            return null;
          }
        }
        if (!userRow.block.duration) {
          // Exit before we get to API block error
          new VueMessage({
            type: 'error',
            content: `Block target ${userRow.username} does not have an intended duration`,
          }).show();
          return null;
        }
        // jitter. remove me when T260838 is fixed
        await new Promise(r => setTimeout(r, Math.random() * maxJitter));

        const blockSuccess = await spiHelperProcessBlockRow({
          sock: userRow,
          userTalkContent: userTalkPages.get(userRow.username),
          blockOptions: blockOptions,
          noticeType: noticeType,
          sockmaster: master,
        });
        if (!blockSuccess) {
          return null;
        }

        if (userRow.block.tag !== 'none' || userRow.block.altmaster !== 'none') {
          tagPromises.push(tagSock(userRow, true));
        }
        return userRow.username;
      })());
    }
    else if (userRow.block.tag !== 'none' || userRow.block.altmaster !== 'none') {
      tagPromises.push(tagSock(userRow, userBlocks.get(userRow.username) !== undefined));
    }
  }

  if (lockTargets.length > 0) {
    const hideNames = blockOptions.lockHideNames;
    // Parts of this code were adapted from https://github.com/Xi-Plus/twinkle-global
    lockPromise = spiHelperRequestLocks({ lockTargets, hideNames, master, lockComment });
  }
  return { blockPromises, tagPromises, lockPromise };
}

function formatEditSummary(editSummaryActions: string[]): string {
  const [firstAction, ...rest] = editSummaryActions;
  if (!firstAction) {
    return '';
  }
  const formattedStart = firstAction.charAt(0).toUpperCase() + firstAction.slice(1);
  const remainder = rest.length ? `, ${rest.join(', ')}` : '';
  return formattedStart + remainder;
}
