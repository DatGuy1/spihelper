import type {
  ApiBlockParams,
  ApiDeleteParams,
  ApiEditPageParams,
  ApiMoveParams,
  ApiParseParams,
  ApiProtectParams,
  ApiPurgeParams,
  ApiQueryBacklinksParams,
  ApiQueryBlocksParams,
  ApiQueryFlaggedParams,
  ApiQueryInfoParams,
  ApiQueryRevisionsParams,
  ApiQuerySiteinfoParams,
  ApiStabilizeProtectParams,
  ApiUndeleteParams,
  CentralAuthApiQueryGlobalAllUsersParams,
} from 'types-mediawiki-api';
import { type BlockEntry, type GlobalUser, SectionEntry } from './types/spi.ts';
import type {
  BacklinksResponse,
  BlocksResponse, FlaggedResponse, GlobalAllUseresResponse, InfoResponse,
  NewPendingChanges,
  ParseResponse,
  PendingChanges,
  Protection, Restrictions, RevisionsResponse,
  SectionResult, SiteInfoResponse,
  WatchOption,
} from './types/api.ts';
import { spiHelperStripXWikiPrefix } from './utils.ts';
import { finishOp, OpState, startOp } from './operations.ts';
import { spiHelperAdvert } from './constants/settings.ts';

/**
 * Get a user's current block settings
 *
 * @param {string} user Username
 * @return {Promise<BlockEntry>} Current block settings for the user, or null
 * if the user is not blocked
 */
export async function spiHelperGetUserBlockSettings(user: string): Promise<BlockEntry | null> {
  // Should probably make this find the strictest block what with the addition of multiblocks
  // This is not something which should ever be cross-wiki
  const api = spiHelperGetAPI();
  const request: ApiQueryBlocksParams = {
    action: 'query',
    list: 'blocks',
    bklimit: 1,
    bkusers: user,
    bkprop: ['user', 'reason', 'flags', 'expiry'],
  };
  try {
    const response = await api.get(request) as BlocksResponse;
    const [firstBlock] = response.query.blocks;
    if (!firstBlock) {
      // If the length is 0, then the user isn't blocked
      return null;
    }

    return {
      username: user,
      duration: firstBlock.expiry,
      acb: (firstBlock.nocreate || firstBlock.anononly),
      ab: firstBlock.autoblock,
      ntp: !(firstBlock.allowusertalk),
      nem: firstBlock.noemail,
      tpn: '',
      reason: firstBlock.reason,
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
export async function spiHelperGetGlobalUser(user: string): Promise<GlobalUser | null> {
  const api = spiHelperGetAPI();
  const request: CentralAuthApiQueryGlobalAllUsersParams = {
    action: 'query',
    list: 'globalallusers',
    agulimit: 1,
    agufrom: user,
    aguto: user,
    aguprop: ['lockinfo', 'existslocally'],
  };
  try {
    const response = await api.get(request) as GlobalAllUseresResponse;
    const [globalUserData] = response.query.globalallusers;

    if (!globalUserData) {
      // We couldn't find the global user
      return null;
    }
    return {
      name: globalUserData.name,
      existsLocally: 'existslocally' in globalUserData,
      locked: 'locked' in globalUserData,
    };
  }
  catch {
    return null;
  }
}

/**
 * Delete a page. Admin-only function.
 *
 * @param {string} title Title of the page to delete
 * @param {string} reason Reason to log for the page deletion
 */
export async function spiHelperDeletePage(title: string, reason: string) {
  const activeOpKey = 'delete_' + title;
  startOp(activeOpKey);

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
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to delete ' + $link.prop('outerHTML') + '</b>: ' + error);
    finishOp(activeOpKey, OpState.Failed);
  }
}

/**
 * Undelete a page (or, if the page exists, undelete deleted revisions). Admin-only function
 *
 * @param {string} title Title of the pgae to undelete
 * @param {string} reason Reason to log for the page undeletion
 */
export async function spiHelperUndeletePage(title: string, reason: string) {
  const activeOpKey = 'undelete_' + title;
  startOp(activeOpKey);

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
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to undelete ' + $link.prop('outerHTML') + '</b>: ' + error);
    finishOp(activeOpKey, OpState.Failed);
  }
}

/**
 * Render a snippet of wikitext
 *
 * @param {string} title Page title
 * @param {string} text Text to render
 * @return {Promise<string>} Rendered version of the text
 */
export async function spiHelperRenderText(title: string, text: string): Promise<string> {
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'text',
    pst: true,
    text: text,
    title: title,
  };

  try {
    const response = await spiHelperGetAPI(title).get(request) as ParseResponse<'text'>;
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
export async function spiHelperGetInvestigationSectionIDs(
  pageName: string,
): Promise<SectionEntry[]> {
  // Uses the parse API to get page sections, then find the investigation
  // sections (should all be level-3 headers)

  // Since this only affects the local page, no need to call spiHelper_getAPI()
  const request: ApiParseParams = {
    action: 'parse',
    // @ts-expect-error - Latest MediaWiki deprecated 'section'
    // Remove me at next types-mediawiki release
    prop: 'tocdata',
    page: pageName,
  };
  const api = spiHelperGetAPI();
  const response = await api.get(request) as ParseResponse<'toc'>;
  const dateSections: SectionEntry[] = [];
  for (let i = 0; i < response.parse.tocdata.sections.length; i++) {
    // TODO: also check for presence of spi case status
    const currentSection = response.parse.tocdata.sections[i] as SectionResult;
    if (parseInt(currentSection.hLevel) === 3) {
      dateSections.push(new SectionEntry(parseInt(currentSection.index), currentSection.line));
    }
  }
  return dateSections;
}

/**
 * Get SPI page backlinks to this SPI page.
 * Used to fix double redirects when merging cases.
 */
export async function spiHelperGetSPIBacklinks(casePageName: string) {
  const api = spiHelperGetAPI();
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
    const response = await api.get(request) as BacklinksResponse;
    return response.query.backlinks.filter((dictEntry) => {
      return dictEntry.title.startsWith('Wikipedia:Sockpuppet investigations/')
        && !dictEntry.title.startsWith('Wikipedia:Sockpuppet investigations/SPI/')
        && !dictEntry.title.match('Wikipedia:Sockpuppet investigations/.*/Archive.*');
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
export async function spiHelperGetProtectionInformation(
  casePageName: string,
): Promise<Protection[]> {
  // Only looking for enwiki protection information
  const api = spiHelperGetAPI();
  const request: ApiQueryInfoParams = {
    action: 'query',
    format: 'json',
    prop: 'info',
    titles: casePageName,
    inprop: 'protection',
    formatversion: '2',
  };
  try {
    const response = await api.get(request) as InfoResponse;
    const [page] = response.query.pages;
    return page?.protection ?? [];
  }
  catch {
    return [];
  }
}

/**
 * Gets stabilisation settings information for a page.
 * If no pending changes exists then it returns false.
 */
export async function spiHelperGetStabilisationSettings(
  pageName: string,
): Promise<PendingChanges | null> {
  // Only looking for enwiki stabilisation information
  const api = spiHelperGetAPI();
  const request: ApiQueryFlaggedParams = {
    action: 'query',
    format: 'json',
    prop: 'flagged',
    titles: pageName,
    formatversion: '2',
  };
  try {
    const response = await api.get(request) as FlaggedResponse;
    const [page] = response.query.pages;
    return page?.flagged ?? null;
  }
  catch {
    return null;
  }
}

export async function spiHelperProtectPage(pageName: string, protections: Protection[]) {
  const activeOpKey = 'protect_' + pageName;
  startOp(activeOpKey);

  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(pageName)).attr('title', pageName).text(pageName);
  $statusLine.html('Protecting ' + $link.prop('outerHTML'));

  const api = spiHelperGetAPI();
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
      title: pageName,
      protections: protectLevel,
      expiry: expiryInfo,
      reason: 'Restoring protection after history merge',
    };
    await api.postWithToken('csrf', request);
    $statusLine.html('Protected ' + $link.prop('outerHTML'));
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    $statusLine
      .addClass('spihelper-errortext')
      .html('<b>Failed to protect ' + $link.prop('outerHTML') + '</b>: ' + error);
    finishOp(activeOpKey, OpState.Failed);
  }
}

export async function spiHelperConfigurePendingChanges(
  casePageName: string, protection: NewPendingChanges,
) {
  if (protection.level === '') {
    return;
  }
  // Only lookint to protect pages on enwiki
  const activeOpKey = 'stabilize_' + casePageName;
  startOp(activeOpKey);

  const api = spiHelperGetAPI();
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
    finishOp(activeOpKey, OpState.Success);
  }
  catch {
    finishOp(activeOpKey, OpState.Failed);
  }
}

export async function spiHelperGetSiteRestrictionInformation(): Promise<Restrictions> {
  // For enwiki only as this is it's only use case
  const api = spiHelperGetAPI();
  const request: ApiQuerySiteinfoParams = {
    action: 'query',
    format: 'json',
    meta: 'siteinfo',
    siprop: 'restrictions',
  };
  try {
    const response = await api.get(request) as SiteInfoResponse;
    return response.query.restrictions;
  }
  catch {
    return {
      types: [],
      levels: [],
      cascadinglevels: [],
      semiprotectedlevels: [],
    };
  }
}

/**
 * Blocks a user.
 *
 * @param {string} user Username to block
 * @param {string} duration Duration of the block
 * @param {string} reason Reason to log for the block
 * @param {boolean} reblock Whether to override block if target user is already blocked
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
export async function spiHelperWikiBlockUser(
  user: string, duration: string, reason: string, reblock: boolean,
  anononly: boolean, accountcreation: boolean, autoblock: boolean,
  talkpage: boolean, email: boolean,
  watchBlockedUser: boolean, watchExpiry: string,
): Promise<boolean> {
  const activeOpKey = 'block_' + user;
  startOp(activeOpKey);

  if (!watchExpiry) {
    watchExpiry = 'indefinite';
  }
  const userPage = 'User:' + user;
  const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
  const $link = $('<a>').attr('href', mw.util.getUrl(userPage)).attr('title', userPage).text(user);
  $statusLine.html('Blocking ' + $link.prop('outerHTML'));

  // This is not something which should ever be cross-wiki
  const api = spiHelperGetAPI();
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
    finishOp(activeOpKey, OpState.Success);
    return true;
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to block ' + $link.prop('outerHTML') + '</b>: ' + error);
    finishOp(activeOpKey, OpState.Failed);
    return false;
  }
}

/**
 * Purges a page's cache
 *
 *
 * @param {string} title Title of the page to purge
 */
export async function spiHelperPurgePage(title: string): Promise<void> {
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
 * Moves a page. Exactly what it sounds like.
 *
 * @param {string} sourcePage Title of the source page (page we're moving)
 * @param {string} destPage Title of the destination page (page we're moving to)
 * @param {string} summary Edit summary to use for the move
 * @param {boolean} ignoreWarnings Whether to ignore warnings on move
 * (used to force-move one page over another)
 * @param moveSubpages Whether to move the subpages of the source page as well
 */
export async function spiHelperMovePage(
  sourcePage: string, destPage: string, summary: string,
  ignoreWarnings: boolean, moveSubpages: boolean = true,
) {
  const activeOpKey = 'move_' + sourcePage + '_' + destPage;
  startOp(activeOpKey);

  // Should never be a crosswiki call
  const api = spiHelperGetAPI();

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
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to move ' + $sourceLink.prop('outerHTML') + ' to ' + $destLink.prop('outerHTML') + '</b>: ' + error);
    finishOp(activeOpKey, OpState.Failed);
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
export async function spiHelperEditPage(
  title: string, newtext: string, summary: string, createonly: boolean,
  watch: WatchOption, watchExpiry?: string, baseRevId?: number, sectionId?: number | null,
): Promise<boolean> {
  let activeOpKey = 'edit_' + title;
  if (sectionId) {
    activeOpKey += '_' + sectionId;
  }
  startOp(activeOpKey);
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
    finishOp(activeOpKey, OpState.Success);
    return true;
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Edit failed on ' + $link.html() + '</b>: ' + error);
    console.error(error);
    finishOp(activeOpKey, OpState.Failed);
    return false;
  }
}

/**
 * Get the text of a page. Not that complicated.
 *
 * @param title Title of the page to get the contents of
 * @param show Whether to show page fetch progress on-screen
 * @param sectionId Section to retrieve, setting this to null will retrieve the entire page
 *
 * @return {Promise<string>} The text of the page, '' if the page does not exist.
 */
export async function spiHelperGetPageText(
  title: string, show: boolean, sectionId?: number | null,
): Promise<string> {
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
    titles: finalTitle,
    formatversion: '2',
  };

  if (sectionId) {
    request.rvsection = sectionId.toString();
  }

  try {
    const response = await spiHelperGetAPI(title).get(request) as RevisionsResponse<'content'>;
    const targetPage = response.query.pages[0];
    if (!targetPage || 'missing' in targetPage) {
      $statusLine.html('Page ' + $link.html() + ' does not exist');
      return '';
    }
    const latestRevision = targetPage.revisions[0];
    if (!latestRevision) {
      return '';
    }
    $statusLine.html('Got ' + $link.html());
    return latestRevision.slots.main.content;
  }
  catch (error) {
    $statusLine.addClass('spihelper-errortext').html('<b>Failed to get ' + $link.html() + '</b>: ' + error);
    return '';
  }
}

/**
 * Get a page's latest revision ID - useful for preventing edit conflicts
 *
 * @param {string} title Title of the page
 * @return {Promise<number>} Latest revision of a page, 0 if it doesn't exist
 */
export async function spiHelperGetPageRev(title: string): Promise<number> {
  const finalTitle = spiHelperStripXWikiPrefix(title);
  const request: ApiQueryRevisionsParams = {
    action: 'query',
    prop: 'revisions',
    rvslots: 'main',
    rvprop: ['ids'],
    titles: finalTitle,
    formatversion: '2',
  };

  try {
    const response = await spiHelperGetAPI(title).get(request) as RevisionsResponse<'ids'>;
    const targetPage = response.query.pages[0];
    if (!targetPage || 'missing' in targetPage) {
      // Check if page is missing
      return 0;
    }
    const latestRevision = targetPage.revisions[0];
    if (!latestRevision) {
      // Another sanity check, in case it's revision-deleted or something
      return 0;
    }
    return latestRevision.revid;
  }
  catch {
    return 0;
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
export async function spiHelperGetPostExpandSize(
  title: string, sectionId?: number,
): Promise<number> {
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
    const response = await api.get(request) as ParseResponse<'limit'>;

    // The page might not exist, so we need to handle that smartly
    return Number(response.parse?.limitreportdata.find(item => item.name === 'limitreport-postexpandincludesize')?.['0'] ?? 0);
  }
  catch {
    // Something's gone wrong, just return 0
  }

  return 0;
}

/**
 * Parse given text as wikitext without it needing to be currently saved onwiki.
 *
 */
export async function spiHelperParseWikitext(wikitext: string) {
  // For enwiki only for now
  const api = spiHelperGetAPI();
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'text',
    text: wikitext,
    wrapoutputclass: '',
    disablelimitreport: true,
    disableeditsection: true,
    contentmodel: 'wikitext',
  };
  try {
    const response = await api.get(request) as ParseResponse<'text'>;
    return response.parse.text['*'];
  }
  catch {
    return '';
  }
}

// @ts-expect-error Ignore __VERSION__ not existing error because Bun should replace it on compile
const userAgent = 'MediaWiki-JS/' + mw.config.get('wgVersion') + ' spihelper/' + __VERSION__;
const APIs = {
  meta: new mw.ForeignApi('https://meta.wikimedia.org/w/api.php', { userAgent: userAgent }),
  local: new mw.Api({ userAgent: userAgent }),
};

/**
 * Given a page title, get an API to operate on that page
 *
 * @param title Title of the page we want the API for
 * @return {Object} MediaWiki Api/ForeignAPI for the target page's wiki
 */
export function spiHelperGetAPI(title?: string): mw.Api {
  if (title && (title.startsWith('m:') || title.startsWith('meta:'))) {
    return APIs.meta;
  }
  else {
    return APIs.local;
  }
}
