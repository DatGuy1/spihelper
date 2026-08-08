import { OpState, finishOp, startOp } from './operations.ts';
import {
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from './api.ts';
import { context } from './context.ts';
import {
  spiHelperAdminSectionWithPrecedingNewlinesRegex,
  spiHelperArchiveNoticeRegex,
  spiHelperCUBlockRegex,
  spiHelperCaseStatusRegex,
  spiHelperSectionRegex,
} from './constants';
import { spiHelperSettings } from './options';
import {
  createSockCategories,
  spiHelperAddTalkBlockNotice,
  spiHelperArchiveCase,
  spiHelperArchiveCaseSection,
  spiHelperLog,
  spiHelperMoveCase,
  spiHelperMoveCaseSection,
  spiHelperProcessBlockRow,
  spiHelperRequestLocks,
  spiHelperTagUser,
} from './actions';
import { type CaseState, loadCaseText, loadSectionText, refreshSections } from './state.ts';
import {
  addSignature,
  buildUserActionLogMessage,
  isNonRegisteredAccount,
  isSockmasterTag,
  isSockpuppetTag,
  spiHelperNormalizeUsername,
} from './utils.ts';
import {
  type BlockActionData,
  type CaseAction,
  type CaseActions,
  ParsedArchiveNotice,
  type UserRow,
} from './types';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from './role.ts';
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
  // await spiHelperPurgePage(context.pageName);
  const logMessage = `* [[${context.pageName}]]: used one-click archiver ~~~~~`;
  if (spiHelperSettings.log.enabled) {
    await spiHelperLog(logMessage);
  }

  new VueMessage({ type: 'notice', content: 'Refreshing data' }).show();
  // Update to the latest revision ID
  await context.refreshRevId();
  await refreshSections(state);

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

  const anyTopLevelEnabled = Object.values(actions)
    .some((action: CaseAction<never>) => action.enabled);
  const anyBySectionEnabled = [
    ...actions.comment.data.bySection.values(),
    ...actions.status.data.bySection.values(),
  ].some(entry => entry.enabled);
  if (!anyTopLevelEnabled && !anyBySectionEnabled) {
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
  if (!actions.block.data.master) {
    console.error('spiHelperPerformActions: Could not get master');
    new VueMessage({ type: 'error', content: 'Could not get master' }).show();
    return;
  }
  const sectionType = state.selectedSection.type;

  new VueMessage({ type: 'notice', content: 'Running actions' }).show();

  const editSummaryActions: string[] = [];
  let logMessage = `* [[${context.pageName}]]`;
  if (state.selectedSection.type === 'single') {
    logMessage += ` (section ${state.selectedSection.section.name})`;
  }
  else if (state.selectedSection.type === 'multiple') {
    logMessage += ` (multiple sections)`;
  }
  else {
    logMessage += ' (full case)';
  }
  logMessage += ' ~~~~~';

  let targetText = await (sectionType === 'single'
    ? loadSectionText(state.selectedSection.section)
    : loadCaseText(state));
  if (!targetText) {
    new VueMessage({ type: 'error', content: 'Could not fetch text for the page' }).show();
    return;
  }

  const startText = targetText;

  let blockPromises: Promise<string | null>[] = [];
  let tagPromises: Promise<string | null>[] = [];
  let talkNoticePromises: Promise<void>[] = [];
  let lockPromise: Promise<string[]> = Promise.resolve([]);
  if (actions.block.enabled) {
    ({ blockPromises, tagPromises, talkNoticePromises, lockPromise } = await spiHelperHandleBlocks({
      accounts,
      blockData: actions.block.data,
    }));
  }
  const userActionsPromise = Promise.all([
    Promise.all(blockPromises),
    Promise.all(tagPromises),
    lockPromise,
  ]);
  const talkNoticePromise = Promise.all(talkNoticePromises);

  if (!context.isArchive) {
    if (sectionType === 'single') {
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
      // Covers both 'multiple' and 'all' for the archivenotice update branch
      if (sectionType === 'multiple') {
        const commentedSections: string[] = [];
        const closedSections: string[] = [];
        const statusChangedSections: string[] = [];
        for (const section of state.selectedSection.sections) {
          const originalSectionText = await loadSectionText(section);
          let sectionText = originalSectionText;
          // Collected per-section, then written out under one header for that section
          const sectionLogLines: string[] = [];

          const caseStatusResult = spiHelperCaseStatusRegex.exec(sectionText);
          if (caseStatusResult === null) {
            // The case status is malformed, reset it
            sectionText = sectionText.replace(/^(\s*===.*===[^\S\r\n]*)/, '$1\n{{SPI case status|}}');
          }

          const sectionStatus = actions.status.data.bySection.get(section.id);
          if (sectionStatus?.enabled && sectionStatus.new !== 'nochange' && sectionStatus.new !== sectionStatus.old) {
            const statusResult = spiHelperHandleStatus(sectionStatus.new, sectionText);
            sectionText = statusResult.targetText;
            if (statusResult.newStatus === 'closed') {
              // Closing is common and distinctive enough to call out on its own,
              // rather than folding it into the generic "changed status" bucket
              closedSections.push(section.name);
            }
            else if (statusResult.newStatus !== 'nochange') {
              statusChangedSections.push(section.name);
            }
            if (statusResult.newStatus !== 'nochange') {
              sectionLogLines.push(`changed case status from ${sectionStatus.old} to ${statusResult.newStatus}`);
            }
          }

          const sectionComment = actions.comment.data.bySection.get(section.id);
          if (sectionComment?.enabled && sectionComment.text.trim() !== '*') {
            sectionText = spiHelperHandleComment(sectionText, sectionComment.text);
            commentedSections.push(section.name);
            sectionLogLines.push('commented');
          }

          if (sectionLogLines.length > 0) {
            logMessage += `\n** ${section.name}`;
            for (const line of sectionLogLines) {
              logMessage += `\n*** ${line}`;
            }
          }

          if (sectionText !== originalSectionText) {
            targetText = targetText.replace(originalSectionText, sectionText);
          }
        }
        if (closedSections.length > 0) {
          editSummaryActions.push(`closed ${closedSections.length} section${closedSections.length > 1 ? 's' : ''}`);
        }
        if (statusChangedSections.length > 0) {
          editSummaryActions.push(`changed status on ${statusChangedSections.length} section${statusChangedSections.length > 1 ? 's' : ''}`);
        }
        if (commentedSections.length > 0) {
          editSummaryActions.push(`commented on ${commentedSections.length} section${commentedSections.length > 1 ? 's' : ''}`);
        }
      }

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

  const structureChanged = actions.move.enabled || actions.archive.enabled;
  // Make all the requested edits synchronously since we might make more changes to the page,
  // unless the page is an archive
  if (!context.isArchive && targetText !== startText) {
    // 'all' and 'multiple' both edit the whole page (sectionId null); only 'single' targets
    // a single MediaWiki section, which is also the only case where the "/* section */"
    // autocomment makes sense, since MediaWiki only supports one summary target.
    const sectionId = state.selectedSection.type === 'single'
      ? state.selectedSection.section.id
      : null;
    const sectionName = state.selectedSection.type === 'single'
      ? state.selectedSection.section.name
      : null;

    const editSummary = formatEditSummary(editSummaryActions, sectionName);
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
      if (!structureChanged) {
        // If structureChanged we'll refetch it below anyways
        await context.refreshRevId();
      }
    }
    else {
      // Update our text. This should be functionally (but not exactly) equivalent
      // to loadCaseText({ purge: true }); loadSectionText({ purge: true });
      if (state.selectedSection.type === 'single') {
        state.selectedSection.section._text = targetText;
        if (state._text) {
          state._text = state._text.replace(startText, targetText);
        }
      }
      else {
        state._text = targetText;
        if (state.selectedSection.type === 'multiple') {
          // Individual section caches no longer match the page; force a refetch next read
          for (const section of state.selectedSection.sections) {
            section._text = null;
          }
        }
      }
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
      case 'single': {
        // Just archive the selected section
        logMessage += '\n** Archived section';
        await spiHelperArchiveCaseSection(state.selectedSection.section);
        break;
      }
      case 'multiple': {
        // Only closed sections in the selection actually get archived; sections that
        // aren't closed are silently left alone, same as the whole-case 'all' archive above
        const archivedSections = await spiHelperArchiveCase(state, state.selectedSection.sections);
        if (archivedSections.length > 0) {
          logMessage += `\n** Archived ${archivedSections.length} section${archivedSections.length > 1 ? 's' : ''}`;
        }
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
          await spiHelperMoveCase({
            target: renameTarget,
            suppress: actions.move.data.suppress,
            addNote: actions.move.data.addNote,
            archiveNotice: state.archiveNotice,
          });
          break;
        }
        case 'single': {
          // Option 2: this is a single-section case move or merge
          logMessage += '\n** moved section to ' + renameTarget;
          await spiHelperMoveCaseSection(renameTarget, state.selectedSection.section);
          break;
        }
      }
    }
  }

  const [blockedUsers, taggedUsers, lockedUsers] = await userActionsPromise;
  await talkNoticePromise;
  if (spiHelperSettings.log.enabled) {
    logMessage += buildUserActionLogMessage({ blockedUsers, taggedUsers, lockedUsers });
    await spiHelperLog(logMessage);
  }

  if (structureChanged) {
    const movedWholePage = actions.move.enabled && state.selectedSection.type === 'all';
    if (movedWholePage) {
      await refreshSections(state);
    }
    if (state.selectedSection.type === 'single' || state.selectedSection.type === 'multiple') {
      state.selectedSection = null;
    }
    await context.refreshRevId();
  }

  new VueMessage({ type: 'success', content: 'Done!' }).show();
}

function spiHelperHandleComment(targetText: string, comment: string) {
  if (!targetText.includes('\n----')) {
    targetText = targetText.replace(/<!-+ All comments go ABOVE this line, please. -+>/, '');
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
  talkNoticePromises: Promise<void>[];
  lockPromise: Promise<string[]>;
}> {
  const blockPromises: Promise<string | null>[] = [];
  const tagPromises: Promise<string | null>[] = [];
  const talkNoticePromises: Promise<void>[] = [];
  let lockPromise: Promise<string[]> = Promise.resolve([]);

  const {
    userLocks,
    options: blockOptions,
    lockcomment: lockComment,
    master,
    skipCUVerifyUsers,
  } = opts.blockData;
  for (const userRow of opts.accounts) {
    userRow.username = spiHelperNormalizeUsername(userRow.username);
  }
  const userRows = opts.accounts.filter(userRow => userRow.username !== '');

  const lockTargetRows: UserRow[] = [];
  await createSockCategories(userRows);

  const blockAvailable = spiHelperIsAdmin() && !blockOptions.noBlock;

  const { allUsernames, allUserPages, allUserTalkPages } = userRows.reduce<{
    allUsernames: Set<string>;
    allUserPages: string[];
    allUserTalkPages: string[];
  }>(
    (acc, user) => {
      acc.allUsernames.add(user.username);
      acc.allUserPages.push(`User:${user.username}`);
      acc.allUserTalkPages.push(`User talk:${user.username}`);
      return acc;
    },
    { allUsernames: new Set<string>(), allUserPages: [], allUserTalkPages: [] },
  );
  const fetchMessage = new VueMessage({ type: 'notice', content: 'Fetching user blocks and tags' }).show();
  // Don't reuse blocks and tags because they might not have all our users
  const [userBlocks, userPages, userTalkPages] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(allUserPages),
    spiHelperGetBulkPageText(allUserTalkPages),
  ]);
  fetchMessage.update({ type: 'success', content: 'Got previous blocks and tags' });
  const tagSock = async (userRow: UserRow, blocked: boolean): Promise<string | null> => {
    const tagSuccess = await spiHelperTagUser({
      sock: userRow,
      pageText: userPages.get(userRow.username) ?? '',
      blocked,
      tagNonLocalAccounts: blockOptions.tagUnattached,
    });
    /* Disabling to see if necessary. TODO: Check in later
    if (tagSuccess) {
      // Purge the sock pages if we created a category to get rid of
      // the issue where the page says "click here to create category"
      // when the category was created after the page
      if (needsPurge) {
        await spiHelperPurgePage(`User:${userRow.username}`);
      }
    }
    */

    return tagSuccess ? userRow.username : null;
  };
  for (const userRow of userRows) {
    // do not support locking IPs or TAs
    if (userRow.block.lock && !isNonRegisteredAccount(userRow.username)) {
      // If we already know we're locked. Explicit true check because it can be false or undefined
      if (userLocks.get(userRow.username) !== true) {
        lockTargetRows.push(userRow);
      }
    }
    if (blockAvailable && userRow.block.block) {
      const talkNotices: ('master' | 'sock')[] = [];
      // I really don't like this. It should be the way it was in 3af25ca since we
      // support tagging multiple masters, but this is the legacy spihelper behaviour.
      // May yet revert this back to 3af25ca.
      if (blockOptions.addMasterNotice && (
        userRow.block.tags.some(tag => isSockmasterTag(tag))
        || userRow.username === master
      )) {
        talkNotices.push('master');
      }
      else if (blockOptions.addSockNotice) {
        talkNotices.push('sock');
      }

      const maxJitter = Math.max(500, userRows.length * 100);
      // Resolves once the block attempt is fully settled, with enough information for the
      // talk notice and tag follow-ups below to decide whether they should run.
      interface BlockOutcome { blockedUsername: string | null; shouldTag: boolean }
      const blockOutcome: Promise<BlockOutcome> = (async () => {
        const userBlock = userBlocks.get(userRow.username);
        if (userBlock !== undefined && !blockOptions.override) {
          const alreadyBlockedWarning = new VueMessage({
            type: 'warning',
            content: `Block target ${userRow.username} is already blocked. `,
          });
          const shouldTag = userRow.block.tags.length > 0;
          if (shouldTag) {
            alreadyBlockedWarning.content += 'Proceeding with tagging';
          }
          else {
            // If the user is already blocked, and we haven't asked
            // to override, exit before we get to API block error
            alreadyBlockedWarning.content += `Check the "override existing blocks" box to re-block them`;
          }
          alreadyBlockedWarning.show();
          return { blockedUsername: null, shouldTag };
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
            return { blockedUsername: null, shouldTag: false };
          }
        }
        if (!userRow.block.duration) {
          // Exit before we get to API block error
          new VueMessage({
            type: 'error',
            content: `Block target ${userRow.username} does not have an intended duration`,
          }).show();
          return { blockedUsername: null, shouldTag: false };
        }
        // jitter. remove me when T260838 is fixed
        await new Promise(r => setTimeout(r, Math.random() * maxJitter));

        const blockSuccess = await spiHelperProcessBlockRow({
          sock: userRow,
          blockOptions,
        });
        return { blockedUsername: blockSuccess ? userRow.username : null, shouldTag: blockSuccess };
      })();

      // These need to be registered synchronously in the same loop as blockPromises,
      // rather than pushed from inside blockOutcome's body once it resolves
      blockPromises.push(blockOutcome.then(({ blockedUsername }) => blockedUsername));

      if (talkNotices.length > 0) {
        talkNoticePromises.push((async () => {
          const { blockedUsername } = await blockOutcome;
          if (blockedUsername === null) {
            return;
          }
          await spiHelperAddTalkBlockNotice({
            sock: userRow,
            userTalkContent: userTalkPages.get(userRow.username),
            blockOptions,
            talkNotices,
          });
        })());
      }
      if (userRow.block.tags.length > 0) {
        tagPromises.push((async () => {
          const { shouldTag } = await blockOutcome;
          if (!shouldTag) {
            return null;
          }
          return tagSock(userRow, true);
        })());
      }
    }
    else if (userRow.block.tags.length > 0) {
      tagPromises.push(tagSock(userRow, userBlocks.has(userRow.username)));
    }
  }

  if (lockTargetRows.length > 0) {
    const hideNames = blockOptions.lockHideNames;

    // Work out who to name as the master in the lock request
    // If we only tag one user as the master, use them.
    // In all other cases, use the "official" master (case name).
    const tagMasters = new Set(
      lockTargetRows
        .flatMap(row => row.block.tags.filter(tag => isSockpuppetTag(tag)))
        .map(tag => tag.master)
        .filter(tagMaster => tagMaster !== ''),
    );
    const [onlyTagMaster] = tagMasters;
    const lockMaster = tagMasters.size === 1 && onlyTagMaster ? onlyTagMaster : master;
    lockPromise = spiHelperRequestLocks({
      lockTargets: lockTargetRows.map(userRow => userRow.username),
      hideNames,
      master: lockMaster,
      lockComment,
    });
  }
  return { blockPromises, tagPromises, talkNoticePromises, lockPromise };
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
