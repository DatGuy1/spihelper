import { OpState, finishOp, startOp } from './operations.ts';
import {
  spiHelperGetBulkGlobalBlocks,
  spiHelperGetBulkGlobalUsers,
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from './api.ts';
import { context } from './context.ts';
import {
  spiHelperAdminSectionWithPrecedingNewlinesRegex,
  spiHelperArchiveNoticeRegex,
  spiHelperCUBlockRegex,
  spiHelperCaseStatusRegex,
  spiHelperCommentMarkerRegex,
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
  spiHelperRequestGlobalActions,
  spiHelperTagUser,
} from './actions';
import {
  buildEditSummaryActions,
  formatEditSummary,
  setupEditSummaryFacts,
} from './editSummary.ts';
import { type CaseState, loadCaseText, loadSectionText, refreshSections } from './state.ts';
import {
  addAdminSectionNote,
  addSignature,
  buildUserActionLogMessage,
  countOf,
  isNonRegisteredAccount,
  spiHelperNormalizeUsername,
} from './utils.ts';
import { isSockmasterTag, isSockpuppetTag } from './tags.ts';
import {
  type BlockActionData,
  type CaseAction,
  type CaseActions,
  type CaseStatusChoice,
  type GlobalRequestResults,
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

  const summaryFacts = setupEditSummaryFacts(sectionType === 'multiple');
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
  let globalRequestPromise: Promise<GlobalRequestResults> = Promise.resolve(
    { lockedUsers: [], globalBlockedUsers: [] },
  );
  if (actions.block.enabled) {
    ({ blockPromises, tagPromises, talkNoticePromises, globalRequestPromise }
      = await spiHelperHandleBlocks({
        accounts,
        blockData: actions.block.data,
      }));
  }
  const userActionsPromise = Promise.all([
    Promise.all(blockPromises),
    Promise.all(tagPromises),
    globalRequestPromise,
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
          summaryFacts.status = statusResult.summaryItem;
          logMessage += `\n** changed case status from ${actions.status.data.old} to ${statusResult.newStatus}`;
        }
      }

      if (actions.comment.enabled && actions.comment.data.text.trim() !== '*') {
        targetText = spiHelperHandleComment(targetText, actions.comment.data.text);
        summaryFacts.commentedCount++;
        logMessage += '\n** commented';
      }
    }
    else {
      // Covers both 'multiple' and 'all' for the archivenotice update branch
      if (sectionType === 'multiple') {
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
              summaryFacts.closedCount++;
            }
            else if (statusResult.newStatus !== 'nochange') {
              summaryFacts.statusChangedCount++;
            }
            if (statusResult.newStatus !== 'nochange') {
              sectionLogLines.push(`changed case status from ${sectionStatus.old} to ${statusResult.newStatus}`);
            }
          }

          const sectionComment = actions.comment.data.bySection.get(section.id);
          if (sectionComment?.enabled && sectionComment.text.trim() !== '*') {
            sectionText = spiHelperHandleComment(sectionText, sectionComment.text);
            summaryFacts.commentedCount++;
            sectionLogLines.push('commented');
          }

          if (sectionLogLines.length > 0) {
            logMessage += `\n** ${section.name}`;
            for (const line of sectionLogLines) {
              logMessage += `\n*** ${line}`;
            }
          }

          if (sectionText !== originalSectionText) {
            const updatedText = targetText.replace(originalSectionText, () => sectionText);
            if (updatedText === targetText) {
              new VueMessage({ type: 'error', content: `Failed to update section ${section.name}` }).show();
            }
            targetText = updatedText;
          }
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
        targetText = targetText.replace(spiHelperArchiveNoticeRegex, () => archiveNoticeWikitext);
        summaryFacts.archiveNoticeUpdated = true;
        logMessage += '\n** Updated archivenotice';
      }
    }
  }

  // Settle the user actions before writing the case page so the edit summary can report
  // what actually landed rather than what was requested
  const [blockedUsers, taggedUsers, globalRequests] = await userActionsPromise;
  summaryFacts.blockedUsers = blockedUsers.filter(user => user !== null);
  summaryFacts.taggedUsers = taggedUsers.filter(user => user !== null);
  summaryFacts.lockedUsers = globalRequests.lockedUsers;
  summaryFacts.globalBlockedUsers = globalRequests.globalBlockedUsers;

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

    const editSummary = formatEditSummary(buildEditSummaryActions(summaryFacts), sectionName);
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
          state._text = state._text.replace(startText, () => targetText);
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
          logMessage += `\n** Archived ${countOf(archivedSections.length, 'section')}`;
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

  await talkNoticePromise;
  if (spiHelperSettings.log.enabled) {
    logMessage += buildUserActionLogMessage({
      blockedUsers,
      taggedUsers,
      lockedUsers: globalRequests.lockedUsers,
      globalBlockedUsers: globalRequests.globalBlockedUsers,
    });
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
    targetText = targetText.replace(spiHelperCommentMarkerRegex, '');
    targetText += '\n----<!-- All comments go ABOVE this line, please. -->';
  }
  comment = addSignature(comment.trimEnd());
  // Clerks and admins post in the admin section
  if (spiHelperIsClerk() || spiHelperIsAdmin()) {
    return addAdminSectionNote(comment, targetText);
  }
  else { // Everyone else posts in the "other users" section
    return targetText.replace(spiHelperAdminSectionWithPrecedingNewlinesRegex,
      () => '\n' + comment + '\n\n====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====\n');
  }
}

function spiHelperHandleStatus(newStatus: CaseStatusChoice, targetText: string) {
  // Should I really be calculating and returning summaryItem here?
  let summaryItem = '';
  switch (newStatus) {
    case 'reopen':
      newStatus = 'open';
      summaryItem = 'reopening';
      break;
    case 'open':
      summaryItem = 'marking request as open';
      break;
    case 'CUrequest':
      summaryItem = 'adding checkuser request';
      break;
    case 'admin':
      summaryItem = 'requesting admin action';
      break;
    case 'clerk':
      summaryItem = 'requesting clerk action';
      break;
    case 'selfendorse':
      newStatus = 'endorse';
      summaryItem = 'adding checkuser request (self-endorsed for checkuser attention)';
      break;
    case 'checked':
      summaryItem = 'marking request as checked';
      break;
    case 'inprogress':
      summaryItem = 'marking request in progress';
      break;
    case 'decline':
      summaryItem = 'declining checkuser';
      break;
    case 'cudecline':
      summaryItem = 'CU declining checkuser';
      break;
    case 'endorse':
      summaryItem = 'endorsing for checkuser attention';
      break;
    case 'cuendorse':
      summaryItem = 'CU endorsing for checkuser attention';
      break;
    case 'moreinfo': // Intentional fallthrough
    case 'cumoreinfo':
      summaryItem = 'requesting additional information';
      break;
    case 'relist':
      summaryItem = 'relisting case for another check';
      break;
    case 'hold':
      summaryItem = 'putting case on hold';
      break;
    case 'cuhold':
      summaryItem = 'placing checkuser request on hold';
      break;
    case 'closed':
      summaryItem = 'closing';
      break;
    // Neither is offered by the dropdown, and callers skip 'nochange' before getting here
    case 'new':
    case 'nochange':
      // Do nothing
      break;
    default: {
      // Should be unreachable
      console.error('Unexpected case status value', newStatus);
    }
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
  globalRequestPromise: Promise<GlobalRequestResults>;
}> {
  const blockPromises: Promise<string | null>[] = [];
  const tagPromises: Promise<string | null>[] = [];
  const talkNoticePromises: Promise<void>[] = [];
  let globalRequestPromise: Promise<GlobalRequestResults> = Promise.resolve(
    { lockedUsers: [], globalBlockedUsers: [] },
  );

  const {
    options: blockOptions,
    lockcomment: lockComment,
    master,
    skipCUVerifyUsers,
  } = opts.blockData;
  for (const userRow of opts.accounts) {
    userRow.username = spiHelperNormalizeUsername(userRow.username);
  }
  const userRows = opts.accounts.filter(userRow => userRow.username !== '');

  const globalTargetRows: UserRow[] = [];
  const categoriesPromise = createSockCategories(userRows);

  const blockAvailable = spiHelperIsAdmin() && !blockOptions.noBlock;

  // Userpages are only read to diff against the tags we're about to write, and talk pages
  // only to append a block notice to. Skip either fetch entirely when nothing will use it.
  const addingTags = userRows.some(user => user.block.tags.length > 0);
  const addingNotices = blockAvailable && !blockOptions.blankTalk
    && (blockOptions.addMasterNotice || blockOptions.addSockNotice);

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
  // Userpages and talk pages are the same kind of lookup, so they travel together
  const pageTitles = [
    ...(addingTags ? allUserPages : []),
    ...(addingNotices ? allUserTalkPages : []),
  ];
  const fetchMessage = new VueMessage({ type: 'notice', content: 'Fetching user blocks and tags' }).show();
  // Don't reuse blocks and tags because they might not have all our users
  const [userBlocks, pageTexts, globalUsers, userGlobalBlocks] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(pageTitles),
    spiHelperGetBulkGlobalUsers(
      new Set([...allUsernames].filter(username => !isNonRegisteredAccount(username))),
    ),
    spiHelperGetBulkGlobalBlocks(
      new Set([...allUsernames].filter(username => isNonRegisteredAccount(username))),
    ),
    categoriesPromise,
  ]);
  fetchMessage.update({ type: 'success', content: 'Got previous blocks and tags' });
  const tagSock = async (userRow: UserRow, blocked: boolean): Promise<string | null> => {
    const tagSuccess = await spiHelperTagUser({
      sock: userRow,
      pageText: pageTexts.get(`User:${userRow.username}`) ?? '',
      blocked,
      globalUser: globalUsers.get(userRow.username),
      tagNonLocalAccounts: blockOptions.tagUnattached,
    });

    return tagSuccess ? userRow.username : null;
  };
  for (const userRow of userRows) {
    if (userRow.block.lock) {
      globalTargetRows.push(userRow);
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
            userTalkContent: pageTexts.get(`User talk:${userRow.username}`),
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

  const globalRows = globalTargetRows.filter(row => !(isNonRegisteredAccount(row.username)
    ? userGlobalBlocks.has(row.username)
    : globalUsers.get(row.username)?.locked));
  if (globalRows.length > 0) {
    const hideNames = blockOptions.lockHideNames;

    // Work out who to name as the master in the request
    // If we only tag one user as the master, use them.
    // In all other cases, use the "official" master (case name).
    const tagMasters = new Set(
      globalRows
        .flatMap(row => row.block.tags.filter(tag => isSockpuppetTag(tag)))
        .map(tag => tag.master)
        .filter(tagMaster => tagMaster !== ''),
    );
    const [onlyTagMaster] = tagMasters;
    const globalMaster = tagMasters.size === 1 && onlyTagMaster ? onlyTagMaster : master;

    const [globalBlockTargets, lockTargets] = globalRows.reduce<[string[], string[]]>(
      (acc, row) => {
        acc[isNonRegisteredAccount(row.username) ? 0 : 1].push(row.username);
        return acc;
      },
      [[], []],
    );

    // Both go to the same page, so they are filed together in a single edit
    globalRequestPromise = spiHelperRequestGlobalActions({
      lockTargets,
      blockTargets: globalBlockTargets,
      hideNames,
      master: globalMaster,
      comment: lockComment,
    });
  }
  return { blockPromises, tagPromises, talkNoticePromises, globalRequestPromise };
}
