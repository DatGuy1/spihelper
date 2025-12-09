import { finishOp, OpState, startOp } from './operations.ts';
import { spiHelperEditPage, spiHelperGetPageRev, spiHelperGetPageText, spiHelperPurgePage } from './api.ts';
import { context } from './context.ts';
import {
  spiHelperAdminSectionWithPrecedingNewlinesRegex,
  spiHelperArchiveNoticeRegex,
  spiHelperCaseStatusRegex,
  spiHelperSectionRegex,
} from './constants/regex.ts';
import { spiHelperSettings } from './options.ts';
import { spiHelperLog } from './log.ts';
import { messageDisplay } from './ui/messageDisplay.ts';
import { type CaseState, refreshSections } from './state.ts';
import { spiHelperGetInterwikiPrefix, spiHelperNormalizeUsername } from './utils.ts';
import {
  type BlockEntry,
  type CaseActions,
  ParsedArchiveNotice,
  type TagEntry,
} from './types/spi.ts';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from './role.ts';
import { spiHelperMoveCase, spiHelperMoveCaseSection } from './actions/move.ts';
import { spiHelperTagUser } from './actions/tag.ts';
import { spiHelperBlockUser } from './actions/block.ts';
import { spiHelperArchiveCase, spiHelperArchiveCaseSection } from './actions/archive.ts';
import { spiHelperGenerateLinksTable } from './actions/link.ts';
import { fetchValue } from './ui/utils.ts';

/**
 * Archives everything on the page that's eligible for archiving
 */
export async function spiHelperOneClickArchive(state: CaseState) {
  startOp('oneClickArchive');

  const pageText = await spiHelperGetPageText(context.pageName, false);
  if (!spiHelperSectionRegex.test(pageText)) {
    alert('Looks like the page has been archived already.');
    finishOp('oneClickArchive', OpState.Success);
    return;
  }
  messageDisplay.set('<ul id="spiHelper_status"/>');
  await refreshSections(state);

  await spiHelperArchiveCase(state);
  await spiHelperPurgePage(context.pageName);
  const logMessage = '* [[' + context.pageName + ']]: used one-click archiver ~~~~~';
  if (spiHelperSettings.log) {
    await spiHelperLog(logMessage);
  }
  $('#spiHelper_status', document).append($('<li>').text('Done!'));
  finishOp('oneClickArchive', OpState.Success);
}

/**
 * Goes through the action selections and executes them
 */
export async function spiHelperPerformActions(actionsSelected: CaseActions, state: CaseState) {
  startOp('mainActions');

  // Again, reduce the search scope
  const $actionView = $('#spiHelper_actionViewDiv', document);

  // set up a few function-scoped vars
  let comment = '';
  let cuBlock = false;
  let cuBlockOnly = false;
  let newCaseStatus = 'noaction';
  let renameTarget = '';

  const blankTalk: boolean = $('#spiHelper_blanktalk', $actionView).prop('checked');
  const overrideExisting: boolean = $('#spiHelper_override', $actionView).prop('checked');
  const hideLockNames: boolean = $('#spiHelper_hidelocknames', $actionView).prop('checked');

  if (!state.selectedSection) {
    state.selectedSection = { type: 'all' };
  }

  if (actionsSelected.Status) {
    try {
      newCaseStatus = fetchValue('#spiHelper_CaseStatus', $actionView);
    }
    catch (e) {
      console.error(e);
      return;
    }
  }
  if (actionsSelected.SpiMgmt) {
    state.archiveNotice = new ParsedArchiveNotice(
      state.archiveNotice?.username || context.caseName,
      $('#spiHelper_spiMgmt_deny', $actionView).prop('checked'),
      $('#spiHelper_spiMgmt_crosswiki', $actionView).prop('checked'),
      $('#spiHelper_spiMgmt_notalk', $actionView).prop('checked'),
      $('#spiHelper_spiMgmt_moot', $actionView).prop('checked'),
    );
  }
  if (state.selectedSection.type === 'specific' && !context.isArchive) {
    try {
      comment = fetchValue('#spiHelper_CommentText', $actionView);
    }
    catch (e) {
      console.error(e);
    }
  }

  /** Requested blocks */
  const spiHelperBlocks: BlockEntry[] = [];

  /** Requested tags */
  const spiHelperTags: TagEntry[] = [];

  /** Requested global locks */
  const spiHelperGlobalLocks: string[] = [];
  if (actionsSelected.Block) {
    if (spiHelperIsCheckuser()) {
      cuBlock = $('#spiHelper_cublock', $actionView).prop('checked');
      cuBlockOnly = $('#spiHelper_cublockonly', $actionView).prop('checked');
    }

    const blockAvailable = spiHelperIsAdmin() && !$('#spiHelper_noblock', $actionView).prop('checked');
    const masterNotice = $('#spiHelper_blocknoticemaster', $actionView).prop('checked');
    const sockNotice = $('#spiHelper_blocknoticesocks', $actionView).prop('checked');
    for (let i = 1; i <= state.numBlockUsers; i++) {
      let usernameValue;
      try {
        usernameValue = fetchValue('#spiHelper_block_username' + i, $actionView);
      }
      catch (e) {
        console.error(e + 'for user #' + i);
        return;
      }
      const username = spiHelperNormalizeUsername(usernameValue);
      const tag = $('#spiHelper_block_tag' + i, $actionView).val()?.toString() ?? '';
      const doBlock = $('#spiHelper_block_doblock' + i, $actionView).prop('checked');

      if (blockAvailable && doBlock) {
        let noticeType = '';
        if (masterNotice && (tag.includes('master') || spiHelperNormalizeUsername(context.caseName) === username)) {
          noticeType = 'master';
        }
        else if (sockNotice) {
          noticeType = 'sock';
        }
        const duration = $('#spiHelper_block_duration' + i, $actionView).val()?.toString();
        if (duration) {
          const blockEntry: BlockEntry = {
            username: username,
            duration: duration,
            acb: $('#spiHelper_block_acb' + i, $actionView).prop('checked'),
            ab: $('#spiHelper_block_ab' + i, $actionView).prop('checked'),
            ntp: $('#spiHelper_block_tp' + i, $actionView).prop('checked'),
            nem: $('#spiHelper_block_email' + i, $actionView).prop('checked'),
            tpn: noticeType,
          };
          spiHelperBlocks.push(blockEntry);
        }
        else {
          const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
          $statusLine.addClass('spihelper-errortext').append(
            $('<b>').text(`Block duration ${duration || ''} for ${username} is invalid. User will not be blocked`),
          );
        }
      }
      if ($('#spiHelper_block_lock' + i, $actionView).prop('checked')) {
        spiHelperGlobalLocks.push(username);
      }
      if (tag) {
        const tagEntry = {
          username: username,
          tag: tag,
          altmasterTag: $('#spiHelper_block_tag_altmaster' + i, $actionView).val()?.toString() ?? '',
          blocking: doBlock,
        };
        spiHelperTags.push(tagEntry);
      }
    }
  }
  if (actionsSelected.Close) {
    actionsSelected.Close = $('#spiHelper_CloseCase', $actionView).prop('checked');
  }
  if (actionsSelected.Rename) {
    try {
      renameTarget = spiHelperNormalizeUsername(fetchValue('#spiHelper_moveTarget', $actionView));
    }
    catch (e) {
      console.error(e);
    }
  }
  if (actionsSelected.Archive) {
    actionsSelected.Archive = $('#spiHelper_ArchiveCase', $actionView).prop('checked');
  }

  messageDisplay.set('<div id="linkViewResults" hidden><h4>Generated links</h4><ul id="linkViewResultsList"></ul></div><h4>Running actions</h4><ul id="spiHelper_status" />');

  const $statusAnchor = $('#spiHelper_status', document);

  let editSummary = '';
  let logMessage = '* [[' + context.pageName + ']]';
  if (state.selectedSection.type === 'specific') {
    logMessage += ' (section ' + state.selectedSection.section.name + ')';
  }
  else {
    logMessage += ' (full case)';
  }
  logMessage += ' ~~~~~';

  if (actionsSelected.Link) {
    spiHelperGenerateLinksTable(state.numLinkUsers, $actionView);
  }

  let targetText = await ((state.selectedSection.type === 'specific')
    ? state.selectedSection.section.getText()
    : state.getText());
  const startText = targetText;
  if (targetText && !context.isArchive) {
    const caseStatusResult = spiHelperCaseStatusRegex.exec(targetText);
    let oldCaseStatus: string;
    if (caseStatusResult === null || !caseStatusResult[1]) {
      // The case status is malformed, reset it
      targetText = targetText.replace(/^(\s*===.*===[^\S\r\n]*)/, '$1\n{{SPI case status|}}');
      // Maybe this should be 'new'?
      oldCaseStatus = 'open';
    }
    else {
      oldCaseStatus = caseStatusResult[1];
    }
    if (newCaseStatus === 'noaction') {
      newCaseStatus = oldCaseStatus;
    }

    if (actionsSelected.Status && newCaseStatus !== 'noaction' && newCaseStatus !== oldCaseStatus) {
      switch (newCaseStatus) {
        case 'reopen':
          newCaseStatus = 'open';
          editSummary = 'Reopening';
          break;
        case 'open':
          editSummary = 'Marking request as open';
          break;
        case 'CUrequest':
          editSummary = 'Adding checkuser request';
          break;
        case 'admin':
          editSummary = 'Requesting admin action';
          break;
        case 'clerk':
          editSummary = 'Requesting clerk action';
          break;
        case 'selfendorse':
          newCaseStatus = 'endorse';
          editSummary = 'Adding checkuser request (self-endorsed for checkuser attention)';
          break;
        case 'checked':
          editSummary = 'Marking request as checked';
          break;
        case 'inprogress':
          editSummary = 'Marking request in progress';
          break;
        case 'decline':
          editSummary = 'Declining checkuser';
          break;
        case 'cudecline':
          editSummary = 'CU declining checkuser';
          break;
        case 'endorse':
          editSummary = 'Endorsing for checkuser attention';
          break;
        case 'cuendorse':
          editSummary = 'CU endorsing for checkuser attention';
          break;
        case 'moreinfo': // Intentional fallthrough
        case 'cumoreinfo':
          editSummary = 'Requesting additional information';
          break;
        case 'relist':
          editSummary = 'Relisting case for another check';
          break;
        case 'hold':
          editSummary = 'Putting case on hold';
          break;
        case 'cuhold':
          editSummary = 'Placing checkuser request on hold';
          break;
        case 'noaction':
          // Do nothing
          break;
        default:
          console.error('Unexpected case status value ' + newCaseStatus);
      }
      logMessage += '\n** changed case status from ' + oldCaseStatus + ' to ' + newCaseStatus;
    }
  }

  if (actionsSelected.SpiMgmt) {
    if (!state.archiveNotice) {
      state.archiveNotice = new ParsedArchiveNotice();
    }
    const archiveNoticeWikitext = state.archiveNotice.generateWikitext();
    targetText = targetText.replace(spiHelperArchiveNoticeRegex, archiveNoticeWikitext);
    if (editSummary) {
      editSummary += ', update archivenotice';
    }
    else {
      editSummary = 'Update archivenotice';
    }
    logMessage += '\n** Updated archivenotice';
  }

  let loggingPromise: Promise<void> = Promise.resolve();
  // Possibly build these inside the promises themselves?
  const loggingArrays: {
    blocked: string[]; tagged: string[];
  } = {
    blocked: [], tagged: [],
  };
  if (actionsSelected.Block) {
    let sockmaster = '';
    let altmaster = '';
    let needsAltmaster = false;
    for (const tagEntry of spiHelperTags) {
      // we do not support tagging IPs
      if (mw.util.isIPAddress(tagEntry.username, true)) {
        // Skip, this is an IP
        continue;
      }
      if (tagEntry.tag.includes('master')) {
        sockmaster = tagEntry.username;
      }
      if (tagEntry.altmasterTag !== '') {
        needsAltmaster = true;
      }
    }
    if (sockmaster === '') {
      sockmaster = prompt('Please enter the name of the sockmaster: ', context.caseName) || context.caseName;
    }
    if (needsAltmaster) {
      altmaster = prompt('Please enter the name of the alternate sockmaster: ', context.caseName) || context.caseName;
    }

    const tagNonLocalAccounts = $('#spiHelper_tagAccountsWithoutLocalAccount', $actionView).prop('checked');
    let blockingPromises: Promise<void>[] = [];
    if (spiHelperIsAdmin()) {
      // Block, then tag
      blockingPromises = spiHelperBlocks.map(async (blockEntry) => {
        const blockSuccess = await spiHelperBlockUser(
          blockEntry, cuBlock, cuBlockOnly, overrideExisting, blankTalk, sockmaster,
        );
        if (!blockSuccess) return;

        loggingArrays.blocked.push('{{noping|' + blockEntry.username + '}}');
        const tagEntry = spiHelperTags.find(tag => tag.username === blockEntry.username);
        if (tagEntry) {
          const tagSuccess = await spiHelperTagUser(
            tagEntry, tagNonLocalAccounts, sockmaster, altmaster,
          );
          if (tagSuccess) {
            loggingArrays.tagged.push('{{noping|' + tagEntry.username + '}}');
          }
        }
      });
    }
    const taggingPromises = spiHelperTags.map(async (tagEntry) => {
      if (tagEntry.blocking) {
        return;
      }
      const tagSuccess = await spiHelperTagUser(
        tagEntry, tagNonLocalAccounts, sockmaster, altmaster,
      );
      if (tagSuccess) {
        loggingArrays.tagged.push('{{noping|' + tagEntry.username + '}}');
      }
    });
    // Need to make sure this works as intended
    loggingPromise = Promise.all([...blockingPromises, ...taggingPromises]).then(() => {
    });

    if (sockmaster) {
      // Whether we should purge sock pages (needed when we create a category)
      let needsPurge = false;
      // True for each we need to check if the respective category (e.g.
      // "Suspected sockpuppets of Test") exists
      const checkConfirmedCat = spiHelperTags.some(tagEntry => tagEntry.tag === 'proven') || spiHelperTags.some(tagEntry => tagEntry.tag === 'confirmed');
      const checkSuspectedCat = spiHelperTags.some(tagEntry => tagEntry.tag === 'blocked');
      const checkAltSuspectedCat = altmaster !== '' ? spiHelperTags.some(tagEntry => tagEntry.altmasterTag !== '' && tagEntry.altmasterTag === 'suspected') : false;
      const checkAltConfirmedCat = altmaster !== '' ? spiHelperTags.some(tagEntry => tagEntry.altmasterTag !== '' && tagEntry.altmasterTag === 'proven') || spiHelperTags.some(tagEntry => tagEntry.altmasterTag !== '' && tagEntry.altmasterTag === 'confirmed') : false;

      const interwikiPrefix = spiHelperGetInterwikiPrefix();
      if (checkAltConfirmedCat) {
        const catName = 'Category:Wikipedia sockpuppets of ' + altmaster;
        const catText = await spiHelperGetPageText(catName, false);
        // Empty text means the page doesn't exist - create it
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + context.pageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      if (checkAltSuspectedCat) {
        const catName = 'Category:Suspected Wikipedia sockpuppets of ' + altmaster;
        const catText = await spiHelperGetPageText(catName, false);
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + context.pageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      if (checkConfirmedCat) {
        const catName = 'Category:Wikipedia sockpuppets of ' + sockmaster;
        const catText = await spiHelperGetPageText(catName, false);
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + context.pageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      if (checkSuspectedCat) {
        const catName = 'Category:Suspected Wikipedia sockpuppets of ' + sockmaster;
        const catText = await spiHelperGetPageText(catName, false);
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + context.pageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      // Purge the sock pages if we created a category (to get rid of
      // the issue where the page says "click here to create category"
      // when the category was created after the page)
      if (needsPurge) {
        for (const tagEntry of spiHelperTags) {
          if (mw.util.isIPAddress(tagEntry.username, true)) {
            // Skip, this is an IP
            return;
          }
          if (!tagEntry.tag && !tagEntry.altmasterTag) {
            // Skip, not tagged
            return;
          }
          // Not bothering with an await, no need for async behavior here
          void spiHelperPurgePage('User:' + tagEntry.username);
        }
      }
    }

    if (spiHelperGlobalLocks.length > 0) {
      let locked = '';
      let templateContent = '';
      let matchCount = 0;
      for (const globalLockEntry of spiHelperGlobalLocks) {
        // do not support locking IPs (those are global blocks, not
        // locks, and are handled a bit differently)
        if (mw.util.isIPAddress(globalLockEntry, true)) {
          continue;
        }
        templateContent += '|' + (matchCount + 1) + '=' + globalLockEntry;
        if (locked) {
          locked += ', ';
        }
        locked += '{{noping|1=' + globalLockEntry + '}}';
        matchCount++;
      }

      if (matchCount > 0) {
        if (hideLockNames) {
          // If requested, hide locked names
          templateContent += '|hidename=1';
        }
        // Parts of this code were adapted from https://github.com/Xi-Plus/twinkle-global
        let lockTemplate: string;
        if (matchCount === 1) {
          lockTemplate = '* {{LockHide' + templateContent + '}}';
        }
        else {
          lockTemplate = '* {{MultiLock' + templateContent + '}}';
        }
        if (!sockmaster) {
          sockmaster = prompt('Please enter the name of the sockmaster: ', context.caseName) || context.caseName;
        }
        const usePlural = matchCount > 1;
        const lockComment = prompt('Please enter a comment for the global lock request (optional):', '') || '';
        const heading = hideLockNames ? (usePlural ? 'sockpuppets' : 'sockpuppet') : '[[Special:CentralAuth/' + sockmaster + '|' + sockmaster + ']] ' + (usePlural ? 'socks' : 'sock');
        let message = '=== Global lock for ' + heading + ' ===';
        message += '\n{{status}}';
        message += '\n' + lockTemplate;
        message += '\n' + (usePlural ? 'Sockpuppets' : 'Sockpuppet') + ' found in enwiki sockpuppet investigation, see [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]. ' + lockComment + ' ~~~~';

        // Write lock request to [[meta:Steward requests/Global]]
        let srgText = await spiHelperGetPageText('meta:Steward requests/Global', false);
        srgText = srgText.replace(/\n+(== See also == *\n)/, '\n\n' + message + '\n\n$1');
        $statusAnchor.append($('<li>').text('Filing global lock request'));
        spiHelperEditPage('meta:Steward requests/Global', srgText, 'Global lock request for ' + heading, false, 'nochange').then((success) => {
          const $lockResultLine = $('<li>').appendTo($statusAnchor);
          if (success) {
            $lockResultLine.text('Global lock request filed successfully!');
          }
          else {
            $lockResultLine.append($('span').addClass('spihelper-errortext').text('Global lock request failed.'));
          }
        });
      }
      if (locked) {
        logMessage += '\n** requested locks for ' + locked;
      }
    }
  }
  if (state.selectedSection.type === 'specific' && comment && comment !== '*' && !context.isArchive) {
    if (!targetText.includes('\n----')) {
      targetText.replace('<!--- All comments go ABOVE this line, please. -->', '');
      targetText.replace('<!-- All comments go ABOVE this line, please. -->', '');
      targetText += '\n----<!-- All comments go ABOVE this line, please. -->';
    }
    if (!/~~~~/.test(comment)) {
      comment += ' ~~~~';
    }
    // Clerks and admins post in the admin section
    if (spiHelperIsClerk() || spiHelperIsAdmin()) {
      // Complicated regex to find the first regex in the admin section
      // The weird (\n|.) is because we can't use /s (dot matches newline) regex mode without ES9,
      // I don't want to go there yet
      targetText = targetText.replace(/\n*----(?!(\n|.)*----)/, '\n' + comment + '\n----');
    }
    else { // Everyone else posts in the "other users" section
      targetText = targetText.replace(spiHelperAdminSectionWithPrecedingNewlinesRegex,
        '\n' + comment + '\n====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====\n');
    }
    if (editSummary) {
      editSummary += ', comment';
    }
    else {
      editSummary = 'Comment';
    }
    logMessage += '\n** commented';
  }

  if (actionsSelected.Close) {
    newCaseStatus = 'close';
    if (editSummary) {
      editSummary += ', marking case as closed';
    }
    else {
      editSummary = 'Marking case as closed';
    }
    logMessage += '\n** closed case';
  }
  if (state.selectedSection.type === 'specific' && !context.isArchive) {
    const caseStatusResult = spiHelperCaseStatusRegex.exec(targetText);
    if (caseStatusResult !== null && caseStatusResult[0]) {
      targetText = targetText.replace(caseStatusResult[0], '{{SPI case status|' + newCaseStatus + '}}');
    }
  }

  // Fallback: if we somehow managed to not make an edit summary, add a default one
  if (!editSummary) {
    editSummary = 'Saving page';
  }

  // Make all the requested edits (synchronous since we might make more changes to the page),
  // unless the page is an archive (as there should be no edits made)
  if (!context.isArchive && targetText !== startText) {
    const sectionId = state.selectedSection.type === 'all'
      ? null
      : state.selectedSection.section.id;
    const editResult = await context.edit({
      newText: targetText,
      summary: editSummary,
      watch: spiHelperSettings.watchCase,
      watchExpiry: spiHelperSettings.watchCaseExpiry,
      baseRevId: context.startingRevId,
      sectionId: sectionId,
    });
    if (!editResult) {
      // Page edit failed (probably an edit conflict), dump the comment if we had one
      if (comment && comment !== '*') {
        $('<li>')
          .append($('<div>').addClass('spihelper-errortext')
            .append($('<b>').text('SPI page edit failed! Comment was: ' + comment)))
          .appendTo($('#spiHelper_status', document));
      }
    }
  }
  // Update to the latest revision ID
  context.startingRevId = await spiHelperGetPageRev(context.pageName);
  if (actionsSelected.Archive) {
    // Archive the case
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
  else if (actionsSelected.Rename && renameTarget) {
    switch (state.selectedSection.type) {
      case 'all': {
        if (!state.archiveNotice) {
          state.archiveNotice = new ParsedArchiveNotice();
        }
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
  if (spiHelperSettings.log) {
    await loggingPromise;
    if (loggingArrays.blocked.length > 0) {
      logMessage += '\n** blocked ' + loggingArrays.blocked.join(', ');
    }
    if (loggingArrays.tagged.length > 0) {
      logMessage += '\n** tagged ' + loggingArrays.tagged.join(', ');
    }
    await spiHelperLog(logMessage);
  }

  await spiHelperPurgePage(context.pageName);
  $('#spiHelper_status', document).append($('<li>').text('Done!'));
  finishOp('mainActions', OpState.Success);
}
