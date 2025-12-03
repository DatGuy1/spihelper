'use strict';

import type { BlockEntry, GlobalUser, ParsedArchiveNotice, SelectOption, TagEntry } from './types/spi.ts';
import {
  spiHelperAdvert,
  spiHelperSettings,
} from './constants/settings.ts';
import { displayMessage } from './displayMessage.ts';
import {
  spiHelperAdminSectionWithPrecedingNewlinesRegex,
  spiHelperArchiveNoticeRegex, spiHelperCaseClosedRegex, spiHelperCaseStatusRegex, spiHelperClerkStatusRegex,
  spiHelperCUBlockRegex, spiHelperHiddenCharNormRegex,
  spiHelperPriorCasesRegex,
  spiHelperSectionRegex,
  spiHelperSockSectionWithNewlineRegex,
} from './constants/regex.ts';
import { spiHelperAdminTemplates, spiHelperCUTemplates } from './constants/templates.ts';
import { spiHelperActionViewHTML, spiHelperTopViewHTML } from './html.ts';
import type { NewPendingChanges, PendingChanges, Protection, SectionResult, WatchOption } from './types/api.ts';
import type {
  ApiEditPageParams,
  ApiParseParams,
  ApiQueryBacklinksParams,
  ApiQueryBlocksParams,
  ApiQueryFlaggedParams,
  ApiQueryRevisionsParams,
  ApiQueryInfoParams,
  CentralAuthApiQueryGlobalAllUsersParams,
  ApiQuerySiteinfoParams,
  ApiProtectParams,
  ApiUndeleteParams,
  ApiMoveParams,
  ApiPurgeParams,
  ApiDeleteParams,
  ApiStabilizeProtectParams,
  ApiBlockParams,
} from 'types-mediawiki-api';
import { spiHelperLoadSettings } from './options.ts';

// DatGuy's rewrote of GeneralNotability's rewrite of Tim's SPI helper script
// With additional contributions from 0xDeadbeef, Dreamy Jazz, L235, Tamzin, TheresNoTime, and Xiplus
/*! v3.0.0 "A whole new world" */

// Adapted from [[User:Mr.Z-man/closeAFD]]
importStylesheet('User:DatGuy/spihelper.css');

// Can't set in the spiHelperSettings declaration because spiHelperIsCheckuser itself uses the settings var
spiHelperSettings.useCheckuserblockAccount = spiHelperIsCheckuser();

/* Globals to describe the current SPI page */

/** Name of the SPI page in wiki title form
 * (e.g. Wikipedia:Sockpuppet investigations/Test) */
let spiHelperPageName: string = mw.config.get('wgPageName').replace(/_/g, ' ');

/** The main page's ID - used to check if the page
 * has been edited since we opened it to prevent edit conflicts
 */
let spiHelperStartingRevID: number = mw.config.get('wgCurRevisionId');

const spiHelperIsThisPageAnArchive = mw.config.get('wgPageName').match('Wikipedia:Sockpuppet_investigations/.*/Archive.*');

/** Only the username part of the case */
let spiHelperCaseName: string;

if (spiHelperIsThisPageAnArchive) {
  spiHelperCaseName = spiHelperPageName.replace(/Wikipedia:Sockpuppet investigations\//g, '').replace(/\/Archive/, '');
}
else {
  spiHelperCaseName = spiHelperPageName.replace(/Wikipedia:Sockpuppet investigations\//g, '');
}

/** list of section IDs + names corresponding to separate investigations */
let spiHelperCaseSections: SectionResult[] = [];

/** Selected section, "null" means that we're opearting on the entire page */
let spiHelperSectionId: number | null = null;

/** Selected section's name (e.g. "10 June 2020") */
let spiHelperSectionName: string | null = null;

let spiHelperArchiveNoticeParams: ParsedArchiveNotice;

/** Map of top-level actions the user has selected */
const spiHelperActionsSelected = {
  Case_act: false,
  Block: false,
  Link: false,
  Note: false,
  Close: false,
  Rename: false,
  Archive: false,
  SpiMgmt: false,
};

/** Requested blocks */
const spiHelperBlocks: BlockEntry[] = [];

/** Requested tags */
const spiHelperTags: TagEntry[] = [];

/** Requested global locks */
const spiHelperGlobalLocks: string[] = [];

// Count of unique users in the case (anything with a checkuser, checkip, user, ip, or vandal template on the page) for the block view
let spiHelperBlockTableUserCount = 0;
// Count of unique users in the case (anything with a checkuser, checkip, user, ip, or vandal template on the page) for the link view (seperate needed as extra rows can be added)
let spiHelperLinkTableUserCount = 0;

// The current wiki's interwiki prefix
const spiHelperInterwikiPrefix = spiHelperGetInterwikiPrefix();

// Map of active operations (used as a "dirty" flag for beforeunload)
// Values are strings representing the state - acceptable values are 'running', 'success', 'failed'
const spiHelperActiveOperations = new Map();

/* Globals to describe possible options for dropdown menus */

/** List of possible selections for tagging a user in the block/tag interface
 */
const spiHelperTagOptions: SelectOption[] = [
  { label: 'None', selected: true, value: '' },
  { label: 'Suspected sock', value: 'blocked', selected: false },
  { label: 'Proven sock', value: 'proven', selected: false },
  { label: 'CU confirmed sock', value: 'confirmed', selected: false },
  { label: 'Blocked master', value: 'master', selected: false },
  { label: 'CU confirmed master', value: 'sockmasterchecked', selected: false },
  { label: '3X banned master', value: 'bannedmaster', selected: false },
];

/** List of possible selections for tagging a user's altmaster in the block/tag interface */
const spiHelperAltMasterTagOptions: SelectOption[] = [
  { label: 'None', selected: true, value: '' },
  { label: 'Suspected alt master', value: 'suspected', selected: false },
  { label: 'Proven alt master', value: 'proven', selected: false },
];

/* Other globals */
/* Used by the link view */
const spiHelperLinkViewURLFormats = {
  editorInteractionAnalyser: {
    baseurl: 'https://sigma.toolforge.org/editorinteract.py',
    appendToQueryString: '',
    userQueryStringKey: 'users',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
    name: 'Editor Interaction Anaylser',
  },
  interactionTimeline: {
    baseurl: 'https://interaction-timeline.toolforge.org/',
    appendToQueryString: 'wiki=enwiki',
    userQueryStringKey: 'user',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
    name: 'Interaction Timeline',
  },
  timecardSPITools: {
    baseurl: 'https://spi-tools.toolforge.org/spi/timecard/' + spiHelperCaseName,
    appendToQueryString: '',
    userQueryStringKey: 'users',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
    name: 'Timecard comparisons',
  },
  consolidatedTimelineSPITools: {
    baseurl: 'https://spi-tools.toolforge.org/spi/timecard/' + spiHelperCaseName,
    appendToQueryString: '',
    userQueryStringKey: 'users',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
    name: 'Consolidated Timeline (requires login)',
  },
  pagesSPITools: {
    baseurl: 'https://spi-tools.toolforge.org/spi/timeline/' + spiHelperCaseName,
    appendToQueryString: '',
    userQueryStringKey: 'users',
    userQueryStringSeparator: '&',
    userQueryStringWrapper: '',
    multipleUserQueryStringKeys: true,
    name: 'SPI Tools Pages (requires login)',
  },
  checkUserWikiSearch: {
    baseurl: 'https://checkuser.wikimedia.org/w/index.php',
    appendToQueryString: 'ns0=1',
    userQueryStringKey: 'search',
    userQueryStringSeparator: ' OR ',
    userQueryStringWrapper: '"',
    multipleUserQueryStringKeys: false,
    name: 'Checkuser wiki search',
  },
};

/* Actually put the portlets in place if needed */
if (mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/')
  && !mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/SPI/')) {
  mw.loader.load('mediawiki.user');
  $(spiHelperAddLink);
}

// Main functions - do the meat of the processing and UI work
/**
 * Initialization functions for spiHelper, displays the top-level menu
 */
async function spiHelperInit() {
  spiHelperCaseSections = await spiHelperGetInvestigationSectionIDs();

  // Load archivenotice params
  const archiveNoticeResult = await spiHelperParseArchiveNotice(spiHelperPageName.replace(/\/Archive/, ''));

  // First, insert the template text
  displayMessage(spiHelperTopViewHTML);

  // Narrow search scope
  const $topView = $('#spiHelper_topViewDiv', document);
  await updateForRole($topView);

  if (archiveNoticeResult === null) {
    // No archive notice was found
    const $warningText = $('#spiHelper_warning', $topView);
    $warningText.show();
    $warningText.append($('<b>').text('Can\'t find archivenotice template! Automatically adding the archive notice to the page.'));
    const newArchiveNotice = spiHelperMakeNewArchiveNotice({
      username: spiHelperCaseName,
      xwiki: false,
      deny: false,
      notalk: false,
    });
    let pageText = await spiHelperGetPageText(spiHelperPageName, false);
    if (spiHelperPriorCasesRegex.exec(pageText) === null) {
      pageText = '{{SPIpriorcases}}\n' + pageText;
    }
    pageText = newArchiveNotice + '\n' + pageText;
    if (pageText.indexOf('__TOC__') === -1) {
      pageText = '<noinclude>__TOC__</noinclude>\n' + pageText;
    }
    await spiHelperEditPage(spiHelperPageName, pageText, 'Adding archive notice', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
  }
  else {
    spiHelperArchiveNoticeParams = archiveNoticeResult;
  }

  // Next, modify what's displayed
  // Set the block selection label based on whether the user is an admin
  $('#spiHelper_blockLabel', $topView).text(spiHelperIsAdmin() ? 'Block/tag socks' : 'Tag socks');

  // Wire up a couple of onclick handlers
  $('#spiHelper_Move', $topView).on('click', function () {
    spiHelperUpdateArchive();
  });
  $('#spiHelper_Archive', $topView).on('click', function () {
    spiHelperUpdateMove();
  });

  // Generate the section selector
  const $sectionSelect = $('#spiHelper_sectionSelect', $topView);
  $sectionSelect.on('change', () => {
    spiHelperSetCheckboxesBySection();
  });

  // Add the dates to the selector
  for (const section of spiHelperCaseSections) {
    $('<option>').val(section.index).text(section.line).appendTo($sectionSelect);
  }
  // All-sections selector...deliberately at the bottom, the default should be the first section
  $('<option>').val('all').text('All Sections').appendTo($sectionSelect);

  // Only show options suitable for the archive subpage when running on the archives
  if (!spiHelperIsThisPageAnArchive) {
    $('.spiHelper_notOnArchive', $topView).show();
  }
  // Set the checkboxes to their default states
  await spiHelperSetCheckboxesBySection();

  $('#spiHelper_GenerateForm', $topView).one('click', () => {
    spiHelperGenerateForm();
  });
}

/**
 * Big function to generate the SPI form from the top-level menu selections
 *
 * Would fail ESlint no-unused-vars due to only being
 * referenced in an onclick event
 *
 * @return {Promise<void>}
 */
async function spiHelperGenerateForm(): Promise<void> {
  spiHelperBlockTableUserCount = 0;
  spiHelperLinkTableUserCount = 0;
  const $topView = $('#spiHelper_topViewDiv', document);
  spiHelperActionsSelected.Case_act = $('#spiHelper_Case_Action', $topView).prop('checked');
  spiHelperActionsSelected.Block = $('#spiHelper_BlockTag', $topView).prop('checked');
  spiHelperActionsSelected.Link = $('#spiHelper_userInfo', $topView).prop('checked');
  spiHelperActionsSelected.Close = $('#spiHelper_Close', $topView).prop('checked');
  spiHelperActionsSelected.Note = $('#spiHelper_Comment', $topView).prop('checked') || spiHelperActionsSelected.Case_act || spiHelperActionsSelected.Block || spiHelperActionsSelected.Close;
  spiHelperActionsSelected.Rename = $('#spiHelper_Move', $topView).prop('checked');
  spiHelperActionsSelected.Archive = $('#spiHelper_Archive', $topView).prop('checked');
  spiHelperActionsSelected.SpiMgmt = $('#spiHelper_SpiMgmt', $topView).prop('checked');
  const pageText = await spiHelperGetPageText(spiHelperPageName, false, spiHelperSectionId);
  if (!(spiHelperActionsSelected.Case_act
    || spiHelperActionsSelected.Note || spiHelperActionsSelected.Close
    || spiHelperActionsSelected.Archive || spiHelperActionsSelected.Block || spiHelperActionsSelected.Link
    || spiHelperActionsSelected.Rename || spiHelperActionsSelected.SpiMgmt)) {
    displayMessage('');
    return;
  }

  displayMessage(spiHelperActionViewHTML);
  // FIXME
  const addBlockButton = document.getElementById('AddBlockLink');
  addBlockButton?.addEventListener('click', () => {
    spiHelperAddBlankUserLine('block');
  });
  const addLinkButton = document.getElementById('AddSockLink');
  addLinkButton?.addEventListener('click', () => {
    spiHelperAddBlankUserLine('link');
  });

  // Reduce the scope that jquery operates on
  const $actionView = $('#spiHelper_actionViewDiv', document);
  await updateForRole($actionView);

  // Wire up the action view
  $('#spiHelper_backLink', $actionView).one('click', () => {
    spiHelperInit();
  });
  if (spiHelperActionsSelected.Case_act) {
    const result = spiHelperCaseStatusRegex.exec(pageText);
    let caseStatus = '';
    if (result && result[1]) {
      caseStatus = result[1];
    }
    const canAddCURequest = (caseStatus === '' || /^(?:admin|moreinfo|cumoreinfo|hold|cuhold|clerk|open)$/i.test(caseStatus));
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
    else if (spiHelperIsClerk() && caseStatus === 'clerk') {
      // Allow clerks to change the status from clerk to open.
      // Used when clerk assistance has been given and the case previously had the status 'open'.
      selectOpts.push({ label: 'Mark as open', value: 'open', selected: false });
    }
    else if (spiHelperIsAdmin() && caseStatus === 'admin') {
      // Allow admins to change the status to open from admin
      // Used when admin assistance has been given to the non-admin clerk and the case previously had the status 'open'.
      selectOpts.push({ label: 'Mark as open', value: 'open', selected: false });
    }
    if (spiHelperIsCheckuser()) {
      selectOpts.push({ label: 'Mark as in progress', value: 'inprogress', selected: false });
    }
    if (spiHelperIsClerk() || spiHelperIsAdmin()) {
      selectOpts.push({ label: 'Request more information', value: 'moreinfo', selected: false });
    }
    if (canAddCURequest) {
      // Statuses only available if the case could be moved to "CU requested"
      selectOpts.push({ label: 'Request CU', value: 'CUrequest', selected: false });
      if (spiHelperIsClerk()) {
        selectOpts.push({ label: 'Request CU and self-endorse', value: 'selfendorse', selected: false });
      }
    }
    // CU already requested
    if (cuRequested && spiHelperIsClerk()) {
      // Statuses only available if CU has been requested, only clerks + CUs should use these
      selectOpts.push({ label: 'Endorse for CU attention', value: 'endorse', selected: false });
      // Switch the decline option depending on whether the user is a checkuser
      if (spiHelperIsCheckuser()) {
        selectOpts.push({ label: 'Endorse CU as a CheckUser', value: 'cuendorse', selected: false });
      }
      if (spiHelperIsCheckuser()) {
        selectOpts.push({ label: 'Decline CU', value: 'cudecline', selected: false });
      }
      else {
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
    // I think this is only useful for non-admin clerks to ask admins to do stuff
    if (!spiHelperIsAdmin() && spiHelperIsClerk()) {
      selectOpts.push({ label: 'Request admin action', value: 'admin', selected: false });
    }
    // Generate the case action options
    spiHelperGenerateSelect('spiHelper_CaseAction', selectOpts);
    // Add the onclick handler to the drop-down
    $('#spiHelper_CaseAction', $actionView).on('change', function (e) {
      spiHelperCaseActionUpdated($(e.target));
    });

    $('#spiHelper_actionView', $actionView).show();
  }

  if (spiHelperActionsSelected.SpiMgmt) {
    const $xwikiBox = $('#spiHelper_spiMgmt_crosswiki', $actionView);
    const $denyBox = $('#spiHelper_spiMgmt_deny', $actionView);
    const $notalkBox = $('#spiHelper_spiMgmt_notalk', $actionView);

    $xwikiBox.prop('checked', spiHelperArchiveNoticeParams.xwiki);
    $denyBox.prop('checked', spiHelperArchiveNoticeParams.deny);
    $notalkBox.prop('checked', spiHelperArchiveNoticeParams.notalk);

    $('#spiHelper_spiMgmtView', $actionView).show();
  }

  if (spiHelperActionsSelected.Close) {
    $('#spiHelper_closeView', $actionView).show();
  }
  if (spiHelperActionsSelected.Archive) {
    $('#spiHelper_archiveView', $actionView).show();
  }
  // Only give the option to comment if we selected a specific section, and we are not running on an archive subpage
  if (spiHelperSectionId && spiHelperActionsSelected.Note && !spiHelperIsThisPageAnArchive) {
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
    spiHelperGenerateSelect('spiHelper_noteSelect', spiHelperNoteTemplates);
    $('#spiHelper_noteSelect', $actionView).on('change', function (e) {
      spiHelperInsertNote($(e.target));
    });
    spiHelperGenerateSelect('spiHelper_adminSelect', spiHelperAdminTemplates);
    $('#spiHelper_adminSelect', $actionView).on('change', function (e) {
      spiHelperInsertTextFromSelect($(e.target));
    });
    spiHelperGenerateSelect('spiHelper_cuSelect', spiHelperCUTemplates);
    $('#spiHelper_cuSelect', $actionView).on('change', function (e) {
      spiHelperInsertTextFromSelect($(e.target));
    });
    $('#spiHelper_previewLink', $actionView).on('click', function () {
      spiHelperPreviewText();
    });
    $('#spiHelper_commentView', $actionView).show();
  }
  if (spiHelperActionsSelected.Rename) {
    if (spiHelperSectionId) {
      $('#spiHelper_moveHeader', $actionView).text('Move section "' + spiHelperSectionName + '"');
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
    likelyUsers.push(spiHelperCaseName);

    const sockList = $(`a[href$="section=${spiHelperSectionId}"]`).parents().not(':has(hr)').nextUntil('hr').find('.cuEntry').find('a:first');
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
      $('#spiHelper_block_doblock', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_acb', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_ab', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_tp', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_email', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_lock', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_lock', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      spiHelperGenerateSelect('spiHelper_block_tag', spiHelperTagOptions);
      $('#spiHelper_block_tag', $actionView).on('change', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      spiHelperGenerateSelect('spiHelper_block_tag_altmaster', spiHelperAltMasterTagOptions);
      $('#spiHelper_block_tag_altmaster', $actionView).on('change', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });
      $('#spiHelper_block_lock', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'block');
      });

      for (const likelyUser of likelyUsers) {
        spiHelperBlockTableUserCount++;
        await spiHelperGenerateBlockTableLine(likelyUser, true, spiHelperBlockTableUserCount);
      }
      for (const likelyIP of likelyIPs) {
        spiHelperBlockTableUserCount++;
        await spiHelperGenerateBlockTableLine(likelyIP, true, spiHelperBlockTableUserCount);
      }
      for (const possibleUser of possibleUsers) {
        spiHelperBlockTableUserCount++;
        await spiHelperGenerateBlockTableLine(possibleUser, false, spiHelperBlockTableUserCount);
      }
      for (const possibleIP of possibleIPs) {
        spiHelperBlockTableUserCount++;
        await spiHelperGenerateBlockTableLine(possibleIP, false, spiHelperBlockTableUserCount);
      }
    }
    if (spiHelperActionsSelected.Link) {
      // Wire up the "select all" options
      $('#spiHelper_link_editorInteractionAnalyser', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'link');
      });
      $('#spiHelper_link_interactionTimeline', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'link');
      });
      $('#spiHelper_link_timecardSPITools', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'link');
      });
      $('#spiHelper_link_consolidatedTimelineSPITools', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'link');
      });
      $('#spiHelper_link_pagesSPITools', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'link');
      });
      $('#spiHelper_link_checkUserWikiSearch', $actionView).on('click', function (e) {
        spiHelperSetAllTableColumnOpts($(e.target), 'link');
      });

      for (const likelyUser of likelyUsers) {
        spiHelperLinkTableUserCount++;
        await spiHelperGenerateLinksTableLine(likelyUser, spiHelperLinkTableUserCount);
      }
      for (const likelyIP of likelyIPs) {
        spiHelperLinkTableUserCount++;
        await spiHelperGenerateLinksTableLine(likelyIP, spiHelperLinkTableUserCount);
      }
      for (const possibleUser of possibleUsers) {
        spiHelperLinkTableUserCount++;
        await spiHelperGenerateLinksTableLine(possibleUser, spiHelperLinkTableUserCount);
      }
      for (const possibleIP of possibleIPs) {
        spiHelperLinkTableUserCount++;
        await spiHelperGenerateLinksTableLine(possibleIP, spiHelperLinkTableUserCount);
      }
      $('#spiHelper_sockLinksView', $actionView).show();
    }
    $('#spiHelper_blockTagView', $actionView).show();
  }
  // Wire up the submit button
  $('#spiHelper_performActions', $actionView).one('click', () => {
    spiHelperPerformActions();
  });
}

/**
 * Update the view for the roles of the person running the script
 * by selectively hiding.
 * view: @type JQuery object representing the class / id for the view
 */
async function updateForRole(view: JQuery<HTMLElement>) {
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

/**
 * Archives everything on the page that's eligible for archiving
 */
async function spiHelperOneClickArchive() {
  spiHelperActiveOperations.set('oneClickArchive', 'running');

  const pagetext = await spiHelperGetPageText(spiHelperPageName, false);
  spiHelperCaseSections = await spiHelperGetInvestigationSectionIDs();
  if (!spiHelperSectionRegex.test(pagetext)) {
    alert('Looks like the page has been archived already.');
    spiHelperActiveOperations.set('oneClickArchive', 'successful');
    return;
  }
  displayMessage('<ul id="spiHelper_status"/>');
  await spiHelperArchiveCase();
  await spiHelperPurgePage(spiHelperPageName);
  const logMessage = '* [[' + spiHelperPageName + ']]: used one-click archiver ~~~~~';
  if (spiHelperSettings.log) {
    await spiHelperLog(logMessage);
  }
  $('#spiHelper_status', document).append($('<li>').text('Done!'));
  spiHelperActiveOperations.set('oneClickArchive', 'successful');
}

/**
 * Given a tag entry, runs the required logic and tags the user
 * @param {TagEntry} tagEntry Tag entry to run the logic for
 * @param {boolean} tagNonLocalAccounts Whether to tag accounts that don't exist locally
 * @param {string} sockmaster The username of the sockmaster to tag for
 * @param {string} altmaster The username of the alternate master to tag for
 * @return {Promise<boolean>} Whether the tag was successfully applied
 */
async function spiHelperTagUser(tagEntry: TagEntry, tagNonLocalAccounts: boolean, sockmaster: string, altmaster: string): Promise<boolean> {
  if (mw.util.isIPAddress(tagEntry.username, true)) {
    return false; // do not support tagging IPs
  }
  const userInfo = await spiHelperGetGlobalUser(tagEntry.username);
  if (!userInfo || !userInfo.exists_locally) {
    // Skip, don't tag accounts that don't exist
    const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
    $statusLine.addClass('spihelper-errortext').html('<b>The account ' + tagEntry.username + ' does not exist and so has not been tagged.</b>');
    return false;
  }
  if (!tagNonLocalAccounts && !userInfo.exists_locally) {
    // Skip as the account does not exist locally and the "tag accounts that don't exist locally" setting is unchecked.
    return false;
  }

  let tagText = '';
  let altmasterName = '';
  let altmasterTag = '';
  if (altmaster !== '' && tagEntry.altmasterTag !== '') {
    altmasterName = altmaster;
    altmasterTag = tagEntry.altmasterTag;
  }
  let isMaster = false;
  let tag: string;
  let checked = '';
  switch (tagEntry.tag) {
    case 'master':
      tag = 'blocked';
      isMaster = true;
      break;
    case 'sockmasterchecked':
      tag = 'blocked';
      checked = 'yes';
      isMaster = true;
      break;
    case 'bannedmaster':
      tag = 'banned';
      checked = 'yes';
      isMaster = true;
      break;
    default:
      tag = tagEntry.tag;
  }

  const isNotBlocked = !userInfo.exists_locally || !(await spiHelperGetUserBlockSettings(tagEntry.username));

  if (isMaster) {
    // Not doing SPI or LTA fields for now - those auto-detect right
    // now, and I'm not sure if setting them to empty would mess that up
    tagText += `{{sockpuppeteer
| 1 = ${tag}
| checked = ${checked}
| locked = ${userInfo.locked}
}}`;
  }
  // Not if-else because we tag something as both sock and master if they're a
  // sockmaster and have a suspected altmaster
  if (!isMaster || altmasterName) {
    let sockmasterName = sockmaster;
    if (altmasterName && isMaster) {
      // If we have an altmaster and we're the master, swap a few values around
      sockmasterName = altmasterName;
      tag = altmasterTag === 'suspected' ? 'blocked' : altmasterTag;
      altmasterName = '';
      altmasterTag = '';
      tagText += '\n';
    }
    tagText += `{{sockpuppet
| 1 = ${sockmasterName}
| 2 = ${tag}
| locked = ${userInfo.locked}
| notblocked = ${isNotBlocked ? 'yes' : 'no'}
| altmaster = ${altmasterName}
| altmaster-status = ${altmasterTag}
}}`;
  }
  await spiHelperEditPage('User:' + tagEntry.username, tagText, 'Adding sockpuppetry tag per [[' + spiHelperGetInterwikiPrefix() + spiHelperPageName + ']]',
    false, spiHelperSettings.watchTaggedUser, spiHelperSettings.watchTaggedUserExpiry);
  return true;
}

/**
 * Given a block entry, runs the required logic and blocks the user
 *
 * @param {BlockEntry} blockEntry Block entry to run the logic for
 * @param {boolean} cuBlock Whether to use the {{checkuserblock}} template family
 * @param {boolean} cuBlockOnly Whether to use just {{checkuserblock}} without an additional summary
 * @param {boolean} overrideExisting Whether any existing blocks should be overriden
 * @param {boolean} blankTalk Whether the user's talk page should be blanked before adding the block template
 * @param {string} sockmaster Username of the sockmaster
 * @return {Promise<boolean>} Whether the block succeeded
 */
async function spiHelperBlockUser(blockEntry: BlockEntry, cuBlock: boolean, cuBlockOnly: boolean, overrideExisting: boolean, blankTalk: boolean, sockmaster: string): Promise<boolean> {
  const blockSettings = await spiHelperGetUserBlockSettings(blockEntry.username);
  const blockReason = blockSettings?.reason;
  if (!spiHelperIsCheckuser() && overrideExisting && blockReason && spiHelperCUBlockRegex.exec(blockReason)) {
    // If you're not a checkuser, we've asked to overwrite existing blocks, and the block
    // target has a CU block on them, check whether that was intended
    if (!confirm('User ' + blockEntry.username + ' appears to be CheckUser-blocked, are you SURE you want to re-block them?\n'
      + 'Current block message:\n' + blockReason,
    )) {
      return false;
    }
  }
  const isIP = mw.util.isIPAddress(blockEntry.username, true);
  const isIPRange = isIP && !mw.util.isIPAddress(blockEntry.username, false);
  let blockSummary = 'Abusing [[WP:SOCK|multiple accounts]]: Please see: [[' + spiHelperInterwikiPrefix + spiHelperPageName + ']]';
  if (spiHelperIsCheckuser() && cuBlock) {
    const cublockTemplate = isIP ? ('{{checkuserblock}}') : ('{{checkuserblock-account}}');
    if (cuBlockOnly) {
      blockSummary = cublockTemplate;
    }
    else {
      blockSummary = cublockTemplate + ': ' + blockSummary;
    }
  }
  else if (isIPRange) {
    blockSummary = '{{rangeblock|1= ' + blockSummary
      + (blockEntry.acb ? '' : '|create=yes') + '}}';
  }
  const blockSuccess = await spiHelperWikiBlockUser(
    blockEntry.username,
    blockEntry.duration,
    blockSummary,
    overrideExisting,
    (isIP ? blockEntry.ab : false),
    blockEntry.acb,
    (isIP ? false : blockEntry.ab),
    blockEntry.ntp,
    blockEntry.nem,
    spiHelperSettings.watchBlockedUser,
    spiHelperSettings.watchBlockedUserExpiry);
  if (!blockSuccess) {
    // Don't add a block notice if we failed to block
    if (blockEntry.tpn) {
      // Also warn the user if we were going to post a block notice on their talk page
      const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
      $statusLine.addClass('spihelper-errortext').html('<b>Block failed on ' + blockEntry.username + ', not adding talk page notice</b>');
    }
    return false;
  }

  if (isIPRange) {
    // There isn't really a talk page for an IP range, so return here before we reach that section
    return blockSuccess;
  }
  // Talk page notice
  if (blockEntry.tpn) {
    let newText: string;
    let isSock = blockEntry.tpn.includes('sock');
    // Hacky workaround for when we didn't make a master tag
    if (isSock && blockEntry.username === spiHelperNormalizeUsername(sockmaster)) {
      isSock = false;
    }
    if (isSock) {
      newText = '== Blocked as a sockpuppet ==\n';
    }
    else {
      newText = '== Blocked for sockpuppetry ==\n';
    }
    const isCheckUserBlockAccount = spiHelperIsCheckuser() && cuBlock && spiHelperSettings.useCheckuserblockAccount;
    if (isCheckUserBlockAccount) {
      newText += '{{checkuserblock-account|sig=~~~~';
    }
    else {
      newText += '{{subst:uw-sockblock|sig=yes';
    }
    newText += '|spi=' + spiHelperCaseName;
    if (blockEntry.duration === 'indefinite' || blockEntry.duration === 'infinity') {
      newText += '|indef=yes';
    }
    else {
      newText += '|time=' + blockEntry.duration;
      if (isCheckUserBlockAccount) {
        newText += '|indef=no';
      }
    }
    if (blockEntry.ntp) {
      newText += '|notalk=yes';
    }
    if (isSock) {
      newText += '|master=' + sockmaster;
    }
    newText += '}}';

    if (!blankTalk) {
      const oldtext = await spiHelperGetPageText('User talk:' + blockEntry.username, true);
      if (oldtext !== '') {
        newText = oldtext + '\n' + newText;
      }
    }
    // Hardcode the watch setting to 'nochange' since we will have either
    // watched or not watched based on the _boolean_ watchBlockedUser
    await spiHelperEditPage('User talk:' + blockEntry.username,
      newText, 'Adding sockpuppetry block notice per [[' + spiHelperGetInterwikiPrefix() + spiHelperPageName + ']]', false, 'nochange');
  }

  return true;
}

/**
 * Goes through the action selections and executes them
 */
async function spiHelperPerformActions() {
  spiHelperActiveOperations.set('mainActions', 'running');

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

  if (spiHelperActionsSelected.Case_act) {
    const caseActionValue = $('#spiHelper_CaseAction', $actionView).val();
    if (!caseActionValue) {
      console.error('Failed to find #spiHelper_CaseAction element');
      return;
    }
    newCaseStatus = caseActionValue.toString();
  }
  if (spiHelperActionsSelected.SpiMgmt) {
    spiHelperArchiveNoticeParams.deny = $('#spiHelper_spiMgmt_deny', $actionView).prop('checked');
    spiHelperArchiveNoticeParams.xwiki = $('#spiHelper_spiMgmt_crosswiki', $actionView).prop('checked');
    spiHelperArchiveNoticeParams.notalk = $('#spiHelper_spiMgmt_notalk', $actionView).prop('checked');
  }
  if (spiHelperSectionId && !spiHelperIsThisPageAnArchive) {
    const commentTextValue = $('#spiHelper_CommentText', $actionView).val();
    if (!commentTextValue) {
      console.error('Failed to find #spiHelper_CommentText element');
      return;
    }
    comment = commentTextValue.toString();
  }
  if (spiHelperActionsSelected.Block) {
    if (spiHelperIsCheckuser()) {
      cuBlock = $('#spiHelper_cublock', $actionView).prop('checked');
      cuBlockOnly = $('#spiHelper_cublockonly', $actionView).prop('checked');
    }

    const blockAvailable = spiHelperIsAdmin() && !$('#spiHelper_noblock', $actionView).prop('checked');
    const masterNotice = $('#spiHelper_blocknoticemaster', $actionView).prop('checked');
    const sockNotice = $('#spiHelper_blocknoticesocks', $actionView).prop('checked');
    for (let i = 1; i <= spiHelperBlockTableUserCount; i++) {
      const usernameValue = $('#spiHelper_block_username' + i, $actionView).val();
      if (!usernameValue) {
        // Skip blank usernames, empty string is falsey
        console.error('Failed to find #spiHelper_block_username element for user #' + i);
        continue;
      }
      const username = spiHelperNormalizeUsername(usernameValue.toString());
      const tag = $('#spiHelper_block_tag' + i, $actionView).val()?.toString() ?? '';
      const doBlock = $('#spiHelper_block_doblock' + i, $actionView).prop('checked');

      if (blockAvailable && doBlock) {
        let noticeType = '';
        if (masterNotice && (tag.includes('master') || spiHelperNormalizeUsername(spiHelperCaseName) === username)) {
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
  if (spiHelperActionsSelected.Close) {
    spiHelperActionsSelected.Close = $('#spiHelper_CloseCase', $actionView).prop('checked');
  }
  if (spiHelperActionsSelected.Rename) {
    const moveTargetVal = $('#spiHelper_moveTarget', $actionView).val();
    if (moveTargetVal) {
      renameTarget = spiHelperNormalizeUsername(moveTargetVal.toString());
    }
    else {
      console.error('Failed to find #spiHelper_moveTarget element');
    }
  }
  if (spiHelperActionsSelected.Archive) {
    spiHelperActionsSelected.Archive = $('#spiHelper_ArchiveCase', $actionView).prop('checked');
  }

  displayMessage('<div id="linkViewResults" hidden><h4>Generated links</h4><ul id="linkViewResultsList"></ul></div><h4>Running actions</h4><ul id="spiHelper_status" />');

  const $statusAnchor = $('#spiHelper_status', document);

  let sectionText = await spiHelperGetPageText(spiHelperPageName, true, spiHelperSectionId);
  let editSummary = '';
  let logMessage = '* [[' + spiHelperPageName + ']]';
  if (spiHelperSectionId) {
    logMessage += ' (section ' + spiHelperSectionName + ')';
  }
  else {
    logMessage += ' (full case)';
  }
  logMessage += ' ~~~~~';

  if (spiHelperActionsSelected.Link) {
    $('#linkViewResults', document).show();
    const spiHelperUsersForLinks: {
      editorInteractionAnalyser: string[];
      interactionTimeline: string[];
      timecardSPITools: string[];
      consolidatedTimelineSPITools: string[];
      pagesSPITools: string[];
      checkUserWikiSearch: string[];
    } = {
      editorInteractionAnalyser: [],
      interactionTimeline: [],
      timecardSPITools: [],
      consolidatedTimelineSPITools: [],
      pagesSPITools: [],
      checkUserWikiSearch: [],
    };

    for (let i = 1; i <= spiHelperLinkTableUserCount; i++) {
      const usernameValue = $('#spiHelper_block_username' + i, $actionView).val();
      if (!usernameValue) {
        // Skip blank usernames, empty string is falsey
        console.error('Failed to find #spiHelper_block_username element for user #' + i);
        continue;
      }
      const username = spiHelperNormalizeUsername(usernameValue.toString());
      if (!username) {
        // Skip blank usernames
        continue;
      }
      if ($('#spiHelper_link_editorInteractionAnalyser' + i, $actionView).prop('checked')) spiHelperUsersForLinks.editorInteractionAnalyser.push(username);
      if ($('#spiHelper_link_interactionTimeline' + i, $actionView).prop('checked')) spiHelperUsersForLinks.interactionTimeline.push(username);
      if ($('#spiHelper_link_timecardSPITools' + i, $actionView).prop('checked')) spiHelperUsersForLinks.timecardSPITools.push(username);
      if ($('#spiHelper_link_consolidatedTimelineSPITools' + i, $actionView).prop('checked')) spiHelperUsersForLinks.consolidatedTimelineSPITools.push(username);
      if ($('#spiHelper_link_pagesSPITools' + i, $actionView).prop('checked')) spiHelperUsersForLinks.pagesSPITools.push(username);
      if ($('#spiHelper_link_checkUserWikiSearch' + i, $actionView).prop('checked')) spiHelperUsersForLinks.checkUserWikiSearch.push(username);
    }

    const $linkViewList = $('#linkViewResultsList', document);
    for (const linkType in spiHelperUsersForLinks) {
      const linkKey = linkType as keyof typeof spiHelperUsersForLinks;
      if (spiHelperUsersForLinks[linkKey].length === 0) continue;
      const URLentry = spiHelperLinkViewURLFormats[linkKey];
      let generatedURL = URLentry.baseurl + '?' + (URLentry.multipleUserQueryStringKeys ? '' : URLentry.userQueryStringKey + '=');
      for (let i = 0; i < spiHelperUsersForLinks[linkKey].length; i++) {
        const username = spiHelperUsersForLinks[linkKey][i] as string;
        generatedURL += (i === 0 ? '' : URLentry.userQueryStringSeparator);
        if (URLentry.multipleUserQueryStringKeys) {
          generatedURL += URLentry.userQueryStringKey + '=' + URLentry.userQueryStringWrapper + encodeURIComponent(username) + URLentry.userQueryStringWrapper;
        }
        else {
          generatedURL += URLentry.userQueryStringWrapper + encodeURIComponent(username) + URLentry.userQueryStringWrapper;
        }
      }
      generatedURL += (URLentry.appendToQueryString === '' ? '' : '&') + URLentry.appendToQueryString;
      const $statusLine = $('<li>').appendTo($linkViewList);
      const $statusLineLink = $('<a>').appendTo($statusLine);
      $statusLineLink.attr('href', generatedURL).attr('target', '_blank').attr('rel', 'noopener noreferrer').text(spiHelperLinkViewURLFormats[linkKey].name);
    }
  }

  if (spiHelperSectionId !== null && !spiHelperIsThisPageAnArchive) {
    const caseStatusResult = spiHelperCaseStatusRegex.exec(sectionText);
    let oldCaseStatus: string;
    if (caseStatusResult === null || !caseStatusResult[1]) {
      // The case status is malformed, reset it
      sectionText = sectionText.replace(/^(\s*===.*===[^\S\r\n]*)/, '$1\n{{SPI case status|}}');
      // Maybe this should be 'new'?
      oldCaseStatus = 'open';
    }
    else {
      oldCaseStatus = caseStatusResult[1];
    }
    if (newCaseStatus === 'noaction') {
      newCaseStatus = oldCaseStatus;
    }

    if (spiHelperActionsSelected.Case_act && newCaseStatus !== 'noaction' && newCaseStatus !== oldCaseStatus) {
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

  if (spiHelperActionsSelected.SpiMgmt) {
    spiHelperArchiveNoticeParams.username = spiHelperCaseName;
    const newArchiveNotice = spiHelperMakeNewArchiveNotice(spiHelperArchiveNoticeParams);
    sectionText = sectionText.replace(spiHelperArchiveNoticeRegex, newArchiveNotice);
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
  if (spiHelperActionsSelected.Block) {
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
      sockmaster = prompt('Please enter the name of the sockmaster: ', spiHelperCaseName) || spiHelperCaseName;
    }
    if (needsAltmaster) {
      altmaster = prompt('Please enter the name of the alternate sockmaster: ', spiHelperCaseName) || spiHelperCaseName;
    }

    const tagNonLocalAccounts = $('#spiHelper_tagAccountsWithoutLocalAccount', $actionView).prop('checked');
    let blockingPromises: Promise<void>[] = [];
    if (spiHelperIsAdmin()) {
      // Block, then tag
      blockingPromises = spiHelperBlocks.map(async (blockEntry) => {
        const blockSuccess = await spiHelperBlockUser(blockEntry, cuBlock, cuBlockOnly, overrideExisting, blankTalk, sockmaster);
        if (!blockSuccess) return;

        loggingArrays.blocked.push('{{noping|' + blockEntry.username + '}}');
        const tagEntry = spiHelperTags.find(tag => tag.username === blockEntry.username);
        if (tagEntry) {
          const tagSuccess = await spiHelperTagUser(tagEntry, tagNonLocalAccounts, sockmaster, altmaster);
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
      const tagSuccess = await spiHelperTagUser(tagEntry, tagNonLocalAccounts, sockmaster, altmaster);
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
            'Creating sockpuppet category per [[' + interwikiPrefix + spiHelperPageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      if (checkAltSuspectedCat) {
        const catName = 'Category:Suspected Wikipedia sockpuppets of ' + altmaster;
        const catText = await spiHelperGetPageText(catName, false);
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + spiHelperPageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      if (checkConfirmedCat) {
        const catName = 'Category:Wikipedia sockpuppets of ' + sockmaster;
        const catText = await spiHelperGetPageText(catName, false);
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + spiHelperPageName + ']]',
            true, spiHelperSettings.watchNewCats, spiHelperSettings.watchNewCatsExpiry);
          needsPurge = true;
        }
      }
      if (checkSuspectedCat) {
        const catName = 'Category:Suspected Wikipedia sockpuppets of ' + sockmaster;
        const catText = await spiHelperGetPageText(catName, false);
        if (!catText) {
          await spiHelperEditPage(catName, '{{sockpuppet category}}',
            'Creating sockpuppet category per [[' + interwikiPrefix + spiHelperPageName + ']]',
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
          sockmaster = prompt('Please enter the name of the sockmaster: ', spiHelperCaseName) || spiHelperCaseName;
        }
        const usePlural = matchCount > 1;
        const lockComment = prompt('Please enter a comment for the global lock request (optional):', '') || '';
        const heading = hideLockNames ? (usePlural ? 'sockpuppets' : 'sockpuppet') : '[[Special:CentralAuth/' + sockmaster + '|' + sockmaster + ']] ' + (usePlural ? 'socks' : 'sock');
        let message = '=== Global lock for ' + heading + ' ===';
        message += '\n{{status}}';
        message += '\n' + lockTemplate;
        message += '\n' + (usePlural ? 'Sockpuppets' : 'Sockpuppet') + ' found in enwiki sockpuppet investigation, see [[' + spiHelperInterwikiPrefix + spiHelperPageName + ']]. ' + lockComment + ' ~~~~';

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
  if (spiHelperSectionId && comment && comment !== '*' && !spiHelperIsThisPageAnArchive) {
    if (!sectionText.includes('\n----')) {
      sectionText.replace('<!--- All comments go ABOVE this line, please. -->', '');
      sectionText.replace('<!-- All comments go ABOVE this line, please. -->', '');
      sectionText += '\n----<!-- All comments go ABOVE this line, please. -->';
    }
    if (!/~~~~/.test(comment)) {
      comment += ' ~~~~';
    }
    // Clerks and admins post in the admin section
    if (spiHelperIsClerk() || spiHelperIsAdmin()) {
      // Complicated regex to find the first regex in the admin section
      // The weird (\n|.) is because we can't use /s (dot matches newline) regex mode without ES9,
      // I don't want to go there yet
      sectionText = sectionText.replace(/\n*----(?!(\n|.)*----)/, '\n' + comment + '\n----');
    }
    else { // Everyone else posts in the "other users" section
      sectionText = sectionText.replace(spiHelperAdminSectionWithPrecedingNewlinesRegex,
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

  if (spiHelperActionsSelected.Close) {
    newCaseStatus = 'close';
    if (editSummary) {
      editSummary += ', marking case as closed';
    }
    else {
      editSummary = 'Marking case as closed';
    }
    logMessage += '\n** closed case';
  }
  if (spiHelperSectionId !== null && !spiHelperIsThisPageAnArchive) {
    const caseStatusResult = spiHelperCaseStatusRegex.exec(sectionText);
    if (caseStatusResult !== null && caseStatusResult[0]) {
      sectionText = sectionText.replace(caseStatusResult[0], '{{SPI case status|' + newCaseStatus + '}}');
    }
  }

  // Fallback: if we somehow managed to not make an edit summary, add a default one
  if (!editSummary) {
    editSummary = 'Saving page';
  }

  // Make all the requested edits (synchronous since we might make more changes to the page), unless the page is an archive (as there should be no edits made)
  if (!spiHelperIsThisPageAnArchive) {
    const editResult = await spiHelperEditPage(spiHelperPageName, sectionText, editSummary, false,
      spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry, spiHelperStartingRevID, spiHelperSectionId);
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
  spiHelperStartingRevID = await spiHelperGetPageRev(spiHelperPageName);
  if (spiHelperActionsSelected.Archive) {
    // Archive the case
    if (spiHelperSectionId === null) {
      // Archive the whole case
      logMessage += '\n** Archived case';
      await spiHelperArchiveCase();
    }
    else {
      // Just archive the selected section
      logMessage += '\n** Archived section';
      await spiHelperArchiveCaseSection(spiHelperSectionId);
    }
  }
  else if (spiHelperActionsSelected.Rename && renameTarget) {
    if (spiHelperSectionId === null) {
      // Option 1: we selected "All cases," this is a whole-case move/merge
      logMessage += '\n** moved/merged case to ' + renameTarget;
      await spiHelperMoveCase(renameTarget);
    }
    else {
      // Option 2: this is a single-section case move or merge
      logMessage += '\n** moved section to ' + renameTarget;
      await spiHelperMoveCaseSection(renameTarget, spiHelperSectionId);
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

  await spiHelperPurgePage(spiHelperPageName);
  $('#spiHelper_status', document).append($('<li>').text('Done!'));
  spiHelperActiveOperations.set('mainActions', 'successful');
}

/**
 * Logs SPI actions to userspace a la Twinkle's CSD/prod/etc. logs
 *
 * @param {string} logString String with the changes the user made
 */
async function spiHelperLog(logString: string): Promise<void> {
  const now = new Date();
  const dateString = now.toLocaleString('en', { month: 'long' }) + ' '
    + now.toLocaleString('en', { year: 'numeric' });
  const dateHeader = '==\\s*' + dateString + '\\s*==';
  const dateHeaderRe = new RegExp(dateHeader, 'i');
  const dateHeaderReWithAnyDate = /==.*?==/i;

  let logPageText = await spiHelperGetPageText('User:' + mw.config.get('wgUserName') + '/spihelper_log', false);
  if (!logPageText.match(dateHeaderRe)) {
    if (spiHelperSettings.reversed_log) {
      const firstHeaderMatch = logPageText.match(dateHeaderReWithAnyDate);
      if (firstHeaderMatch && firstHeaderMatch.index) {
        logPageText = logPageText.substring(0, firstHeaderMatch.index) + '== ' + dateString + ' ==\n' + logPageText.substring(firstHeaderMatch.index);
      }
    }
    else {
      logPageText += '\n== ' + dateString + ' ==';
    }
  }
  if (spiHelperSettings.reversed_log) {
    const firstHeaderMatch = logPageText.match(dateHeaderReWithAnyDate);
    if (firstHeaderMatch && firstHeaderMatch.index) {
      logPageText = logPageText.substring(0, firstHeaderMatch.index + firstHeaderMatch[0].length) + '\n' + logString + logPageText.substring(firstHeaderMatch.index + firstHeaderMatch[0].length);
    }
  }
  else {
    logPageText += '\n' + logString;
  }
  await spiHelperEditPage('User:' + mw.config.get('wgUserName') + '/spihelper_log', logPageText, 'Logging spihelper edits', false, 'nochange');
}

// Major helper functions
/**
 * Cleanups following a rename - update the archive notice, add an archive notice to the
 * old case name, add the original sockmaster to the sock list for reference
 *
 * @param {string} oldCasePage Title of the previous case page
 */
async function spiHelperPostRenameCleanup(oldCasePage: string): Promise<void> {
  spiHelperArchiveNoticeParams.username = spiHelperCaseName;
  const replacementArchiveNotice = spiHelperMakeNewArchiveNotice(spiHelperArchiveNoticeParams);
  const oldCaseName = oldCasePage.replace(/Wikipedia:Sockpuppet investigations\//g, '');

  // Update previous SPI redirects to this location
  const pagesChecked = [];
  const pagesToCheck = [oldCasePage];
  let currentPageToCheck = null;
  while (pagesToCheck.length !== 0) {
    currentPageToCheck = pagesToCheck.pop();
    if (!currentPageToCheck || currentPageToCheck === spiHelperPageName || currentPageToCheck === oldCasePage) {
      continue;
    }
    pagesChecked.push(currentPageToCheck);
    const backlinks = await spiHelperGetSPIBacklinks(currentPageToCheck);
    for (let i = 0; i < backlinks.length; i++) {
      const archiveNotice = await spiHelperParseArchiveNotice(backlinks[i].title);
      if (!archiveNotice) {
        continue;
      }
      if (archiveNotice.username === currentPageToCheck.replace(/Wikipedia:Sockpuppet investigations\//g, '')) {
        void spiHelperEditPage(backlinks[i].title, replacementArchiveNotice, 'Updating case following page move', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
        if (pagesChecked.indexOf(backlinks[i].title) !== -1) {
          pagesToCheck.push(backlinks[i]);
        }
      }
    }
  }

  // The old case should just be the archivenotice template and point to the new case
  await spiHelperEditPage(oldCasePage, replacementArchiveNotice, 'Updating case following page move', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);

  // The new case's archivenotice should be updated with the new name
  let newPageText = await spiHelperGetPageText(spiHelperPageName, true);
  newPageText = newPageText.replace(spiHelperArchiveNoticeRegex, '{{SPI archive notice|1=' + spiHelperCaseName + '$2}}');
  // We also want to add the previous master to the sock list
  // We use SOCK_SECTION_RE_WITH_NEWLINE to clean up any extraneous whitespace
  newPageText = newPageText.replace(spiHelperSockSectionWithNewlineRegex, '====Suspected sockpuppets====' + '\n* {{checkuser|1=' + oldCaseName + '}} ({{clerknote}} original case name)\n');
  // Also remove the new master if they're in the sock list
  // This RE is kind of ugly. The idea is that we find everything from the level 4 heading
  // ending with "sockpuppets" to the level 4 heading beginning with <big> and pull the checkuser
  // template matching the current case name out. This keeps us from accidentally replacing a
  // checkuser entry in the admin section
  const newMasterReString = '(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?' + spiHelperCaseName + '(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)';
  const newMasterRe = new RegExp(newMasterReString, 'sm');
  newPageText = newPageText.replace(newMasterRe, '$1\n$2');

  await spiHelperEditPage(spiHelperPageName, newPageText, 'Updating case following page move', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
  // Update to the latest revision ID
  spiHelperStartingRevID = await spiHelperGetPageRev(spiHelperPageName);
}

/**
 * Cleanups following a merge - re-insert the original page text
 *
 * @param {string} originalText Text of the page pre-merge
 */
async function spiHelperPostMergeCleanup(originalText: string): Promise<void> {
  let newText = await spiHelperGetPageText(spiHelperPageName, false);
  // Remove the SPI header templates from the page
  newText = newText.replace(/\n*<noinclude>__TOC__.*\n/ig, '');
  newText = newText.replace(spiHelperArchiveNoticeRegex, '');
  newText = newText.replace(spiHelperPriorCasesRegex, '');
  newText = originalText + '\n' + newText;

  // Write the updated case
  await spiHelperEditPage(spiHelperPageName, newText, 'Re-adding previous cases following merge', false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
  // Update to the latest revision ID
  spiHelperStartingRevID = await spiHelperGetPageRev(spiHelperPageName);
}

/**
 * Archive all closed sections of a case
 */
async function spiHelperArchiveCase(): Promise<void> {
  let i = 0;
  let previousRev = 0;
  while (i < spiHelperCaseSections.length) {
    const section = spiHelperCaseSections[i];
    if (!section) {
      continue;
    }
    const sectionId = parseInt(section.index);
    const sectionText = await spiHelperGetPageText(spiHelperPageName, false, sectionId);

    const currentRev = await spiHelperGetPageRev(spiHelperPageName);
    if (previousRev === currentRev && currentRev !== 0) {
      // Our previous archive hasn't gone through yet, wait a bit and retry
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Re-grab the case sections list since the page may have updated
      spiHelperCaseSections = await spiHelperGetInvestigationSectionIDs();
      continue;
    }
    previousRev = await spiHelperGetPageRev(spiHelperPageName);
    i++;
    const result = spiHelperCaseStatusRegex.exec(sectionText);
    if (result === null || !result[1]) {
      // Bail out - can't find the case status template in this section
      continue;
    }
    if (spiHelperCaseClosedRegex.test(result[1])) {
      // A running concern with the SPI archives is whether they exceed the post-expand
      // include size. Calculate what percent of that size the archive will be if we
      // add the current page to it - if >1, we need to archive the archive
      const postExpandPercent
        = (await spiHelperGetPostExpandSize(spiHelperPageName, sectionId)
          + await spiHelperGetPostExpandSize(spiHelperGetArchiveName()))
        / spiHelperGetMaxPostExpandSize();
      if (postExpandPercent >= 1) {
        // We'd overflow the archive, so move it and then archive the current page
        // Find the first empty archive page
        let archiveId = 1;
        while (await spiHelperGetPageText(spiHelperGetArchiveName() + '/' + archiveId, false) !== '') {
          archiveId++;
        }
        const newArchiveName = spiHelperGetArchiveName() + '/' + archiveId;
        await spiHelperMovePage(spiHelperGetArchiveName(), newArchiveName, 'Moving archive to avoid exceeding post expand size limit', false, false);
        await spiHelperEditPage(spiHelperGetArchiveName(), '', 'Removing redirect', false, 'nochange');
      }
      // Need an await here - if we have multiple sections archiving we don't want
      // to stomp on each other
      await spiHelperArchiveCaseSection(sectionId);
      // need to re-fetch caseSections since the section numbering probably just changed,
      // also reset our index
      i = 0;
      spiHelperCaseSections = await spiHelperGetInvestigationSectionIDs();
    }
  }
}

/**
 * Archive a specific section of a case
 *
 * @param sectionId The section number to archive
 */
async function spiHelperArchiveCaseSection(sectionId: number): Promise<void> {
  let sectionText = await spiHelperGetPageText(spiHelperPageName, true, sectionId);
  sectionText = sectionText.replace(spiHelperCaseStatusRegex, '');
  const newarchivetext = sectionText.substring(sectionText.search(spiHelperSectionRegex));
  let archivetext = await spiHelperGetPageText(spiHelperGetArchiveName(), true);

  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  // Edit conflict check
  if (archivetext.includes(sectionText)) {
    $statusLine.addClass('spihelper-errortext').append('b').text('Looks like the page has been archived already');
    return;
  }

  // Update the archive
  if (!archivetext) {
    archivetext = '__TOC__\n{{SPI archive notice|1=' + spiHelperCaseName + '}}\n{{SPIpriorcases}}';
  }
  else {
    archivetext = archivetext.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, '\n{{SPIpriorcases}}'); // fmt fix whenever needed.
  }
  archivetext += '\n' + newarchivetext;
  const archiveSuccess = await spiHelperEditPage(spiHelperGetArchiveName(), archivetext,
    'Archiving case section from [[' + spiHelperGetInterwikiPrefix() + spiHelperPageName + ']]',
    false, spiHelperSettings.watchArchive, spiHelperSettings.watchArchiveExpiry);

  if (!archiveSuccess) {
    $statusLine.addClass('spihelper-errortext').append('b').text('Failed to update archive, not removing section from case page');
    return;
  }

  // Blank the section we archived
  await spiHelperEditPage(spiHelperPageName, '', 'Archiving case section to [[' + spiHelperGetInterwikiPrefix() + spiHelperGetArchiveName() + ']]',
    false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry, spiHelperStartingRevID, sectionId);
  // Update to the latest revision ID
  spiHelperStartingRevID = await spiHelperGetPageRev(spiHelperPageName);
}

/**
 * Move or merge the selected case into a different case
 *
 * @param {string} target The username portion of the case this section should be merged into
 *                        (should have been normalized before getting passed in)
 */
async function spiHelperMoveCase(target: string) {
  // Move or merge an entire case
  // Normalize: change underscores to spaces
  // target = target
  const newPageName = spiHelperPageName.replace(spiHelperCaseName, target);
  const targetPageText = await spiHelperGetPageText(newPageName, false);
  if (targetPageText) {
    if (spiHelperIsAdmin()) {
      const proceed = confirm('Target page exists, do you want to histmerge the cases?');
      if (!proceed) {
        // Build out the error line
        $('<li>')
          .append($('<div>').addClass('spihelper-errortext')
            .append($('<b>').text('Aborted merge.')))
          .appendTo($('#spiHelper_status', document));
        return;
      }
    }
    else {
      $('<li>')
        .append($('<div>').addClass('spihelper-errortext')
          .append($('<b>').text('Target page exists and you are not an admin, aborting merge.')))
        .appendTo($('#spiHelper_status', document));
      return;
    }
  }
  const oldPageName = spiHelperPageName;
  if (newPageName === oldPageName) {
    $('<li>')
      .append($('<div>').addClass('spihelper-errortext')
        .append($('<b>').text('Target page is the current page, aborting merge.')))
      .appendTo($('#spiHelper_status', document));
    return;
  }
  // Housekeeping to update all the var names following the rename
  const oldArchiveName = spiHelperGetArchiveName();
  spiHelperCaseName = target;
  spiHelperPageName = newPageName;
  let archivesCopied = false;
  if (targetPageText) {
    // There's already a page there, we're going to merge
    // First, check if there's an archive; if so, copy its text over
    const newArchiveName = spiHelperGetArchiveName().replace(spiHelperCaseName, target);
    let sourceArchiveText = await spiHelperGetPageText(oldArchiveName, false);
    let targetArchiveText = await spiHelperGetPageText(newArchiveName, false);
    if (sourceArchiveText && targetArchiveText) {
      $('<li>')
        .append($('<div>').text('Archive detected on both source and target cases, manually copying archive.'))
        .appendTo($('#spiHelper_status', document));

      // Normalize the source archive text
      sourceArchiveText = sourceArchiveText.replace(/^\s*__TOC__\s*$\n/gm, '');
      sourceArchiveText = sourceArchiveText.replace(spiHelperArchiveNoticeRegex, '');
      sourceArchiveText = sourceArchiveText.replace(spiHelperPriorCasesRegex, '');
      // Strip leading newlines
      sourceArchiveText = sourceArchiveText.replace(/^\n*/, '');
      targetArchiveText += '\n' + sourceArchiveText;
      await spiHelperEditPage(newArchiveName, targetArchiveText, 'Copying archives from [[' + spiHelperGetInterwikiPrefix() + oldArchiveName + ']], see page history for attribution',
        false, spiHelperSettings.watchArchive, spiHelperSettings.watchArchiveExpiry);
      await spiHelperDeletePage(oldArchiveName, 'Deleting copied archive');
      archivesCopied = true;
    }
    // Now get existing protection levels on the target and existing page.
    const oldPageNameProtection = await spiHelperGetProtectionInformation(oldPageName);
    const newPageNameProtection = await spiHelperGetProtectionInformation(spiHelperPageName);
    const newProtectionValues: Protection[] = [];
    const siteProtectionInformation = await spiHelperGetSiteRestrictionInformation();
    // First find if both the old page and new page had the same protection type enabled
    siteProtectionInformation.types.forEach((type: string) => {
      const oldPageNameEntry = oldPageNameProtection.find((dict) => {
        return dict.type === type;
      });
      const newPageNameEntry = newPageNameProtection.find((dict) => {
        return dict.type === type;
      });
      if (oldPageNameEntry && newPageNameEntry) {
        let expiry = newPageNameEntry.expiry;
        if (newPageNameEntry.expiry === 'infinity' || oldPageNameEntry.expiry === 'infinity' || newPageNameEntry.expiry === 'infinite' || oldPageNameEntry.expiry === 'infinite') {
          expiry = 'infinite';
        }
        else if (newPageNameEntry.expiry < oldPageNameEntry.expiry) {
          expiry = oldPageNameEntry.expiry;
        }
        const oldPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(oldPageNameEntry.level);
        const newPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(newPageNameEntry.level);
        let level: string;
        if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
          console.error('Invalid protection information provided from API');
          return;
        }
        else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
          level = oldPageNameEntry.level;
        }
        else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
          level = newPageNameEntry.level;
        }
        else {
          return;
        }
        newProtectionValues.push({ type: oldPageNameEntry.type, expiry: expiry, level: level });
      }
      else if (oldPageNameEntry) {
        newProtectionValues.push(oldPageNameEntry);
      }
      else if (newPageNameEntry) {
        newProtectionValues.push(newPageNameEntry);
      }
    });
    // Now handle pending changes protection
    const oldPageNameStabilisation = await spiHelperGetStabilisationSettings(oldPageName);
    const newPageNameStabilisation = await spiHelperGetStabilisationSettings(spiHelperPageName);
    let newStabilisationSettings: NewPendingChanges = { level: '' };
    if (oldPageNameStabilisation && newPageNameStabilisation) {
      // Pending changes is used on both pages
      if (newPageNameStabilisation.protection_expiry === 'infinity' || oldPageNameStabilisation.protection_expiry === 'infinity' || newPageNameStabilisation.protection_expiry === 'infinite' || oldPageNameStabilisation.protection_expiry === 'infinite') {
        newStabilisationSettings.expiry = 'infinite';
      }
      else if (newPageNameStabilisation.protection_expiry < oldPageNameStabilisation.protection_expiry) {
        newStabilisationSettings.expiry = oldPageNameStabilisation.protection_expiry;
      }
      else {
        newStabilisationSettings.expiry = newPageNameStabilisation.protection_expiry;
      }
      const oldPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(oldPageNameStabilisation.protection_level);
      const newPageNameEntryLevelIndex = siteProtectionInformation.levels.indexOf(newPageNameStabilisation.protection_level);
      if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
        console.error('Invalid protection information provided from API');
        return;
      }
      else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = oldPageNameStabilisation.protection_level;
      }
      else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = newPageNameStabilisation.protection_level;
      }
    }
    else if (oldPageNameStabilisation) {
      newStabilisationSettings = {
        level: oldPageNameStabilisation.protection_level,
        expiry: oldPageNameStabilisation.protection_expiry,
      };
    }
    else if (newPageNameStabilisation) {
      newStabilisationSettings = {
        level: newPageNameStabilisation.protection_level,
        expiry: newPageNameStabilisation.protection_expiry,
      };
    }
    // Ignore warnings on the move, we're going to get one since we're stomping an existing page
    await spiHelperDeletePage(spiHelperPageName, 'Deleting as part of case merge');
    await spiHelperMovePage(oldPageName, spiHelperPageName, 'Merging case to [[' + spiHelperGetInterwikiPrefix() + spiHelperPageName + ']]', true);
    await spiHelperUndeletePage(spiHelperPageName, 'Restoring page history after merge');
    if (archivesCopied) {
      // Create a redirect
      await spiHelperEditPage(oldArchiveName, '#REDIRECT [[' + newArchiveName + ']]', 'Redirecting old archive to new archive',
        false, spiHelperSettings.watchArchive, spiHelperSettings.watchArchiveExpiry);
    }
    // Now to protect both the oldPageName and newPageName with the protection settings in newProtectionDict, unless it is empty (i.e. no protection needed)
    // Also apply any pending changes needed (i.e. if newStabilisationSettings has a non-empty protection_level)
    if (newProtectionValues.length !== 0) {
      await spiHelperProtectPage(spiHelperPageName, newProtectionValues);
      await spiHelperProtectPage(oldPageName, newProtectionValues);
    }
    if (newStabilisationSettings.level !== '') {
      await spiHelperConfigurePendingChanges(spiHelperPageName, newStabilisationSettings);
      await spiHelperConfigurePendingChanges(oldPageName, newStabilisationSettings);
    }
  }
  else {
    await spiHelperMovePage(oldPageName, spiHelperPageName, 'Moving case to [[' + spiHelperGetInterwikiPrefix() + spiHelperPageName + ']]', false);
  }
  spiHelperStartingRevID = await spiHelperGetPageRev(spiHelperPageName);
  await spiHelperPostRenameCleanup(oldPageName);
  if (targetPageText) {
    // If there was a page there before, also need to do post-merge cleanup
    await spiHelperPostMergeCleanup(targetPageText);
  }
  if (archivesCopied) {
    alert('Archives were merged during the case move, please reorder the archive sections');
  }
}

/**
 * Move or merge a specific section of a case into a different case
 *
 * @param target The username portion of the case this section should be merged into (pre-normalized)
 * @param sectionId The section ID of this case that should be moved/merged
 */
async function spiHelperMoveCaseSection(target: string, sectionId: number) {
  // Move or merge a particular section of a case

  const newPageName = spiHelperPageName.replace(spiHelperCaseName, target);
  let targetPageText = await spiHelperGetPageText(newPageName, false);
  let sectionText = await spiHelperGetPageText(spiHelperPageName, true, sectionId);
  // SOCK_SECTION_RE_WITH_NEWLINE cleans up extraneous whitespace at the top of the section
  // Have to do this transform before concatenating with targetPageText so that the
  // "originally filed" goes in the correct section
  sectionText = sectionText.replace(spiHelperSockSectionWithNewlineRegex, '====Suspected sockpuppets====' + '\n* {{checkuser|1=' + spiHelperCaseName + '}} ({{clerknote}} originally filed under this user)\n');

  if (targetPageText === '') {
    // Preload the split target with the SPI templates if it's empty
    targetPageText = '<noinclude>__TOC__</noinclude>\n{{SPI archive notice|' + target + '}}\n{{SPIpriorcases}}';
  }
  targetPageText += '\n' + sectionText;

  // Intentionally not async - doesn't matter when this edit finishes
  void spiHelperEditPage(newPageName, targetPageText, 'Moving case section from [[' + spiHelperGetInterwikiPrefix() + spiHelperPageName + ']], see page history for attribution',
    false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry);
  // Blank the section we moved
  await spiHelperEditPage(spiHelperPageName, '', 'Moving case section to [[' + spiHelperGetInterwikiPrefix() + newPageName + ']]',
    false, spiHelperSettings.watchCase, spiHelperSettings.watchCaseExpiry, spiHelperStartingRevID, sectionId);
  // Update to the latest revision ID
  spiHelperStartingRevID = await spiHelperGetPageRev(spiHelperPageName);
}

/**
 * Render a text box's contents and display it in the preview area
 *
 */
async function spiHelperPreviewText() {
  const inputText = spiHelperGetCommentTextValue();
  const renderedText = await spiHelperRenderText(spiHelperPageName, inputText);
  // Fill the preview box with the new text
  const $previewBox = $('#spiHelper_previewBox', document);
  $previewBox.html(renderedText);
  // Unhide it if it was hidden
  $previewBox.show();
}

/**
 * Given a page title, get an API to operate on that page
 *
 * @param {string} title Title of the page we want the API for
 * @return {Object} MediaWiki Api/ForeignAPI for the target page's wiki
 */
function spiHelperGetAPI(title: string): mw.Api {
  if (title.startsWith('m:') || title.startsWith('meta:')) {
    return new mw.ForeignApi('https://meta.wikimedia.org/w/api.php');
  }
  else {
    return new mw.Api();
  }
}

/**
 * Grab the value of #spiHelper_CommentText in a safe manner
 */
function spiHelperGetCommentTextValue(): string {
  const commentTextValue = $('#spiHelper_CommentText', document).val();
  if (typeof commentTextValue !== 'string') {
    console.error('spiHelperGetCommentTextValue: Comment text is not a string!');
    return '';
  }

  return commentTextValue;
}

/**
 * Removes the interwiki prefix from a page title
 *
 * @param {*} title Page name including interwiki prefix
 * @return {string} Just the page name
 */
function spiHelperStripXWikiPrefix(title: string): string {
  // TODO: This only works with single-colon names, make it more robust
  if (title.startsWith('m:') || title.startsWith('meta:')) {
    return title.slice(title.indexOf(':') + 1);
  }
  else {
    return title;
  }
}

/**
 * Get the post-expand include size of a given page
 *
 * @param {string} title Page title to check
 * @param {?number} sectionId Section to check, if null check the whole page
 *
 * @return {Promise<number>} Post-expand include size of the given page/page section
 */
async function spiHelperGetPostExpandSize(title: string, sectionId?: number): Promise<number> {
  // Synchronous method to get a page's post-expand include size given its title
  const finalTitle = spiHelperStripXWikiPrefix(title);

  const request: ApiParseParams = {
    action: 'parse',
    prop: 'limitreportdata',
    page: finalTitle,
  };
  if (sectionId) {
    request.section = sectionId.toString();
  }
  const api = spiHelperGetAPI(title);
  try {
    const response = await api.get(request);

    // The page might not exist, so we need to handle that smartly - only get the parse
    // if the page actually parsed
    if ('parse' in response) {
      // Iterate over all properties to find the PEIS
      for (let i = 0; i < response.parse.limitreportdata.length; i++) {
        if (response.parse.limitreportdata[i].name === 'limitreport-postexpandincludesize') {
          return response.parse.limitreportdata[i][0];
        }
      }
    }
  }
  catch {
    // Something's gone wrong, just return 0
  }

  return 0;
}

/**
 * Get the maximum post-expand size from the wgPageParseReport (it's the same for all pages)
 *
 * @return {number} The max post-expand size in bytes
 */
function spiHelperGetMaxPostExpandSize(): number {
  return mw.config.get('wgPageParseReport').limitreport.postexpandincludesize.limit;
}

/**
 * Get the inter-wiki prefix for the current wiki
 *
 * @return {string} The inter-wiki prefix
 */
function spiHelperGetInterwikiPrefix(): string {
  // Mostly copied from https://github.com/Xi-Plus/twinkle-global/blob/master/morebits.js
  // Most of this should be overkill (since most of these wikis don't have checkuser support)
  const temp: string[] = mw.config.get('wgServer').replace(/^(https?)?:?\/\//, '').split('.');
  const wikiLang = temp[0];
  const wikiFamily = temp[1];

  let iwPrefix;
  switch (wikiFamily) {
    case 'wikimedia':
      switch (wikiLang) {
        case 'commons':
        case 'meta':
        case 'species':
        case 'incubator':
        case 'outreach':
          iwPrefix = wikiLang;
          break;
        default:
          break;
      }
      break;
    case 'mediawiki':
      iwPrefix = 'mw';
      break;
    case 'wikidata':
      switch (wikiLang) {
        case 'test':
          iwPrefix = 'testwikidata';
          break;
        case 'www':
          iwPrefix = 'd';
          break;
        default:
          break;
      }
      break;
    case 'wikipedia':
      switch (wikiLang) {
        case 'test':
          iwPrefix = 'testwiki';
          break;
        case 'test2':
          iwPrefix = 'test2wiki';
          break;
        default:
          iwPrefix = 'w:' + wikiLang;
          break;
      }
      break;
    case 'wiktionary':
      iwPrefix = 'wikt:' + wikiLang;
      break;
    case 'wikiquote':
      iwPrefix = 'q:' + wikiLang;
      break;
    case 'wikibooks':
      iwPrefix = 'b:' + wikiLang;
      break;
    case 'wikinews':
      iwPrefix = 'n:' + wikiLang;
      break;
    case 'wikisource':
      iwPrefix = 's:' + wikiLang;
      break;
    case 'wikiversity':
      iwPrefix = 'v:' + wikiLang;
      break;
    case 'wikivoyage':
      iwPrefix = 'voy:' + wikiLang;
      break;
    default:
      return '';
  }
  return `:${iwPrefix}:`;
}

// "Building-block" functions to wrap basic API calls
/**
 * Get the text of a page. Not that complicated.
 *
 * @param title Title of the page to get the contents of
 * @param show Whether to show page fetch progress on-screen
 * @param sectionId Section to retrieve, setting this to null will retrieve the entire page
 *
 * @return {Promise<string>} The text of the page, '' if the page does not exist.
 */
async function spiHelperGetPageText(title: string, show: boolean, sectionId?: number | null): Promise<string> {
  const $statusLine = $('<li>');
  if (show) {
    // Actually display the statusLine
    $('#spiHelper_status', document).append($statusLine);
  }
  // Build the link element (use JQuery so we get escapes and such)
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(title);
  $statusLine.html('Getting page ' + $link.prop('outerHTML'));

  const finalTitle = spiHelperStripXWikiPrefix(title);

  const request: ApiQueryRevisionsParams = {
    action: 'query',
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    indexpageids: true,
    titles: finalTitle,
  };

  if (sectionId) {
    request.rvsection = sectionId.toString();
  }

  try {
    const response = await spiHelperGetAPI(title).get(request);
    const pageid = response.query.pageids[0];

    if (pageid === '-1') {
      $statusLine.html('Page ' + $link.html() + ' does not exist');
      return '';
    }
    $statusLine.html('Got ' + $link.html());
    return response.query.pages[pageid].revisions[0].slots.main['*'];
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to get ' + $link.html() + '</b>: ' + error);
    return '';
  }
}

/**
 *
 * @param {string} title Title of the page to edit
 * @param {string} newtext New content of the page
 * @param {string} summary Edit summary to use for the edit
 * @param {boolean} createonly Only try to create the page - if false,
 *                             will fail if the page already exists
 * @param {string} watch What watchlist setting to use when editing - decides
 *                       whether the edited page will be watched
 * @param {string} watchExpiry Duration to watch the edited page, if unset
 *                             defaults to 'indefinite'
 * @param {?number} baseRevId Base revision ID, used to detect edit conflicts. If null,
 *                           we'll grab the current page ID.
 * @param {?number} [sectionId=null] Section to edit - if null, edits the whole page
 *
 * @return {Promise<boolean>} Whether the edit was successful
 */
async function spiHelperEditPage(title: string, newtext: string, summary: string, createonly: boolean, watch: WatchOption, watchExpiry?: string, baseRevId?: number, sectionId?: number | null): Promise<boolean> {
  let activeOpKey = 'edit_' + title;
  if (sectionId) {
    activeOpKey += '_' + sectionId;
  }
  spiHelperActiveOperations.set(activeOpKey, 'running');
  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(title);

  $statusLine.html('Editing ' + $link.prop('outerHTML'));

  const api = spiHelperGetAPI(title);
  const finalTitle = spiHelperStripXWikiPrefix(title);

  const request: ApiEditPageParams = {
    action: 'edit',
    watchlist: watch,
    summary: summary + spiHelperAdvert,
    text: newtext,
    title: finalTitle,
    createonly: createonly,
  };
  if (sectionId) {
    request.section = sectionId.toString();
  }
  if (watchExpiry) {
    request.watchlistexpiry = watchExpiry;
  }
  if (baseRevId) {
    request.baserevid = baseRevId;
  }
  try {
    await api.postWithToken('csrf', request);
    $statusLine.html('Saved ' + $link.prop('outerHTML'));
    spiHelperActiveOperations.set(activeOpKey, 'success');
    return true;
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Edit failed on ' + $link.html() + '</b>: ' + error);
    console.error(error);
    spiHelperActiveOperations.set(activeOpKey, 'failed');
    return false;
  }
}

/**
 * Moves a page. Exactly what it sounds like.
 *
 * @param {string} sourcePage Title of the source page (page we're moving)
 * @param {string} destPage Title of the destination page (page we're moving to)
 * @param {string} summary Edit summary to use for the move
 * @param {boolean} ignoreWarnings Whether to ignore warnings on move (used to force-move one page over another)
 * @param moveSubpages Whether to move the subpages of the source page as well
 */
async function spiHelperMovePage(sourcePage: string, destPage: string, summary: string, ignoreWarnings: boolean, moveSubpages: boolean = true) {
  const activeOpKey = 'move_' + sourcePage + '_' + destPage;
  spiHelperActiveOperations.set(activeOpKey, 'running');

  // Should never be a crosswiki call
  const api = new mw.Api();

  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $sourceLink = $('<a>').attr('href', mw.util.getUrl(sourcePage)).attr('title', sourcePage).text(sourcePage);
  const $destLink = $('<a>').attr('href', mw.util.getUrl(destPage)).attr('title', destPage).text(destPage);

  $statusLine.html('Moving ' + $sourceLink.prop('outerHTML') + ' to ' + $destLink.prop('outerHTML'));

  const request: ApiMoveParams = {
    action: 'move',
    from: sourcePage,
    to: destPage,
    reason: summary + spiHelperAdvert,
    noredirect: false,
    movesubpages: moveSubpages,
    ignoreWarnings: ignoreWarnings,
  };
  try {
    await api.postWithToken('csrf', request);
    $statusLine.html('Moved ' + $sourceLink.prop('outerHTML') + ' to ' + $destLink.prop('outerHTML'));
    spiHelperActiveOperations.set(activeOpKey, 'success');
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to move ' + $sourceLink.prop('outerHTML') + ' to ' + $destLink.prop('outerHTML') + '</b>: ' + error);
    spiHelperActiveOperations.set(activeOpKey, 'failed');
  }
}

/**
 * Purges a page's cache
 *
 *
 * @param {string} title Title of the page to purge
 */
async function spiHelperPurgePage(title: string): Promise<void> {
  // Forces a cache purge on the selected page
  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(title);
  $statusLine.html('Purging ' + $link.prop('outerHTML'));
  const strippedTitle = spiHelperStripXWikiPrefix(title);

  const api = spiHelperGetAPI(title);
  const request: ApiPurgeParams = {
    action: 'purge',
    titles: strippedTitle,
  };
  try {
    await api.postWithToken('csrf', request);
    $statusLine.html('Purged ' + $link.prop('outerHTML'));
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to purge ' + $link.prop('outerHTML') + '</b>: ' + error);
  }
}

/**
 * Blocks a user.
 *
 * @param {string} user Username to block
 * @param {string} duration Duration of the block
 * @param {string} reason Reason to log for the block
 * @param {boolean} reblock Whether to reblock - if false, nothing will happen if the target user is already blocked
 * @param {boolean} anononly For IPs, whether this is an anonymous-only block (alternative is
 *                           that logged-in users with the IP are also blocked)
 * @param {boolean} accountcreation Whether to permit the user to create new accounts
 * @param {boolean} autoblock Whether to apply an autoblock to the user's IP
 * @param {boolean} talkpage Whether to revoke talkpage access
 * @param {boolean} email Whether to block email
 * @param {boolean} watchBlockedUser Watchlist setting for whether to watch the newly-blocked user
 * @param {string} watchExpiry Duration to watch the blocked user, if unset
 *                             defaults to 'indefinite'

 * @return {Promise<boolean>} True if the block suceeded, false if not
 */
async function spiHelperWikiBlockUser(user: string, duration: string, reason: string, reblock: boolean, anononly: boolean, accountcreation: boolean,
  autoblock: boolean, talkpage: boolean, email: boolean, watchBlockedUser: boolean, watchExpiry: string): Promise<boolean> {
  const activeOpKey = 'block_' + user;
  spiHelperActiveOperations.set(activeOpKey, 'running');

  if (!watchExpiry) {
    watchExpiry = 'indefinite';
  }
  const userPage = 'User:' + user;
  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(userPage)).attr('title', userPage).text(user);
  $statusLine.html('Blocking ' + $link.prop('outerHTML'));

  // This is not something which should ever be cross-wiki
  const api = new mw.Api();
  const request: ApiBlockParams = {
    action: 'block',
    expiry: duration,
    reason: reason,
    reblock: reblock,
    anononly: anononly,
    nocreate: accountcreation,
    autoblock: autoblock,
    allowusertalk: !talkpage,
    noemail: email,
    watchuser: watchBlockedUser,
    watchlistexpiry: watchExpiry,
    user: user,
  };
  try {
    await api.postWithToken('csrf', request);
    $statusLine.html('Blocked ' + $link.prop('outerHTML'));
    spiHelperActiveOperations.set(activeOpKey, 'success');
    return true;
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to block ' + $link.prop('outerHTML') + '</b>: ' + error);
    spiHelperActiveOperations.set(activeOpKey, 'failed');
    return false;
  }
}

/**
 * Get a user's current block settings
 *
 * @param {string} user Username
 * @return {Promise<BlockEntry>} Current block settings for the user, or null if the user is not blocked
 */
async function spiHelperGetUserBlockSettings(user: string): Promise<BlockEntry | null> {
  // Should probably make this find the strictest block what with the addition of multiblocks
  // This is not something which should ever be cross-wiki
  const api = new mw.Api();
  const request: ApiQueryBlocksParams = {
    action: 'query',
    list: 'blocks',
    bklimit: 1,
    bkusers: user,
    bkprop: ['user', 'reason', 'flags', 'expiry'],
  };
  try {
    const response = await api.get(request);
    if (response.query.blocks.length === 0) {
      // If the length is 0, then the user isn't blocked
      return null;
    }

    return {
      username: user,
      duration: response.query.blocks[0].expiry,
      acb: ('nocreate' in response.query.blocks[0] || 'anononly' in response.query.blocks[0]),
      ab: 'autoblock' in response.query.blocks[0],
      ntp: !('allowusertalk' in response.query.blocks[0]),
      nem: 'noemail' in response.query.blocks[0],
      tpn: '',
      reason: response.query.blocks[0].reason,
    };
  }
  catch {
    return null;
  }
}

/**
 * Get information about a user
 *
 * @param {string} user Username
 * @return {Promise<GlobalUser | null>} The user, if they exist globally, and information about them
 */
async function spiHelperGetGlobalUser(user: string): Promise<GlobalUser | null> {
  const api = new mw.Api();
  const request: CentralAuthApiQueryGlobalAllUsersParams = {
    action: 'query',
    list: 'globalallusers',
    agulimit: 1,
    agufrom: user,
    aguto: user,
    aguprop: ['lockinfo', 'existslocally'],
  };
  try {
    const response = await api.get(request);
    if (response.query.globalallusers.length === 0) {
      // If the length is 0, then we couldn't find the global user
      return null;
    }

    const globalUserData = response.query.globalallusers[0];
    return {
      name: globalUserData.name,
      exists_locally: 'existslocally' in globalUserData,
      locked: 'locked' in globalUserData,
    };
  }
  catch {
    return null;
  }
}

/**
 * Get a page's latest revision ID - useful for preventing edit conflicts
 *
 * @param {string} title Title of the page
 * @return {Promise<number>} Latest revision of a page, 0 if it doesn't exist
 */
async function spiHelperGetPageRev(title: string): Promise<number> {
  const finalTitle = spiHelperStripXWikiPrefix(title);
  const request: ApiQueryRevisionsParams = {
    action: 'query',
    prop: 'revisions',
    rvslots: 'main',
    indexpageids: true,
    titles: finalTitle,
  };

  try {
    const response = await spiHelperGetAPI(title).get(request);
    const pageid = response.query.pageids[0];
    if (pageid === '-1') {
      return 0;
    }
    return response.query.pages[pageid].revisions[0].revid;
  }
  catch {
    return 0;
  }
}

/**
 * Delete a page. Admin-only function.
 *
 * @param {string} title Title of the page to delete
 * @param {string} reason Reason to log for the page deletion
 */
async function spiHelperDeletePage(title: string, reason: string) {
  const activeOpKey = 'delete_' + title;
  spiHelperActiveOperations.set(activeOpKey, 'running');

  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(title);
  $statusLine.html('Deleting ' + $link.prop('outerHTML'));

  const api = spiHelperGetAPI(title);
  const request: ApiDeleteParams = {
    action: 'delete',
    title: title,
    reason: reason,
  };
  try {
    await api.postWithToken('csrf', request);
    $statusLine.html('Deleted ' + $link.prop('outerHTML'));
    spiHelperActiveOperations.set(activeOpKey, 'success');
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to delete ' + $link.prop('outerHTML') + '</b>: ' + error);
    spiHelperActiveOperations.set(activeOpKey, 'failed');
  }
}

/**
 * Undelete a page (or, if the page exists, undelete deleted revisions). Admin-only function
 *
 * @param {string} title Title of the pgae to undelete
 * @param {string} reason Reason to log for the page undeletion
 */
async function spiHelperUndeletePage(title: string, reason: string) {
  const activeOpKey = 'undelete_' + title;
  spiHelperActiveOperations.set(activeOpKey, 'running');

  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(title)).attr('title', title).text(title);
  $statusLine.html('Undeleting ' + $link.prop('outerHTML'));

  const api = spiHelperGetAPI(title);
  const request: ApiUndeleteParams = {
    action: 'undelete',
    title: title,
    reason: reason,
  };
  try {
    await api.postWithToken('csrf', request);
    $statusLine.html('Undeleted ' + $link.prop('outerHTML'));
    spiHelperActiveOperations.set(activeOpKey, 'success');
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to undelete ' + $link.prop('outerHTML') + '</b>: ' + error);
    spiHelperActiveOperations.set(activeOpKey, 'failed');
  }
}

/**
 * Render a snippet of wikitext
 *
 * @param {string} title Page title
 * @param {string} text Text to render
 * @return {Promise<string>} Rendered version of the text
 */
async function spiHelperRenderText(title: string, text: string): Promise<string> {
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'text',
    pst: true,
    text: text,
    title: title,
  };

  try {
    const response = await spiHelperGetAPI(title).get(request);
    return response.parse.text['*'];
  }
  catch (error) {
    console.error('Error rendering text: ' + error);
    return '';
  }
}

/**
 * Get a list of investigations on the sockpuppet investigation page
 *
 * @return An array of section objects, each section is a separate investigation
 */
async function spiHelperGetInvestigationSectionIDs(): Promise<SectionResult[]> {
  // Uses the parse API to get page sections, then find the investigation
  // sections (should all be level-3 headers)

  // Since this only affects the local page, no need to call spiHelper_getAPI()
  const request: ApiParseParams = {
    action: 'parse',
    // @ts-expect-error -- latest MediaWiki deprecated 'section'. Remove me at next types-mediawiki release
    prop: 'tocdata',
    page: spiHelperPageName,
  };
  const response = await new mw.Api().get(request);
  const dateSections: SectionResult[] = [];
  for (let i = 0; i < response.parse.tocdata.sections.length; i++) {
    // TODO: also check for presence of spi case status
    const currentSection = response.parse.tocdata.sections[i];
    if (parseInt(currentSection.hLevel) === 3) {
      dateSections.push(currentSection);
    }
  }
  return dateSections;
}

/**
 * Get SPI page backlinks to this SPI page.
 * Used to fix double redirects when merging cases.
 */
async function spiHelperGetSPIBacklinks(casePageName: string) {
  // Only looking for enwiki backlinks
  const api = new mw.Api();
  const request: ApiQueryBacklinksParams = {
    action: 'query',
    format: 'json',
    list: 'backlinks',
    bltitle: casePageName,
    blnamespace: 4,
    bldir: 'ascending',
    blfilterredir: 'nonredirects',
  };
  try {
    const response = await api.get(request);
    return response.query.backlinks.filter((dictEntry: { title: string }) => {
      return dictEntry.title.startsWith('Wikipedia:Sockpuppet investigations/') && !dictEntry.title.startsWith('Wikipedia:Sockpuppet investigations/SPI/') && !dictEntry.title.match('Wikipedia:Sockpuppet investigations/.*/Archive.*');
    });
  }
  catch {
    return [];
  }
}

/**
 * Get the page protection level for an SPI page.
 * Used to keep the protection level after a history merge
 */
async function spiHelperGetProtectionInformation(casePageName: string): Promise<Protection[]> {
  // Only looking for enwiki protection information
  const api = new mw.Api();
  const request: ApiQueryInfoParams = {
    action: 'query',
    format: 'json',
    prop: 'info',
    titles: casePageName,
    inprop: 'protection',
  };
  try {
    const response = await api.get(request);
    const page = Object.values(response.query.pages)[0] as { protection: Protection[] };
    return page.protection;
  }
  catch {
    return [];
  }
}

/**
 * Gets stabilisation settings information for a page. If no pending changes exists then it returns false.
 */
async function spiHelperGetStabilisationSettings(casePageName: string): Promise<PendingChanges | null> {
  // Only looking for enwiki stabilisation information
  const api = new mw.Api();
  const request: ApiQueryFlaggedParams = {
    action: 'query',
    format: 'json',
    prop: 'flagged',
    titles: casePageName,
  };
  try {
    const response = await api.get(request);
    const entry = Object.values(response.query.pages)[0] as { flagged: PendingChanges };
    if ('flagged' in entry) {
      return entry.flagged;
    }
    else {
      return null;
    }
  }
  catch {
    return null;
  }
}

async function spiHelperProtectPage(casePageName: string, protections: Protection[]) {
  const activeOpKey = 'protect_' + casePageName;
  spiHelperActiveOperations.set(activeOpKey, 'running');

  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(casePageName)).attr('title', casePageName).text(casePageName);
  $statusLine.html('Protecting ' + $link.prop('outerHTML'));

  const api = new mw.Api();
  try {
    // Could change this to define an api_protections array and then .join('|') in the API call
    let protectLevel = '';
    let expiryInfo = '';
    protections.forEach((protection) => {
      if (protectLevel !== '') {
        protectLevel = protectLevel + '|';
        expiryInfo = expiryInfo + '|';
      }
      protectLevel = protectLevel + protection.type + '=' + protection.level;
      expiryInfo = expiryInfo + protection.expiry;
    });
    const request: ApiProtectParams = {
      action: 'protect',
      format: 'json',
      title: casePageName,
      protections: protectLevel,
      expiry: expiryInfo,
      reason: 'Restoring protection after history merge',
    };
    await api.postWithToken('csrf', request);
    $statusLine.html('Protected ' + $link.prop('outerHTML'));
    spiHelperActiveOperations.set(activeOpKey, 'success');
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to protect ' + $link.prop('outerHTML') + '</b>: ' + error);
    spiHelperActiveOperations.set(activeOpKey, 'failed');
  }
}

async function spiHelperConfigurePendingChanges(casePageName: string, protection: NewPendingChanges) {
  if (protection.level === '') {
    return;
  }
  // Only lookint to protect pages on enwiki
  const activeOpKey = 'stabilize_' + casePageName;
  spiHelperActiveOperations.set(activeOpKey, 'running');

  const api = new mw.Api();
  const request: ApiStabilizeProtectParams = {
    action: 'stabilize',
    format: 'json',
    titles: casePageName,
    protectlevel: protection.level,
    expiry: protection.expiry,
    reason: 'Restoring pending changes protection after history merge',
  };
  try {
    await api.postWithToken('csrf', request);
    spiHelperActiveOperations.set(activeOpKey, 'success');
  }
  catch {
    spiHelperActiveOperations.set(activeOpKey, 'failed');
  }
}

async function spiHelperGetSiteRestrictionInformation() {
  // For enwiki only as this is it's only use case
  const api = new mw.Api();
  const request: ApiQuerySiteinfoParams = {
    action: 'query',
    format: 'json',
    meta: 'siteinfo',
    siprop: 'restrictions',
  };
  try {
    const response = await api.get(request);
    return response.query.restrictions;
  }
  catch {
    return [];
  }
}

/**
 * Pretty obvious - gets the name of the archive. This keeps us from having to regen it
 * if we rename the case
 *
 * @return {string} Name of the archive page
 */
function spiHelperGetArchiveName(): string {
  return spiHelperPageName + '/Archive';
}

// UI helper functions
/**
 * Generate a line of the block table for a particular user
 *
 * @param {string} name Username for this block line
 * @param {boolean} defaultblock Whether to check the block box by default on this row
 * @param {number} id Index of this line in the block table
 */
async function spiHelperGenerateBlockTableLine(name: string, defaultblock: boolean, id: number) {
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
    ntp = spiHelperArchiveNoticeParams.notalk;
    nem = spiHelperArchiveNoticeParams.notalk;
    duration = mw.util.isIPAddress(name, true) ? '1 week' : 'indefinite';
  }

  const $table = $('#spiHelper_blockTable', document);

  const $row = $('<tr>');
  // Username
  $('<td>').append($('<input>').attr('type', 'text').attr('id', 'spiHelper_block_username' + id)
    .val(name).addClass('.spihelper-widthlimit')).appendTo($row);
  // Block checkbox (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'checkbox')
    .attr('id', 'spiHelper_block_doblock' + id).prop('checked', block)).appendTo($row);
  // Block duration (only for admins)
  $('<td>').addClass('spiHelper_adminClass').append($('<input>').attr('type', 'text')
    .attr('id', 'spiHelper_block_duration' + id).val(duration)
    .addClass('.spihelper-widthlimit')).appendTo($row);
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
  $('<td>').append($('<select>').attr('id', 'spiHelper_block_tag' + id)
    .val(name)).appendTo($row);
  // Altmaster tag select
  $('<td>').append($('<select>').attr('id', 'spiHelper_block_tag_altmaster' + id)
    .val(name)).appendTo($row);
  // Global lock (disabled for IPs since they can't be locked)
  $('<td>').append($('<input>').attr('type', 'checkbox').attr('id', 'spiHelper_block_lock' + id)
    .prop('disabled', mw.util.isIPAddress(name, true))).appendTo($row);
  $table.append($row);

  // Generate the select entries
  spiHelperGenerateSelect('spiHelper_block_tag' + id, spiHelperTagOptions);
  spiHelperGenerateSelect('spiHelper_block_tag_altmaster' + id, spiHelperAltMasterTagOptions);

  // Add onlistener events to update the global lock checkbox if the username is changed between an IP address and username
  $('#spiHelper_block_username' + id).on('change', (event) => {
    const newValue = (event.target as HTMLInputElement).value;
    $('#spiHelper_block_lock' + id).prop('disabled', mw.util.isIPAddress(newValue, true));
  });
}

async function spiHelperGenerateLinksTableLine(username: string, id: number) {
  const $table = $('#spiHelper_userInfoTable', document);

  const $row = $('<tr>');
  // Username
  $('<td>').append($('<input>').attr('type', 'text').attr('id', 'spiHelper_link_username' + id)
    .val(username).addClass('.spihelper-widthlimit')).appendTo($row);
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
 * Complicated function to decide what checkboxes to enable or disable
 * and which to check by default
 */
async function spiHelperSetCheckboxesBySection() {
  // Displays the top-level SPI menu
  const $topView = $('#spiHelper_topViewDiv', document);
  // Get the value of the selection box
  const $sectionSelect = $('#spiHelper_sectionSelect', $topView);
  const selectedValue = $sectionSelect.val();
  if (!selectedValue) {
    console.error('Failed to find #spiHelper_sectionSelect element');
    return;
  }
  if (selectedValue === 'all') {
    spiHelperSectionId = null;
    spiHelperSectionName = null;
  }
  else {
    spiHelperSectionId = parseInt(selectedValue.toString());
    const selectedIndex = Number($sectionSelect.prop('selectedIndex'));
    const selectedSection = spiHelperCaseSections[selectedIndex];
    if (!selectedSection) {
      console.error('Failed to find section for selected index ' + selectedIndex);
      return;
    }
    spiHelperSectionName = selectedSection.line;
  }

  const $warningText = $('#spiHelper_warning', $topView);
  $warningText.hide();

  const $archiveBox = $('#spiHelper_Archive', $topView);
  const $closeBox = $('#spiHelper_Close', $topView);
  const $moveBox = $('#spiHelper_Move', $topView);
  /*
  const $blockBox = $('#spiHelper_BlockTag', $topView)
  const $commentBox = $('#spiHelper_Comment', $topView)
  const $caseActionBox = $('#spiHelper_Case_Action', $topView)
  const $spiMgmtBox = $('#spiHelper_SpiMgmt', $topView)

  // Start by unchecking everything
  $archiveBox.prop('checked', false)
  $blockBox.prop('checked', false)
  $closeBox.prop('checked', false)
  $commentBox.prop('checked', false)
  $moveBox.prop('checked', false)
  $caseActionBox.prop('checked', false)
  $spiMgmtBox.prop('checked', false)
  */

  // Enable optionally-disabled boxes
  $closeBox.prop('disabled', false);
  $archiveBox.prop('disabled', false);

  // archivenotice sanity check
  const pageText = await spiHelperGetPageText(spiHelperPageName, false);

  const result = spiHelperArchiveNoticeRegex.exec(pageText);
  if (!result) {
    $warningText.append($('<b>').text('Can\'t find archivenotice template!'));
    $warningText.show();
  }

  if (spiHelperSectionId === null) {
    // Hide inputs that aren't relevant in the case view
    $('.spiHelper_singleCaseOnly', $topView).hide();
    // Show inputs only visible in all-case mode
    $('.spiHelper_allCasesOnly', $topView).show();
    // Fix the move label
    $('#spiHelper_moveLabel', $topView).text('Move/merge full case (Clerk only)');
    // enable the move box
    $moveBox.prop('disabled', false);
  }
  else {
    const sectionText = await spiHelperGetPageText(spiHelperPageName, false, spiHelperSectionId);
    if (!spiHelperSectionRegex.test(sectionText)) {
      // Nothing to do here.
      return;
    }

    // Unhide single-case options
    $('.spiHelper_singleCaseOnly', $topView).show();
    // Hide inputs only visible in all-case mode
    $('.spiHelper_allCasesOnly', $topView).hide();

    const result = spiHelperCaseStatusRegex.exec(sectionText);
    let caseStatus = '';
    if (result && result[1]) {
      caseStatus = result[1];
    }
    else if (!spiHelperIsThisPageAnArchive) {
      $warningText.append($('<b>').text(`Can't find case status in ${spiHelperSectionName}!`));
      $warningText.show();
    }

    // Disable the section move setting if you haven't opted into it
    if (!spiHelperSettings.iUnderstandSectionMoves) {
      $moveBox.prop('disabled', true);
      $moveBox.prop('checked', false);
    }

    const isClosed = spiHelperCaseClosedRegex.test(caseStatus);

    if (isClosed) {
      $closeBox.prop('disabled', true);
      $closeBox.prop('checked', false);
      if (spiHelperSettings.tickArchiveWhenCaseClosed) {
        $archiveBox.prop('checked', true);
      }
    }
    else {
      $archiveBox.prop('disabled', true);
      $archiveBox.prop('checked', false);
      $('#spiHelper_Case_Action', $topView).on('click', function () {
        $('#spiHelper_Close', $topView).prop('disabled', $('#spiHelper_Case_Action', $topView).prop('checked'));
      });
      $('#spiHelper_Close', $topView).on('click', function () {
        $('#spiHelper_Case_Action', $topView).prop('disabled', $('#spiHelper_Close', $topView).prop('checked'));
      });
    }

    // Change the label on the rename button
    $('#spiHelper_moveLabel', $topView).html('Move case section (<span title="You probably want to move the full case, '
      + 'select All Sections instead of a specific date in the drop-down" '
      + 'class="rt-commentedText spihelper-hovertext"><b>READ ME FIRST</b></span>)');
  }
  // Only show options suitable for the archive subpage when running on the archives
  if (spiHelperIsThisPageAnArchive) {
    $('.spiHelper_notOnArchive', $topView).hide();
  }
}

/**
 * Updates whether the 'archive' checkbox is enabled
 */
function spiHelperUpdateArchive() {
  // Archive should only be an option if close is checked or disabled (disabled meaning that
  // the case is closed) and rename is not checked

  $('#spiHelper_Archive', document).prop('disabled', !($('#spiHelper_Close', document).prop('checked')
    || $('#spiHelper_Close', document).prop('disabled')) || $('#spiHelper_Move', document).prop('checked'));
  if ($('#spiHelper_Archive', document).prop('disabled')) {
    $('#spiHelper_Archive', document).prop('checked', false);
  }
}

/**
 * Updates whether the 'move' checkbox is enabled
 */
function spiHelperUpdateMove() {
  // Rename is mutually exclusive with archive

  $('#spiHelper_Move', document).prop('disabled', $('#spiHelper_Archive', document).prop('checked'));
  if ($('#spiHelper_Move', document).prop('disabled')) {
    $('#spiHelper_Move', document).prop('checked', false);
  }
}

/**
 * Generate a select input, optionally with an onChange call
 *
 * @param {string} id Name of the input
 * @param {SelectOption[]} options Array of options objects
 */
function spiHelperGenerateSelect(id: string, options: SelectOption[]) {
  // Add the dates to the selector
  const $selector = $('#' + id, document);
  for (const selectOption of options) {
    $('<option>')
      .val(selectOption.value)
      .prop('selected', selectOption.selected)
      .text(selectOption.label)
      .prop('disabled', selectOption.disabled)
      .appendTo($selector);
  }
}

/**
 * Given an HTML element, sets that element's value on all block options
 * For example, checking the 'block all' button will check all per-user 'block' elements
 *
 * @param {JQuery<HTMLElement>} source The HTML input element that we're matching all selections to
 * @param forTable Are we setting link table options or block table options
 */
function spiHelperSetAllTableColumnOpts(source: JQuery<HTMLElement>, forTable: 'link' | 'block') {
  for (let i = 1; i <= (forTable === 'link' ? spiHelperLinkTableUserCount : spiHelperBlockTableUserCount); i++) {
    const $target = $('#' + source.attr('id') + i);
    if (source.attr('type') === 'checkbox') {
      // Don't try to set disabled checkboxes
      if (!$target.prop('disabled')) {
        $target.prop('checked', source.prop('checked'));
      }
    }
    else {
      const sourceVal = source.val();
      if (sourceVal) {
        $target.val(sourceVal);
      }
    }
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
    $textBox.val(startText.substring(0, selectionStart)
      + newText
      + startText.substring(selectionEnd, startText.length));
    $textBox.prop('selectionStart', selectionStart + newText.length);
    $textBox.prop('selectionEnd', selectionEnd + newText.length);
  }
  else if (pos !== null) {
    $textBox.val(startText.substring(0, pos)
      + source.val()
      + startText.substring(pos, startText.length));
    $textBox.prop('selectionStart', selectionStart + newText.length);
    $textBox.prop('selectionEnd', selectionEnd + newText.length);
  }
  else {
    $textBox.val(startText + newText);
  }

  // Force the selected element to reset its selection to 0
  source.prop('selectedIndex', 0);
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
}

/**
 * Changes the case status in the comment box
 *
 * @param {JQuery<HTMLElement>} source Select box that was changed
 */
function spiHelperCaseActionUpdated(source: JQuery<HTMLElement>) {
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
 * Fires on page load, adds the SPI portlet and (if the page is categorized as "awaiting
 * archive," meaning that at least one closed template is on the page) the SPI-Archive portlet
 */
async function spiHelperAddLink() {
  await spiHelperLoadSettings();
  $.when(mw.loader.using(['mediawiki.util']), $.ready).then(function () {
    const initLink = mw.util.addPortletLink('p-cactions', '#', 'SPI', 'ca-spiHelper');
    // The skin didn't have a p-cactions menu so the menu addition failed. Exit early.
    if (!initLink) {
      return false;
    }
    initLink.addEventListener('click', (e) => {
      e.preventDefault();
      return spiHelperInit();
    });
    if (mw.config.get('wgCategories').includes('SPI cases awaiting archive') && spiHelperIsClerk()) {
      const oneClickArchiveLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Archive', 'ca-spiHelperArchive');
      if (oneClickArchiveLink) {
        $(oneClickArchiveLink).on('click', (e) => {
          e.preventDefault();
          return spiHelperOneClickArchive();
        });
      }
    }
    window.addEventListener('beforeunload', (e) => {
      const $actionView = $('#spiHelper_actionViewDiv', document);
      if ($actionView.length > 0) {
        e.preventDefault();
        return true;
      }

      // Make sure no operations are still in flight
      const isDirty = spiHelperActiveOperations.values().some(value => value === 'running');
      if (isDirty) {
        e.preventDefault();
        return true;
      }
    });
  });
}

// User role helper functions
/**
 * Whether the current user has admin permissions, used to determine
 * whether to show block options
 *
 * @return {boolean} Whether the current user is an admin
 */
function spiHelperIsAdmin(): boolean {
  if (spiHelperSettings.debugForceAdminState !== null) {
    return spiHelperSettings.debugForceAdminState;
  }
  return mw.config.get('wgUserGroups')?.includes('sysop') ?? false;
}

/**
 * Whether the current user has checkuser permissions, used to determine
 * whether to show checkuser options
 *
 * @return {boolean} Whether the current user is a checkuser
 */

function spiHelperIsCheckuser(): boolean {
  if (spiHelperSettings.debugForceCheckuserState !== null) {
    return spiHelperSettings.debugForceCheckuserState;
  }
  return mw.config.get('wgUserGroups')?.includes('sysop') ?? false;
}

/**
 * Whether the current user is a clerk, used to determine whether to show
 * clerk options
 *
 * @return {boolean} Whether the current user is a clerk
 */
function spiHelperIsClerk(): boolean {
  // Assumption: checkusers should see clerk options. Please don't prove this wrong.
  return spiHelperSettings.clerk || spiHelperIsCheckuser();
}

/**
 * Common username normalization function
 * @param username Username to normalize
 *
 * @return Normalized username
 */
function spiHelperNormalizeUsername(username: string): string {
  // Get rid of bad hidden characters
  username = username.replace(spiHelperHiddenCharNormRegex, '');
  // Remove leading and trailing spaces
  username = username.trim();
  if (mw.util.isIPAddress(username, true)) {
    // For IP addresses, capitalize them (really only applies to IPv6)
    username = username.toUpperCase();
  }
  else if (username) {
    // For actual usernames, make sure the first letter is capitalized
    // Ensure consistent case conversions with PHP as per https://phabricator.wikimedia.org/T292824
    username = new mw.Title(username).getMainText();
  }
  return username;
}

// </nowiki>

/**
 * Parse key features from an archivenotice
 * @param {string} page Page to parse
 *
 * @return {Promise<ParsedArchiveNotice>} Parsed archivenotice
 */
async function spiHelperParseArchiveNotice(page: string): Promise<ParsedArchiveNotice | null> {
  const pagetext = await spiHelperGetPageText(page, false);
  const match = spiHelperArchiveNoticeRegex.exec(pagetext);
  if (match === null || !match[1]) {
    console.error('Missing archive notice');
    return null;
  }
  const username = match[1];
  let deny = false;
  let xwiki = false;
  let notalk = false;
  if (match[2]) {
    for (const entry of match[2].split('|')) {
      if (!entry) {
        // split in such a way that it's just a pipe
        continue;
      }
      const [key, val] = entry.split('=');
      if (!key || !val) {
        console.error('Malformed archivenotice parameter ' + entry);
        continue;
      }
      if (val.toLowerCase() !== 'yes') {
        // Only care if the value is 'yes'
        continue;
      }
      if (key.toLowerCase() === 'deny') {
        deny = true;
      }
      else if (key.toLowerCase() === 'crosswiki') {
        xwiki = true;
      }
      else if (key.toLowerCase() === 'notalk') {
        notalk = true;
      }
    }
  }
  return {
    username: username,
    deny: deny,
    xwiki: xwiki,
    notalk: notalk,
  };
}

/**
 * Helper function to make a new archivenotice
 * @param {ParsedArchiveNotice} archiveNoticeParams ArchiveNotice params
 *
 * @return {string} New archivenotice
 */
function spiHelperMakeNewArchiveNotice(archiveNoticeParams: ParsedArchiveNotice): string {
  let notice = '{{SPI archive notice|1=' + archiveNoticeParams.username;
  if (archiveNoticeParams.xwiki) {
    notice += '|crosswiki=yes';
  }
  if (archiveNoticeParams.deny) {
    notice += '|deny=yes';
  }
  if (archiveNoticeParams.notalk) {
    notice += '|notalk=yes';
  }
  notice += '}}';

  return notice;
}

/**
 * Function to add a blank user line to the block table
 *
 * Would fail ESlint no-unused-vars due to only being
 * referenced in an onclick event
 *
 * @return {Promise<void>}
 */
async function spiHelperAddBlankUserLine(tableName: 'block' | 'link'): Promise<void> {
  if (tableName === 'block') {
    spiHelperBlockTableUserCount++;
    await spiHelperGenerateBlockTableLine('', true, spiHelperBlockTableUserCount);
  }
  else {
    spiHelperLinkTableUserCount++;
    await spiHelperGenerateLinksTableLine('', spiHelperLinkTableUserCount);
  }
  await updateForRole($('#spiHelper_topViewDiv', document));
}
