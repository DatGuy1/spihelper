// src/ui/messageDisplay.ts
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from '../role.ts';
import { spiHelperGetUserBlockSettings, spiHelperRenderText } from '../api.ts';
import { spiHelperCaseClosedRegex, spiHelperCaseStatusRegex, spiHelperClerkStatusRegex } from '../constants/regex.ts';
import { context } from '../context.ts';
import { spiHelperActionViewHTML } from '../html.ts';
import type { CaseState } from '../state.ts';
import { spiHelperGetCommentTextValue, spiHelperNormalizeUsername } from '../utils.ts';
import { spiHelperSettings } from '../options.ts';
import { spiHelperInitTopLevel } from '../init.ts';
import { messageDisplay } from './messageDisplay.ts';
import { spiHelperSetAllTableColumnOpts } from './utils.ts';
import {
  spiHelperAdminTemplates,
  spiHelperAltMasterTagOptions,
  spiHelperCUTemplates,
  spiHelperTagOptions,
} from '../constants/spi.ts';
import { spiHelperPerformActions } from '../caseActions.ts';
import { type CaseActions, ParsedArchiveNotice, type SelectOption, TableType } from '../types/spi.ts';

/**
 * Update the view for the roles of the person running the script
 * by selectively hiding.
 * view: @type JQuery object representing the class / id for the view
 */
export function updateForRole(view: JQuery<HTMLElement>) {
  // Hide items based on role
  if (!spiHelperIsCheckuser()) {
    // Hide CU options from non-CUs
    $('.spiHelper_cuClass', view).hide();
  }
  if (!spiHelperIsAdmin()) {
    // Hide block options from non-admins
    $('.spiHelper_adminClass', view).hide();
  }
  if (!(spiHelperIsAdmin() || spiHelperIsClerk())) {
    $('.spiHelper_adminClerkClass', view).hide();
  }
}

/** Map of top-level actions the user has selected */
const spiHelperActionsSelected: CaseActions = {
  Status: false,
  Block: false,
  Link: false,
  Note: false,
  Close: false,
  Rename: false,
  Archive: false,
  SpiMgmt: false,
};

/**
 * Big function to generate the SPI form from the top-level menu selections
 *
 * @return {Promise<void>}
 */
export async function spiHelperGenerateForm(state: CaseState): Promise<void> {
  const $topView = $('#spiHelper_topViewDiv', document);
  spiHelperActionsSelected.Status = $('#spiHelper_CaseStatus', $topView).prop('checked');
  spiHelperActionsSelected.Block = $('#spiHelper_BlockTag', $topView).prop('checked');
  spiHelperActionsSelected.Link = $('#spiHelper_userInfo', $topView).prop('checked');
  spiHelperActionsSelected.Close = $('#spiHelper_Close', $topView).prop('checked');
  spiHelperActionsSelected.Note = $('#spiHelper_Comment', $topView).prop('checked');
  spiHelperActionsSelected.Rename = $('#spiHelper_Move', $topView).prop('checked');
  spiHelperActionsSelected.Archive = $('#spiHelper_Archive', $topView).prop('checked');
  spiHelperActionsSelected.SpiMgmt = $('#spiHelper_SpiMgmt', $topView).prop('checked');
  const pageText = await state.selectedSection?.getText() || '';
  // If none of the actions are checked, hide the form
  if (Object.values(spiHelperActionsSelected).every(action => !action)) {
    messageDisplay.hide();
    return;
  }

  messageDisplay.set(spiHelperActionViewHTML);
  messageDisplay.show();

  // Reduce the scope that jquery operates on
  const $actionView = $('#spiHelper_actionViewDiv', document);
  updateForRole($actionView);

  // FIXME: change 'block' and 'link' to enum
  $('#AddSockBlock', $actionView).on('click', async () => {
    await spiHelperAddBlankUserLine(TableType.Block, state);
  });
  $('#AddSockLink', $actionView).on('click', async () => {
    await spiHelperAddBlankUserLine(TableType.Link, state);
  });

  // Wire up the action view
  $('#spiHelper_backLink', $actionView).one('click', () => {
    spiHelperInitTopLevel(state);
  });
  if (spiHelperActionsSelected.Status) {
    const result = spiHelperCaseStatusRegex.exec(pageText);
    let caseStatus = '';
    if (result && result[1]) {
      caseStatus = result[1];
    }
    const cuRequested = /^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(caseStatus);
    const cuEndorsed = /^endorsed?$/i.test(caseStatus);
    const cuCompleted = /^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(caseStatus);

    /** Generated array of values for the case status select box */
    const selectOpts: SelectOption[] = [
      { label: 'No action', value: 'noaction', selected: true },
    ];
    if (spiHelperCaseClosedRegex.test(caseStatus)) {
      selectOpts.push({ label: 'Reopen', value: 'reopen', selected: false });
    }
    else {
      selectOpts.push({ label: 'Mark as open', value: 'open', selected: false });
    }
    if (spiHelperIsCheckuser()) {
      selectOpts.push({ label: 'Mark as in progress', value: 'inprogress', selected: false });
    }
    if (spiHelperIsClerk() || spiHelperIsAdmin()) {
      selectOpts.push({ label: 'Request more information', value: 'moreinfo', selected: false });
    }
    selectOpts.push({ label: 'Request CU', value: 'CUrequest', selected: false });
    if (spiHelperIsClerk()) {
      selectOpts.push({ label: 'Request CU and self-endorse', value: 'selfendorse', selected: false });
    }
    // CU already requested
    if (cuRequested && spiHelperIsClerk()) {
      // Statuses only available if CU has been requested, only clerks + CUs should use these
      // Switch the decline option depending on whether the user is a checkuser
      if (spiHelperIsCheckuser()) {
        selectOpts.push({ label: 'Endorse CU', value: 'cuendorse', selected: false });
        selectOpts.push({ label: 'Decline CU', value: 'cudecline', selected: false });
      }
      else {
        selectOpts.push({ label: 'Endorse for CU attention', value: 'endorse', selected: false });
        selectOpts.push({ label: 'Decline CU', value: 'decline', selected: false });
      }
      selectOpts.push({ label: 'Request more information for CU', value: 'cumoreinfo', selected: false });
    }
    else if (cuEndorsed && spiHelperIsCheckuser()) {
      // Let checkusers decline endorsed cases
      if (spiHelperIsCheckuser()) {
        selectOpts.push({ label: 'Decline CU', value: 'cudecline', selected: false });
      }
      selectOpts.push({ label: 'Request more information for CU', value: 'cumoreinfo', selected: false });
    }
    // This is mostly a CU function, but let's let clerks and admins set it
    //  in case the CU forgot (or in case we're un-closing)
    if (spiHelperIsAdmin() || spiHelperIsClerk()) {
      selectOpts.push({ label: 'Mark as checked', value: 'checked', selected: false });
    }
    if (spiHelperIsClerk() && cuCompleted) {
      selectOpts.push({ label: 'Relist for another check', value: 'relist', selected: false });
    }
    if (spiHelperIsCheckuser()) {
      selectOpts.push({ label: 'Place case on CU hold', value: 'cuhold', selected: false });
    }
    else { // I guess it's okay for anyone to have this option
      selectOpts.push({ label: 'Place case on hold', value: 'hold', selected: false });
    }
    selectOpts.push({ label: 'Request clerk action', value: 'clerk', selected: false });
    if (spiHelperIsAdmin() || spiHelperIsClerk()) {
      selectOpts.push({ label: 'Request admin action', value: 'admin', selected: false });
    }
    // Generate the case action options
    spiHelperGenerateSelect($('#spiHelper_CaseStatus', $actionView), selectOpts);
    // Add the onclick handler to the drop-down
    $('#spiHelper_CaseStatus', $actionView).on('change', (e) => {
      spiHelperCaseStatusUpdated($(e.target));
    });

    $('#spiHelper_actionView', $actionView).show();
  }

  if (spiHelperActionsSelected.SpiMgmt) {
    if (state.archiveNotice) {
      const $xwikiBox = $('#spiHelper_spiMgmt_crosswiki', $actionView);
      const $denyBox = $('#spiHelper_spiMgmt_deny', $actionView);
      const $notalkBox = $('#spiHelper_spiMgmt_notalk', $actionView);
      const $mootBox = $('#spiHelper_spiMgmt_moot', $actionView);

      $xwikiBox.prop('checked', state.archiveNotice.xwiki);
      $denyBox.prop('checked', state.archiveNotice.deny);
      $notalkBox.prop('checked', state.archiveNotice.notalk);
      $mootBox.prop('checked', state.archiveNotice.moot);
    }

    $('#spiHelper_spiMgmtView', $actionView).show();
  }

  if (spiHelperActionsSelected.Close) {
    $('#spiHelper_closeView', $actionView).show();
  }
  if (spiHelperActionsSelected.Archive) {
    $('#spiHelper_archiveView', $actionView).show();
  }
  // Only give the option to comment if we selected a specific section,
  // and we are not running on an archive subpage
  if (state.selectedSection && spiHelperActionsSelected.Note && !context.isArchive) {
    // generate the note prefixes
    const spiHelperNoteTemplates: SelectOption[] = [
      { label: 'Comment templates', selected: true, value: '', disabled: true },
    ];
    if (spiHelperIsClerk()) {
      spiHelperNoteTemplates.push({ label: 'Clerk note', selected: false, value: 'clerknote' });
    }
    if (spiHelperIsAdmin()) {
      spiHelperNoteTemplates.push({ label: 'Administrator note', selected: false, value: 'adminnote' });
    }
    if (spiHelperIsCheckuser()) {
      spiHelperNoteTemplates.push({ label: 'CU note', selected: false, value: 'cunote' });
    }
    spiHelperNoteTemplates.push({ label: 'Note', selected: false, value: 'takenote' });

    // Wire up the select boxes
    spiHelperGenerateSelect($('#spiHelper_noteSelect', $actionView), spiHelperNoteTemplates);
    $('#spiHelper_noteSelect', $actionView).on('change', (e) => {
      spiHelperInsertNote($(e.target));
    });
    spiHelperGenerateSelect($('#spiHelper_adminSelect', $actionView), spiHelperAdminTemplates);
    $('#spiHelper_adminSelect', $actionView).on('change', (e) => {
      spiHelperInsertTextFromSelect($(e.target));
    });
    spiHelperGenerateSelect($('#spiHelper_cuSelect', $actionView), spiHelperCUTemplates);
    $('#spiHelper_cuSelect', $actionView).on('change', (e) => {
      spiHelperInsertTextFromSelect($(e.target));
    });
    $('#spiHelper_previewLink', $actionView).on('click', () => {
      spiHelperPreviewText();
    });
    $('#spiHelper_commentView', $actionView).show();
  }
  if (spiHelperActionsSelected.Rename) {
    if (state.selectedSection) {
      $('#spiHelper_moveHeader', $actionView).text('Move section "' + state.selectedSection.name + '"');
    }
    else {
      $('#spiHelper_moveHeader', $actionView).text('Move/merge full case');
    }
    $('#spiHelper_moveView', $actionView).show();
  }
  if (spiHelperActionsSelected.Block || spiHelperActionsSelected.Link) {
    const likelyUsers: string[] = [];
    const likelyIPs: string[] = [];
    const possibleUsers: string[] = [];
    const possibleIPs: string[] = [];
    likelyUsers.push(context.caseName);

    const searchOrigin = state.selectedSection ? $(`a[href$="section=${state.selectedSection.id}"]`).parentsUntil(':has(hr)').last().nextUntil('hr') : $(document);
    const sockList = searchOrigin.find('.cuEntry').find('a:first');
    for (const entryElement of sockList) {
      const username = spiHelperNormalizeUsername($(entryElement).text());
      const isIP = mw.util.isIPAddress(username, true);
      if (!isIP && !likelyUsers.includes(username)) {
        likelyUsers.push(username);
      }
      else if (isIP && !likelyIPs.includes(username)) {
        if (spiHelperSettings.displayIPv6As64 && mw.util.isIPv6Address(username, false)) {
          likelyIPs.push(username.split(':').slice(0, 4).concat('0', '0', '0', '0').join(':') + '/64');
          continue;
        }
        likelyIPs.push(username);
      }
    }

    const userRegex = /{{[^|}{]*?(?:user|vandal|IP|noping)[^|}{]*?\|\s*(?:1=)?\s*([^|}]*?)\s*}}/gi;
    for (const userResult of pageText.matchAll(userRegex)) {
      if (!userResult[1]) {
        continue;
      }
      const username = spiHelperNormalizeUsername(userResult[1]);
      const isIP = mw.util.isIPAddress(username, true);
      if (isIP && !possibleIPs.includes(username)
        && !likelyIPs.includes(username)) {
        possibleIPs.push(username);
      }
      else if (!isIP && !possibleUsers.includes(username)
        && !likelyUsers.includes(username)) {
        possibleUsers.push(username);
      }
    }
    const likelySocks: string[] = [...likelyUsers, ...likelyIPs];
    const allSocks: string[] = [...likelyUsers, ...likelyIPs, ...possibleIPs, ...possibleUsers];
    state.numBlockUsers = state.numLinkUsers = allSocks.length;
    if (spiHelperActionsSelected.Block) {
      // Show generation in progress so not to make people think its broken
      $('#spiHelper_blockTagView', $actionView).show();
      if (spiHelperIsAdmin()) {
        $('#spiHelper_blockTagHeader', $actionView).text('Blocking and tagging socks');
      }
      else {
        $('#spiHelper_blockTagHeader', $actionView).text('Tagging socks');
      }
      // Wire up the "select all" options
      $('#spiHelper_block_doblock', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_acb', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_ab', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_tp', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_email', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_lock', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_lock', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      spiHelperGenerateSelect($('#spiHelper_block_tag', $actionView), spiHelperTagOptions);
      $('#spiHelper_block_tag', $actionView).on('change', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      spiHelperGenerateSelect($('#spiHelper_block_tag_altmaster', $actionView), spiHelperAltMasterTagOptions);
      $('#spiHelper_block_tag_altmaster', $actionView).on('change', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });
      $('#spiHelper_block_lock', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numBlockUsers);
      });

      const rowPromises = allSocks.map((sock, i) => {
        if (!sock) return null;
        return spiHelperGenerateBlockTableLine(
          sock, likelySocks.includes(sock), i + 1, state.archiveNotice,
        );
      });

      const $table = $('#spiHelper_blockTable', $actionView);
      const rows = await Promise.all(rowPromises);

      // Append all rows in order (filtering nulls)
      rows.forEach(($row) => {
        if ($row) {
          $table.append($row);
        }
      });
    }
    if (spiHelperActionsSelected.Link) {
      // Wire up the "select all" options
      $('#spiHelper_link_editorInteractionAnalyser', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numLinkUsers);
      });
      $('#spiHelper_link_interactionTimeline', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numLinkUsers);
      });
      $('#spiHelper_link_timecardSPITools', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numLinkUsers);
      });
      $('#spiHelper_link_consolidatedTimelineSPITools', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numLinkUsers);
      });
      $('#spiHelper_link_pagesSPITools', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numLinkUsers);
      });
      $('#spiHelper_link_checkUserWikiSearch', $actionView).on('click', (e) => {
        spiHelperSetAllTableColumnOpts($(e.target), state.numLinkUsers);
      });

      allSocks.forEach((sock, i) => {
        spiHelperGenerateLinksTableLine(sock, i + 1);
      });
      $('#spiHelper_sockLinksView', $actionView).show();
    }
  }
  // Wire up the submit button
  $('#spiHelper_performActions', $actionView).one('click', () => {
    spiHelperPerformActions(spiHelperActionsSelected, state);
  });
}

/**
 * Generate a select input, optionally with an onChange call
 *
 * @param $element JQuery element of the input
 * @param {SelectOption[]} options Array of options objects
 */
function spiHelperGenerateSelect($element: JQuery, options: SelectOption[]) {
  // Add the dates to the selector
  for (const selectOption of options) {
    $('<option>')
      .val(selectOption.value)
      .prop('selected', selectOption.selected)
      .text(selectOption.label)
      .prop('disabled', selectOption.disabled)
      .appendTo($element);
  }
}

/**
 * Inserts text at the cursor's position
 *
 * @param {JQuery<HTMLElement>} source Select box that was changed
 * @param {number?} pos Position to insert text; if null, inserts at the cursor
 */
function spiHelperInsertTextFromSelect(source: JQuery<HTMLElement>, pos: number | null = null) {
  const $textBox = $('#spiHelper_CommentText', document);
  // https://stackoverflow.com/questions/11076975/how-to-insert-text-into-the-textarea-at-the-current-cursor-position
  const selectionStart = $textBox.prop('selectionStart');
  const selectionEnd = $textBox.prop('selectionEnd');
  const startText = $textBox.val()?.toString() ?? '';
  const newText = source.val()?.toString();
  if (!newText) {
    return;
  }
  if (pos === null && (selectionStart || selectionStart === 0)) {
    $textBox.val(
      startText.slice(0, selectionStart)
      + newText + startText.slice(selectionEnd, startText.length),
    );
    $textBox.prop('selectionStart', selectionStart + newText.length);
    $textBox.prop('selectionEnd', selectionEnd + newText.length);
  }
  else if (pos !== null) {
    $textBox.val(
      startText.slice(0, pos) + source.val() + startText.slice(pos, startText.length),
    );
    $textBox.prop('selectionStart', selectionStart + newText.length);
    $textBox.prop('selectionEnd', selectionEnd + newText.length);
  }
  else {
    $textBox.val(startText + newText);
  }

  // Force the selected element to reset its selection to 0
  source.prop('selectedIndex', 0);
  $textBox.trigger('focus');
}

/**
 * Inserts a {{note}} template at the start of the text box
 *
 * @param {JQuery<HTMLElement>} source Select box that was changed
 */
function spiHelperInsertNote(source: JQuery<HTMLElement>) {
  const $textBox = $('#spiHelper_CommentText', document);
  let newText = $textBox.val()?.toString() ?? '';
  // Match the start of the line, optionally including a '*' with or without whitespace around it,
  // optionally including a template which contains the string "note"
  newText = newText.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i, '* {{' + source.val() + '}} ');
  $textBox.val(newText);

  // Force the selected element to reset its selection to 0
  source.prop('selectedIndex', 0);
  $textBox.trigger('focus');
}

/**
 * Function to add a blank user line to the block table
 */
async function spiHelperAddBlankUserLine(tableType: TableType, state: CaseState) {
  switch (tableType) {
    case TableType.Block: {
      const $row = await spiHelperGenerateBlockTableLine('', true, ++state.numBlockUsers, state.archiveNotice);
      $('#spiHelper_blockTable', document).append($row);
      break;
    }
    case TableType.Link: {
      spiHelperGenerateLinksTableLine('', ++state.numLinkUsers);
      break;
    }
  }

  updateForRole($('#spiHelper_topViewDiv', document));
}

/**
 * Generate a line of the block table for a particular user
 *
 * @param {string} name Username for this block line
 * @param {boolean} defaultblock Whether to check the block box by default on this row
 * @param {number} id Index of this line in the block table
 * @param archiveNotice Archive notice, used to determine whether to default notalk
 */
async function spiHelperGenerateBlockTableLine(
  name: string,
  defaultblock: boolean,
  id: number,
  archiveNotice: ParsedArchiveNotice | null,
) {
  let currentBlock = null;
  if (name) {
    currentBlock = await spiHelperGetUserBlockSettings(name);
  }

  let block, ab, acb, ntp, nem, duration;

  if (currentBlock) {
    block = true;
    acb = currentBlock.acb;
    ab = currentBlock.ab;
    ntp = currentBlock.ntp;
    nem = currentBlock.nem;
    duration = currentBlock.duration;
  }
  else {
    block = defaultblock;
    acb = true;
    ab = true;
    ntp = archiveNotice?.notalk;
    nem = archiveNotice?.notalk;
    duration = mw.util.isIPAddress(name, true) ? '1 week' : 'indefinite';
  }

  // const $table = $('#spiHelper_blockTable', document);

  const $row = $('<tr>');
  // Username
  $('<td>').append($('<input>').attr('type', 'text').attr('id', 'spiHelper_block_username' + id)
    .val(name).addClass('spihelper-widthlimit')).appendTo($row);
  // Block checkbox (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_doblock' + id).prop('checked', block)).appendTo($row);
  // Block duration (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'text')
    .attr('id', 'spiHelper_block_duration' + id).val(duration)
    .addClass('spihelper-widthlimit')).appendTo($row);
  // Account creation blocked (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_acb' + id).prop('checked', acb)).appendTo($row);
  // Autoblock (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_ab' + id).prop('checked', ab)).appendTo($row);
  // Revoke talk page access (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_tp' + id).prop('checked', ntp)).appendTo($row);
  // Block email access (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_email' + id).prop('checked', nem)).appendTo($row);
  // Tag select box
  const $blockTagBox = $('<select>').attr('id', 'spiHelper_block_tag' + id).val(name);
  $('<td>').append($blockTagBox).appendTo($row);
  // Altmaster tag select
  const $altmasterBox = $('<select>').attr('id', 'spiHelper_block_tag_altmaster' + id).val(name);
  $('<td>').append($altmasterBox).appendTo($row);
  // Global lock (disabled for IPs since they can't be locked)
  $('<td>').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_lock' + id)
    .prop('disabled', mw.util.isIPAddress(name, true))).appendTo($row);

  // Generate the select entries
  spiHelperGenerateSelect($blockTagBox, spiHelperTagOptions);
  spiHelperGenerateSelect($altmasterBox, spiHelperAltMasterTagOptions);

  // Add onlistener events to update the global lock checkbox if
  // the username is changed between an IP address and username
  $('#spiHelper_block_username' + id).on('change', (event) => {
    const newValue = (event.target as HTMLInputElement).value;
    $('#spiHelper_block_lock' + id).prop('disabled', mw.util.isIPAddress(newValue, true));
  });

  return $row;
}

function spiHelperGenerateLinksTableLine(username: string, id: number) {
  const $table = $('#spiHelper_userInfoTable', document);

  const $row = $('<tr>');
  // Username
  $('<td>').append($('<input>').attr('type', 'text').attr('id', 'spiHelper_link_username' + id)
    .val(username).addClass('spihelper-widthlimit')).appendTo($row);
  // Editor interaction analyser
  $('<td>').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_link_editorInteractionAnalyser' + id)).attr('style', 'text-align:center;').appendTo($row);
  // Interaction timeline
  $('<td>').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_link_interactionTimeline' + id)).attr('style', 'text-align:center;').appendTo($row);
  // SPI tools timecard tool
  $('<td>').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_link_timecardSPITools' + id)).attr('style', 'text-align:center;').appendTo($row);
  // SPI tools consilidated timeline (admin only based on OAUTH requirements)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_link_consolidatedTimelineSPITools' + id)).attr('style', 'text-align:center;').appendTo($row);
  // SPI tools pages tool (admin only based on OAUTH requirements)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_link_pagesSPITools' + id)).attr('style', 'text-align:center;').appendTo($row);
  // Checkuser wiki search (CU only)
  $('<td>').addClass('spiHelper_cuClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_link_checkUserWikiSearch' + id)).attr('style', 'text-align:center;').appendTo($row);
  $table.append($row);
}

/**
 * Changes the case status in the comment box
 *
 * @param {JQuery<HTMLElement>} source Select box that was changed
 */
function spiHelperCaseStatusUpdated(source: JQuery<HTMLElement>) {
  const $textBox = $('#spiHelper_CommentText', document);
  let newText = $textBox.val()?.toString() ?? '';
  let newTemplate = '';
  switch (source.val()) {
    case 'CUrequest':
      newTemplate = '{{CURequest}}';
      break;
    case 'admin':
      newTemplate = '{{awaitingadmin}}';
      break;
    case 'clerk':
      newTemplate = '{{Clerk Request}}';
      break;
    case 'selfendorse':
      newTemplate = '{{Requestandendorse}}';
      break;
    case 'inprogress':
      newTemplate = '{{Inprogress}}';
      break;
    case 'decline':
      newTemplate = '{{Decline}}';
      break;
    case 'cudecline':
      newTemplate = '{{Cudecline}}';
      break;
    case 'endorse':
      newTemplate = '{{Endorse}}';
      break;
    case 'cuendorse':
      newTemplate = '{{cu-endorsed}}';
      break;
    case 'moreinfo': // Intentional fallthrough
    case 'cumoreinfo':
      newTemplate = '{{moreinfo}}';
      break;
    case 'relist':
      newTemplate = '{{relisted}}';
      break;
    case 'hold':
    case 'cuhold':
      newTemplate = '{{onhold}}';
      break;
  }
  if (spiHelperClerkStatusRegex.test(newText)) {
    newText = newText.replace(spiHelperClerkStatusRegex, newTemplate);
    if (!newTemplate) { // If the new template is empty, get rid of the stray ' - '
      newText = newText.replace(/^(\s*\*\s*)? - /, '$1');
    }
  }
  else if (newTemplate) {
    // Don't try to insert if the "new template" is empty
    // Also remove the leading *
    newText = '*' + newTemplate + ' - ' + newText.replace(/^\s*\*\s*/, '');
  }
  $textBox.val(newText);
}

/**
 * Render a text box's contents and display it in the preview area
 *
 */
async function spiHelperPreviewText() {
  const inputText = spiHelperGetCommentTextValue();
  const renderedText = await spiHelperRenderText(context.pageName, inputText);
  // Fill the preview box with the new text
  const $previewBox = $('#spiHelper_previewBox', document);
  $previewBox.html(renderedText);
  // Unhide it if it was hidden
  if ($previewBox.is(':hidden')) {
    $previewBox.slideDown();
  }
}
