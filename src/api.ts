import type {
  ApiBlockParams,
  ApiDeleteParams,
  ApiEditPageParams,
  ApiMoveParams,
  ApiParseParams,
  ApiProtectParams,
  ApiPurgeParams,
  ApiQueryAllPagesParams,
  ApiQueryAllUsersParams,
  ApiQueryBacklinksParams,
  ApiQueryBlocksParams,
  ApiQueryCategoriesParams,
  ApiQueryCategoryMembersParams,
  ApiQueryFlaggedParams,
  ApiQueryInfoParams,
  ApiQueryRevisionsParams,
  ApiQuerySiteinfoParams,
  ApiStabilizeProtectParams,
  ApiUndeleteParams,
  CentralAuthApiQueryGlobalUsersParams,
  GlobalBlockingApiQueryGlobalBlocksParams,
} from 'types-mediawiki-api';
import type {
  AllPage,
  AllPagesResponse,
  AllUser,
  AllUsersResponse,
  BacklinksResponse,
  BlockActionResponse,
  BlockEntry,
  BlocksResponse,
  CategoriesResponse,
  CategoryMembersResponse,
  EditResponse,
  FlaggedResponse,
  GlobalBlockEntry,
  GlobalBlocksResponse,
  GlobalUser,
  GlobalUsersResponse,
  InfoResponse,
  NewPendingChanges,
  ParseResponse,
  PendingChanges,
  Protection,
  Restrictions,
  RevisionsResponse,
  SiteInfoResponse,
  WatchOption,
} from './types';
import {
  buildTitleLinkHtml, buildURLLinkHtml, spiHelperGetXWikiPrefix, spiHelperStripXWikiPrefix,
} from './utils.ts';
import { OpState, finishOp, startOp } from './operations.ts';
import { VERSION, spiHelperAdvert } from './constants';
import { SectionEntry } from './state.ts';
import { VueMessage } from './ui/messages.ts';

// noinspection JSUnusedGlobalSymbols
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
    formatversion: '2',
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
      acb: firstBlock.nocreate,
      abao: firstBlock.autoblock || firstBlock.anononly,
      ntp: !(firstBlock.allowusertalk),
      nem: firstBlock.noemail,
      reason: firstBlock.reason,
    };
  }
  catch {
    return null;
  }
}

export async function spiHelperGetBulkPageText(
  titles: string[],
): Promise<Map<string, string>> {
  if (titles.length === 0) {
    return new Map<string, string>();
  }
  const api = spiHelperGetAPI();
  const resultMap = new Map<string, string>();
  const chunkSize = await getApiChunkSize();

  await Promise.all(chunkArray(titles, chunkSize).map(async (chunk) => {
    const request: ApiQueryRevisionsParams = {
      action: 'query',
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
      titles: chunk,
      formatversion: '2',
    };
    try {
      const response = await api.post(request) as RevisionsResponse<'content'>;
      for (const page of response.query.pages) {
        if (page.missing) {
          continue;
        }
        const latestRevision = page.revisions?.[0];
        if (!latestRevision) {
          continue;
        }
        const pageTitle = page.title.split(':', 2)[1];
        if (!pageTitle) {
          console.error('spiHelperGetBulkPageText: could not find name for', page.title);
          continue;
        }
        resultMap.set(pageTitle, latestRevision.slots.main.content);
      }
    }
    catch (error) {
      console.error('spiHelperGetBulkPageText fetch error:', error);
    }
  }));

  return resultMap;
}

export async function spiHelperGetBulkUserBlockSettings(
  usernames: Set<string>,
): Promise<Map<string, BlockEntry>> {
  if (usernames.size === 0) {
    return new Map<string, BlockEntry>();
  }
  const api = spiHelperGetAPI();
  const resultMap = new Map<string, BlockEntry>();
  const chunkSize = await getApiChunkSize();

  await Promise.all(chunkArray([...usernames], chunkSize).map(async (chunk) => {
    const request: ApiQueryBlocksParams = {
      action: 'query',
      list: 'blocks',
      bklimit: 'max',
      bkusers: chunk,
      bkprop: ['user', 'reason', 'flags', 'expiry'],
      formatversion: '2',
    };
    try {
      const response = await api.post(request) as BlocksResponse;
      for (const block of response.query.blocks) {
        resultMap.set(block.user, {
          username: block.user,
          duration: block.expiry,
          acb: block.nocreate,
          abao: block.autoblock || block.anononly,
          ntp: !(block.allowusertalk),
          nem: block.noemail,
          reason: block.reason,
        });
      }
    }
    catch (error) {
      console.error('spiHelperGetBulkUserBlockSettings fetch error:', error);
    }
  }));

  return resultMap;
}

// noinspection JSUnusedGlobalSymbols
export async function spiHelperGetBulkPageCategories(
  pages: string[],
): Promise<Map<string, string[]>> {
  const api = spiHelperGetAPI();
  const resultMap = new Map<string, string[]>();
  if (pages.length === 0) {
    return resultMap;
  }
  const chunkSize = await getApiChunkSize();

  await Promise.all(chunkArray(pages, chunkSize).map(async (chunk) => {
    const request: ApiQueryCategoriesParams = {
      action: 'query',
      prop: 'categories',
      titles: chunk,
      cllimit: 'max',
      formatversion: '2',
    };
    try {
      const response = await api.post(request) as CategoriesResponse;
      for (const page of response.query.pages) {
        if (!page.categories) {
          continue;
        }
        const pageTitle = page.title.split(':', 2)[1];
        if (!pageTitle) {
          console.error('spiHelperGetBulkPageCategories: could not find name for', page.title);
          continue;
        }
        resultMap.set(pageTitle, page.categories.map(item => item.title));
      }
    }
    catch (error) {
      console.error('spiHelperGetBulkPageCategories fetch error:', error);
    }
  }));

  return resultMap;
}

/**
 * Get information about a set of global users
 *
 * @param {Set<string>} usernames Usernames to look up
 * @return {Promise<Map<string, GlobalUser>>} Information about each user, keyed by username.
 * Names without a global account (or that can't have one, such as IPs) are absent from the map.
 */
export async function spiHelperGetBulkGlobalUsers(
  usernames: Set<string>,
): Promise<Map<string, GlobalUser>> {
  if (usernames.size === 0) {
    return new Map<string, GlobalUser>();
  }
  const api = spiHelperGetAPI();
  const resultMap = new Map<string, GlobalUser>();
  const chunkSize = await getApiChunkSize();

  await Promise.all(chunkArray([...usernames], chunkSize).map(async (chunk) => {
    const request: CentralAuthApiQueryGlobalUsersParams = {
      action: 'query',
      list: 'globalusers',
      gususers: chunk,
      gusprop: ['locked', 'localinfo'],
      formatversion: '2',
    };
    try {
      const response = await api.post(request) as GlobalUsersResponse;
      for (const globalUser of response.query.globalusers) {
        if (globalUser.missing || globalUser.invalid) {
          continue;
        }
        resultMap.set(globalUser.name, {
          name: globalUser.name,
          existsLocally: globalUser.localinfo?.attached ?? false,
          locked: globalUser.locked ?? false,
        });
      }
    }
    catch (error) {
      console.error('spiHelperGetBulkGlobalUsers fetch error:', error);
    }
  }));

  return resultMap;
}

/**
 * Get the active global blocks on a set of targets
 *
 * @param {Set<string>} targets Usernames, IPs, or ranges to look up
 * @return {Promise<Map<string, GlobalBlockEntry>>} The active block on each target, keyed by
 * target. Targets that aren't globally blocked are absent from the map.
 */
export async function spiHelperGetBulkGlobalBlocks(
  targets: Set<string>,
): Promise<Map<string, GlobalBlockEntry>> {
  if (targets.size === 0) {
    return new Map<string, GlobalBlockEntry>();
  }
  const api = spiHelperGetAPI();
  const resultMap = new Map<string, GlobalBlockEntry>();
  const chunkSize = await getApiChunkSize();

  await Promise.all(chunkArray([...targets], chunkSize).map(async (chunk) => {
    const request: GlobalBlockingApiQueryGlobalBlocksParams = {
      action: 'query',
      list: 'globalblocks',
      bgtargets: chunk,
      bglimit: 'max',
      bgprop: ['id', 'target', 'by', 'expiry', 'reason'],
      formatversion: '2',
    };
    try {
      const response = await api.post(request) as GlobalBlocksResponse;
      for (const globalBlock of response.query.globalblocks) {
        // Autoblocks hide their target, and can't be matched to a row without one
        if (!globalBlock.target) {
          continue;
        }
        resultMap.set(globalBlock.target, {
          target: globalBlock.target,
          expiry: globalBlock.expiry,
          by: globalBlock.by,
          reason: globalBlock.reason,
        });
      }
    }
    catch (error) {
      console.error('spiHelperGetBulkGlobalBlocks fetch error:', error);
    }
  }));

  return resultMap;
}

export async function spiHelperGetUsers(from: string, limit: number): Promise<AllUser[]> {
  const api = spiHelperGetAPI();
  const request: ApiQueryAllUsersParams = {
    action: 'query',
    list: 'allusers',
    aulimit: limit,
    auprefix: from,
    auprop: ['blockinfo'],
    formatversion: '2',
  };
  try {
    const response = await api.get(request) as AllUsersResponse;
    return response.query.allusers;
  }
  catch {
    return [];
  }
}

export async function spiHelperGetPages(
  from: string, namespace: number, limit: number,
): Promise<AllPage[]> {
  const api = spiHelperGetAPI();
  const request: ApiQueryAllPagesParams = {
    action: 'query',
    list: 'allpages',
    aplimit: limit,
    apprefix: from,
    apnamespace: namespace,
    formatversion: '2',
  };
  try {
    const response = await api.get(request) as AllPagesResponse;
    return response.query.allpages;
  }
  catch {
    return [];
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

  const linkHtml = buildTitleLinkHtml(title);
  const message = new VueMessage({
    type: 'notice',
    content: `Deleting ${linkHtml}`,
    isHtml: true,
  }).show();

  const api = spiHelperGetAPI(title);
  const request: ApiDeleteParams = {
    action: 'delete',
    title: title,
    reason: reason,
  };
  try {
    await api.postWithToken('csrf', request);
    message.update({ type: 'success', content: `Deleted ${linkHtml}` });
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Failed to delete ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
    });
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

  const linkHtml = buildTitleLinkHtml(title);
  const message = new VueMessage({
    type: 'notice',
    content: `Undeleting ${linkHtml}`,
    isHtml: true,
  }).show();

  const api = spiHelperGetAPI(title);
  const request: ApiUndeleteParams = {
    action: 'undelete',
    title: title,
    reason: reason,
  };
  try {
    await api.postWithToken('csrf', request);
    message.update({ type: 'success', content: `Undeleted ${linkHtml}` });
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Failed to undelete ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
    });
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
    const response = await spiHelperGetAPI(title).post(request) as ParseResponse<'text'>;
    return response.parse?.text['*'] ?? '';
  }
  catch (error) {
    console.error('Error rendering text:', error);
    return '';
  }
}

/**
 * Get a list of investigations on the sockpuppet investigation page
 *
 * @return An array of section objects, each section is a separate investigation
 */
export async function spiHelperGetInvestigationSections(opts: {
  pageName?: string; content?: string;
}): Promise<SectionEntry[]> {
  const { pageName, content } = opts;
  // Uses the parse API to get page sections, then find the investigation
  // sections (should all be level-3 headers)
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'tocdata',
    formatversion: '2',
  };
  if (pageName !== undefined) {
    request.page = pageName;
  }
  else if (content !== undefined) {
    request.text = content;
    request.contentmodel = 'wikitext';
  }
  else {
    console.error('spiHelperGetInvestigationSections: No page name or content provided');
    return [];
  }
  const api = spiHelperGetAPI();
  try {
    const response = await api.post(request) as ParseResponse<'toc'>;
    if (!response.parse) {
      console.error('spiHelperGetInvestigationSections: Could not parse sections');
      return [];
    }
    const dateSections: SectionEntry[] = [];
    for (const section of response.parse.tocdata.sections) {
      if (section.tocLevel === 2 || section.hLevel === 3) {
        dateSections.push(new SectionEntry(parseInt(section.index), section.line));
      }
    }
    return dateSections;
  }
  catch (error) {
    console.warn('spiHelperGetInvestigationSections API error:', error);
    return [];
  }
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
        && !(/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(dictEntry.title));
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

  const linkHtml = buildTitleLinkHtml(pageName);
  const message = new VueMessage({ type: 'notice', content: `Protecting ${linkHtml}`, isHtml: true });

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
    message.update({ type: 'success', content: `Protected ${linkHtml}` });
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Failed to protect ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
    });
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
 * @param opts.user Username to block
 * @param opts.duration Duration of the block
 * @param opts.reason Reason to log for the block
 * @param opts.reblock Whether to override block if target user is already blocked
 * @param opts.anononly For IPs, whether this is an anonymous-only block (alternative is
 *                           that logged-in users with the IP are also blocked)
 * @param opts.accountcreation Whether to permit the user to create new accounts
 * @param opts.autoblock Whether to apply an autoblock to the user's IP
 * @param opts.notalkpage Whether to revoke talkpage access
 * @param opts.noemail Whether to block email
 * @param opts.watchBlockedUser Watchlist setting for whether to watch the newly-blocked user
 * @param opts.watchExpiry Duration to watch the blocked user, if unset
 *                             defaults to 'indefinite'

 * @return {Promise<boolean>} True if the block suceeded, false if not
 */
export async function spiHelperBlockUser(opts: {
  user: string; duration: string; reason: string; reblock: boolean;
  anononly: boolean; accountcreation: boolean; autoblock: boolean;
  notalkpage: boolean; noemail: boolean;
  watchBlockedUser: boolean; watchExpiry?: string;
}): Promise<boolean> {
  const {
    user,
    duration,
    reason,
    reblock,
    anononly,
    accountcreation,
    autoblock,
    notalkpage,
    noemail,
    watchBlockedUser,
    watchExpiry = 'indefinite',
  } = opts;

  const activeOpKey = 'block_' + user;
  startOp(activeOpKey);

  const userPage = 'User:' + user;
  const userLinkHtml = buildTitleLinkHtml(userPage);
  const message = new VueMessage({
    type: 'notice',
    content: `Blocking ${userLinkHtml}`,
    isHtml: true,
  }).show();

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
    allowusertalk: !notalkpage,
    noemail: noemail,
    watchuser: watchBlockedUser,
    watchlistexpiry: watchExpiry,
    user: user,
    formatversion: '2',
  };
  try {
    const response = await api.postWithToken('csrf', request) as BlockActionResponse;
    const blockLinkHtml = buildURLLinkHtml(mw.util.getUrl('Special:BlockList', { wpTarget: `#${response.block.id}` }), 'Blocked', 'Special:BlockList');
    message.update({ type: 'success', content: `${blockLinkHtml} user ${userLinkHtml}` });
    finishOp(activeOpKey, OpState.Success);
    return true;
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Failed to block ${userLinkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
    });
    finishOp(activeOpKey, OpState.Failed);
    return false;
  }
}

/**
 * Purges a page's cache
 *
 * @param {string} title Title of the page to purge
 */
export async function spiHelperPurgePage(title: string): Promise<void> {
  // Forces a cache purge on the selected page
  const linkHtml = buildTitleLinkHtml(title);
  const message = new VueMessage({
    type: 'notice',
    content: `Purging ${linkHtml}`,
    isHtml: true,
  }).show();
  const strippedTitle = spiHelperStripXWikiPrefix(title);

  const api = spiHelperGetAPI(title);
  const request: ApiPurgeParams = {
    action: 'purge',
    titles: strippedTitle,
  };
  try {
    await api.postWithToken('csrf', request);
    message.update({ type: 'success', content: `Purged ${linkHtml}` });
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Failed to purge ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
    });
  }
}

/**
 * Moves a page. Exactly what it sounds like.
 *
 * @param opts.sourcePage Title of the source page (page we're moving)
 * @param opts.destPage Title of the destination page (page we're moving to)
 * @param opts.summary Edit summary to use for the move
 * @param opts.ignoreWarnings Whether to ignore warnings on move
 * (used to force-move one page over another)
 * @param opts.suppressRedirect Don't create a redirect
 * @param opts.moveSubpages Whether to move the subpages of the source page as well
 */
export async function spiHelperMovePage(opts: {
  sourcePage: string;
  destPage: string;
  summary: string;
  ignoreWarnings: boolean;
  suppressRedirect?: boolean;
  moveSubpages?: boolean;
}) {
  const {
    sourcePage, destPage, summary, ignoreWarnings,
    suppressRedirect = false, moveSubpages = true,
  } = opts;
  const activeOpKey = 'move_' + sourcePage + '_' + destPage;
  startOp(activeOpKey);

  // Should never be a crosswiki call
  const api = spiHelperGetAPI();

  const sourceLinkHtml = buildTitleLinkHtml(sourcePage);
  const destLinkHtml = buildTitleLinkHtml(destPage);

  const message = new VueMessage({
    type: 'notice',
    content: `Moving ${sourceLinkHtml} to ${destLinkHtml}`,
    isHtml: true,
  }).show();

  const request: ApiMoveParams = {
    action: 'move',
    from: sourcePage,
    to: destPage,
    reason: summary + spiHelperAdvert,
    noredirect: suppressRedirect,
    movesubpages: moveSubpages,
    ignoreWarnings: ignoreWarnings,
  };
  try {
    await api.postWithToken('csrf', request);
    message.update({
      type: 'success',
      content: `Moved ${sourceLinkHtml} to ${destLinkHtml}`,
    });
    finishOp(activeOpKey, OpState.Success);
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Failed to move ${sourceLinkHtml} to ${destLinkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
    });
    finishOp(activeOpKey, OpState.Failed);
  }
}

/**
 *
 * @param {string} opts.title Title of the page to edit
 * @param {string} opts.newtext New content of the page
 * @param {string} opts.summary Edit summary to use for the edit
 * @param {boolean} opts.createonly Only try to create the page - if false,
 *                             will fail if the page already exists
 * @param {string} opts.watch What watchlist setting to use when editing - decides
 *                       whether the edited page will be watched
 * @param {string} opts.watchExpiry Duration to watch the edited page, if unset
 *                             defaults to 'indefinite'
 * @param {?number} opts.baseRevId Base revision ID, used to detect edit conflicts. If null,
 *                           we'll grab the current page ID.
 * @param {?number} [opts.sectionId=null] Section to edit - if null, edits the whole page
 *
 * @return {Promise<number | null>} The new revision ID if successful, or null if failure
 */
export async function spiHelperEditPage(opts: {
  title: string; newText: string; summary: string; createonly?: boolean;
  watch: WatchOption; watchExpiry?: string; baseRevId?: number; sectionId?: number | null;
}): Promise<number | null> {
  const {
    title,
    newText,
    summary,
    createonly = false,
    watch,
    watchExpiry,
    baseRevId,
    sectionId,
  } = opts;
  let activeOpKey = `edit_${title}`;
  if (sectionId) {
    activeOpKey += `_${sectionId}`;
  }
  startOp(activeOpKey);
  const pageLinkHtml = buildTitleLinkHtml(title);
  const message = new VueMessage({
    type: 'notice',
    content: 'Editing ' + pageLinkHtml,
    isHtml: true,
  }).show();

  const api = spiHelperGetAPI(title);
  const xwikiPrefix = spiHelperGetXWikiPrefix(title);
  const finalTitle = spiHelperStripXWikiPrefix(title);

  const request: ApiEditPageParams = {
    action: 'edit',
    watchlist: watch,
    summary: summary + spiHelperAdvert,
    text: newText,
    title: finalTitle,
    createonly: createonly,
    formatversion: '2',
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
    const response = await api.postWithToken('csrf', request) as EditResponse;
    const diffId = response.edit.newrevid;
    if (!diffId) {
      message.update({
        type: 'error',
        content: `Edit failed on ${pageLinkHtml}: ${mw.html.escape(JSON.stringify(response))}`,
      });
      console.error(response);
      finishOp(activeOpKey, OpState.Failed);
      return null;
    }
    // Keep the title's interwiki prefix on the diff link
    const diffUrl = xwikiPrefix === null
      ? mw.util.getUrl('', { diff: diffId })
      : mw.util.getUrl(`${xwikiPrefix}:Special:Diff/${diffId}`);
    const diffLinkHtml = buildURLLinkHtml(diffUrl, 'Saved', `View diff ${diffId}`);
    message.update({ type: 'success', content: `${diffLinkHtml} page ${pageLinkHtml}`, isHtml: true });
    finishOp(activeOpKey, OpState.Success);
    return response.edit.newrevid ?? null;
  }
  catch (error) {
    message.update({
      type: 'error',
      content: `Edit failed on ${pageLinkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
      isHtml: true,
    });
    console.error(error);
    finishOp(activeOpKey, OpState.Failed);
    return null;
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
  // Build the link element (use JQuery so we get escapes and such)
  const linkHtml = buildTitleLinkHtml(title);
  const message = new VueMessage({ type: 'notice', content: 'Getting page ' + linkHtml, isHtml: true });
  if (show) {
    message.show();
  }

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
      if (show) {
        message.update({ type: 'warning', content: `Page ${linkHtml} does not exist`, isHtml: true });
      }
      return '';
    }
    const latestRevision = targetPage.revisions?.[0];
    if (!latestRevision) {
      return '';
    }
    if (show) {
      message.update({ type: 'success', content: `Got ${linkHtml}`, isHtml: true });
    }
    return latestRevision.slots.main.content;
  }
  catch (error) {
    if (show) {
      message.update({
        type: 'error',
        content: `Failed to get ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
        isHtml: true,
      });
    }
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
    rvprop: 'ids',
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
    const latestRevision = targetPage.revisions?.[0];
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
    /* empty */
  }

  return 0;
}

export async function spiHelperGetPostExpandSizeFromText(text: string): Promise<number> {
  const api = spiHelperGetAPI();
  const request: ApiParseParams = {
    action: 'parse',
    prop: 'limitreportdata',
    text: text,
    contentmodel: 'wikitext',
  };
  try {
    const response = await api.post(request) as ParseResponse<'limit'>;
    return Number(response.parse?.limitreportdata.find(
      item => item.name === 'limitreport-postexpandincludesize',
    )?.['0'] ?? 0);
  }
  catch {
    /* empty */
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
    const response = await api.post(request) as ParseResponse<'text'>;
    return response.parse?.text['*'] ?? '';
  }
  catch {
    return '';
  }
}

export async function spiHelperGetCategoryMembers(category: string): Promise<string[]> {
  const api = spiHelperGetAPI();
  const request: ApiQueryCategoryMembersParams = {
    action: 'query',
    list: 'categorymembers',
    cmtitle: category,
    cmlimit: 'max',
    cmnamespace: 2,
    formatversion: '2',
  };
  try {
    const response = await api.get(request) as CategoryMembersResponse;
    return response.query.categorymembers.map(member => member.title);
  }
  catch {
    return [];
  }
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function getApiChunkSize(): Promise<number> {
  const rights = await mw.user.getRights();
  return rights.includes('apihighlimits') ? 500 : 50;
}

const userAgent = `MediaWiki-JS/${mw.config.get('wgVersion')} spihelper/${VERSION}`;
const APIs = {
  meta: new mw.ForeignApi('https://meta.wikimedia.org/w/api.php', { userAgent }),
  local: new mw.Api({ userAgent }),
};

/**
 * Given a page title, get an API to operate on that page
 *
 * @param title Title of the page we want the API for
 * @return {Object} MediaWiki Api/ForeignAPI for the target page's wiki
 */
export function spiHelperGetAPI(title?: string): mw.Api {
  if (title && spiHelperGetXWikiPrefix(title) !== null) {
    return APIs.meta;
  }
  else {
    return APIs.local;
  }
}

export function spiHelperGetEnwikiAPI(): mw.Api {
  if (mw.config.get('wgWikiID') === 'enwiki') {
    return APIs.local;
  }
  return new mw.ForeignApi('https://en.wikipedia.org/w/api.php', { userAgent });
}
