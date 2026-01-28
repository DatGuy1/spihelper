// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/develop|path=spihelper.js}}
// v3.0.0-beta.3 "A Whole New World"
// <nowiki>
(() => {

  // src/constants/regex.ts
  var spiHelperCaseStatusRegex = /{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i;
  var spiHelperCaseClosedRegex = /^closed?$/i;
  var spiHelperClerkStatusRegex = /{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu)?endorse|inprogress|decline(?:-ip)?|moreinfo|relisted|onhold)}}/i;
  var spiHelperSockSectionWithNewlineRegex = /====\s*Suspected sockpuppets\s*====\n*/i;
  var spiHelperAdminSectionWithPrecedingNewlinesRegex = /\n*\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i;
  var spiHelperCUBlockRegex = /{{(checkuserblock(-account|-wide)?|checkuser block)}}/i;
  var spiHelperArchiveNoticeRegex = /{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i;
  var spiHelperPriorCasesRegex = /{{spipriorcases}}/i;
  var spiHelperSectionRegex = /^(?:===[^=]*===|=====[^=]*=====)\s*$/m;
  var spiHelperHiddenCharNormRegex = /\u200E/g;
  var spiHelperSignatureRegex = /(?<!~)~~~~(?!~)/;

  // src/utils.ts
  function spiHelperStripXWikiPrefix(title) {
    if (title.startsWith("m:") || title.startsWith("meta:")) {
      return title.slice(title.indexOf(":") + 1);
    } else {
      return title;
    }
  }
  function spiHelperGetMaxPostExpandSize() {
    return mw.config.get("wgPageParseReport").limitreport.postexpandincludesize.limit;
  }
  function spiHelperGetInterwikiPrefix() {
    const temp = mw.config.get("wgServer").replace(/^(https?)?:?\/\//, "").split(".");
    const wikiLang = temp[0];
    const wikiFamily = temp[1];
    if (wikiLang === undefined || wikiFamily === undefined) {
      return "";
    }
    let iwPrefix;
    switch (wikiFamily) {
      case "wikimedia":
        switch (wikiLang) {
          case "commons":
          case "meta":
          case "species":
          case "incubator":
          case "outreach":
            iwPrefix = wikiLang;
            break;
          default:
            break;
        }
        break;
      case "mediawiki":
        iwPrefix = "mw";
        break;
      case "wikidata":
        switch (wikiLang) {
          case "test":
            iwPrefix = "testwikidata";
            break;
          case "www":
            iwPrefix = "d";
            break;
          default:
            break;
        }
        break;
      case "wikipedia":
        switch (wikiLang) {
          case "test":
            iwPrefix = "testwiki";
            break;
          case "test2":
            iwPrefix = "test2wiki";
            break;
          default:
            iwPrefix = "w:" + wikiLang;
            break;
        }
        break;
      case "wiktionary":
        iwPrefix = "wikt:" + wikiLang;
        break;
      case "wikiquote":
        iwPrefix = "q:" + wikiLang;
        break;
      case "wikibooks":
        iwPrefix = "b:" + wikiLang;
        break;
      case "wikinews":
        iwPrefix = "n:" + wikiLang;
        break;
      case "wikisource":
        iwPrefix = "s:" + wikiLang;
        break;
      case "wikiversity":
        iwPrefix = "v:" + wikiLang;
        break;
      case "wikivoyage":
        iwPrefix = "voy:" + wikiLang;
        break;
      default:
        return "";
    }
    return `:${iwPrefix}:`;
  }
  function spiHelperNormalizeUsername(username) {
    username = username.replace(spiHelperHiddenCharNormRegex, "");
    username = username.trim();
    if (mw.util.isIPAddress(username, true)) {
      username = username.toUpperCase();
    } else if (username) {
      username = new mw.Title(username).getMainText();
    }
    return username;
  }
  function isAbsoluteExpiry(value) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value);
  }
  function isNoExpiry(value) {
    return mw.util.isInfinity(value);
  }
  var RELATIVE_UNITS = [
    "second",
    "seconds",
    "minute",
    "minutes",
    "hour",
    "hours",
    "day",
    "days",
    "week",
    "weeks",
    "month",
    "months",
    "year",
    "years"
  ];
  var RELATIVE_REGEX = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${RELATIVE_UNITS.join("|")})$`, "i");
  function isRelativeExpiry(value) {
    return RELATIVE_REGEX.test(value);
  }
  function parseExpiry(value) {
    if (isNoExpiry(value))
      return value;
    if (isAbsoluteExpiry(value))
      return value;
    if (isRelativeExpiry(value))
      return value;
    return null;
  }
  function isNonRegisteredAccount(username) {
    return mw.util.isIPAddress(username, true) || mw.util.isTemporaryUser(username);
  }
  function addSignature(text) {
    const withSignature = spiHelperSignatureRegex.test(text);
    return withSignature ? text : text.trimEnd() + " ~~~~";
  }
  function buildTitleLinkHtml(title, text) {
    text ??= title;
    const $link = $("<a>").attr("href", mw.util.getUrl(title)).attr("title", title).text(text);
    return $link.prop("outerHTML");
  }

  // src/operations.ts
  var activeOperations = new Map;
  function startOp(name) {
    activeOperations.set(name, "running" /* Running */);
  }
  function finishOp(name, state) {
    activeOperations.set(name, state);
  }
  function hasRunningOps() {
    for (const state of activeOperations.values()) {
      if (state === "running" /* Running */)
        return true;
    }
    return false;
  }
  function isOpRunning(name) {
    return activeOperations.get(name) === "running" /* Running */;
  }
  function getOpState(name) {
    return activeOperations.get(name);
  }

  // src/constants/settings.ts
  var spiHelperDefaultSettings = {
    watch: {
      case: "preferences",
      archive: "nochange",
      tagged: "preferences",
      categories: "nochange",
      blocked: true
    },
    expiry: {
      case: "indefinite",
      archive: "indefinite",
      tagged: "indefinite",
      categories: "indefinite",
      blocked: "indefinite"
    },
    log: {
      enabled: false,
      reversed: false,
      page: "spihelper_log"
    },
    clerk: true,
    iUnderstandSectionMoves: false,
    tickArchiveWhenCaseClosed: true,
    useCheckuserblockAccount: mw.config.get("wgUserGroups")?.includes("checkuser") ?? false,
    useLookup: true,
    interface: {
      defaultBlockDuration: "",
      displayIPv6As64: true,
      pinned: true,
      buttonLayout: true
    },
    debug: {
      enabled: false,
      forceCheckuser: false,
      forceAdmin: false
    }
  };
  var spiHelperAdvert = " (using [[:w:en:User:DatGuy/spihelper|User:DatGuy/spihelper.js]])";
  var FeedbackConfig = {
    title: new mw.Title("User talk:DatGuy/spihelper.js"),
    bugsLink: "//github.com/DatGuy1/spihelper/issues/new",
    showUseragentCheckbox: true,
    useragentCheckboxMessage: "I want to share my user agent publicly alongside my feedback. This is optional."
  };

  // src/ui/messages.ts
  class VueMessage {
    type;
    content;
    isHtml;
    _index;
    constructor(opts) {
      this.type = opts.type;
      this.content = opts.content;
      this.isHtml = opts.isHtml;
    }
    show() {
      const index = messages.length;
      messages.push(this);
      this._index = index;
      return this;
    }
    update(opts) {
      Object.assign(this, opts);
      if (this._index === undefined) {
        this.show();
      } else {
        messages[this._index] = this;
      }
      return this;
    }
  }
  var messages = [];
  mw.loader.using(["vue"], (require2) => {
    const Vue = require2("vue");
    messages = Vue.reactive(messages);
  });

  // src/api.ts
  async function spiHelperGetBulkPageText(titles) {
    if (titles.length === 0) {
      return new Map;
    }
    const api = spiHelperGetAPI();
    const resultMap = new Map;
    const request = {
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      titles,
      formatversion: "2"
    };
    try {
      const response = await api.get(request);
      for (const page of response.query.pages) {
        if (page.missing) {
          continue;
        }
        const latestRevision = page.revisions?.[0];
        if (!latestRevision) {
          continue;
        }
        const pageTitle = page.title.split(":", 2)[1];
        if (!pageTitle) {
          console.error("spiHelperGetBulkPageText: could not find name for", page.title);
          continue;
        }
        resultMap.set(pageTitle, latestRevision.slots.main.content);
      }
    } catch (error) {
      console.error("spiHelperGetBulkPageText fetch error:", error);
    }
    return resultMap;
  }
  async function spiHelperGetBulkUserBlockSettings(usernames) {
    if (usernames.length == 0) {
      return new Map;
    }
    const api = spiHelperGetAPI();
    const resultMap = new Map;
    const request = {
      action: "query",
      list: "blocks",
      bklimit: "max",
      bkusers: usernames,
      bkprop: ["user", "reason", "flags", "expiry"],
      formatversion: "2"
    };
    try {
      const response = await api.get(request);
      for (const block of response.query.blocks) {
        resultMap.set(block.user, {
          username: block.user,
          duration: block.expiry,
          acb: block.nocreate,
          abao: block.autoblock || block.anononly,
          ntp: !block.allowusertalk,
          nem: block.noemail,
          reason: block.reason
        });
      }
    } catch (error) {
      console.error("spiHelperGetBulkUserBlockSettings fetch error:", error);
    }
    return resultMap;
  }
  async function spiHelperGetGlobalUser(user) {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      list: "globalallusers",
      agulimit: 1,
      agufrom: user,
      aguto: user,
      aguprop: ["lockinfo", "existslocally"]
    };
    try {
      const response = await api.get(request);
      const [globalUserData] = response.query.globalallusers;
      if (!globalUserData) {
        return null;
      }
      return {
        name: globalUserData.name,
        existsLocally: "existslocally" in globalUserData,
        locked: "locked" in globalUserData
      };
    } catch {
      return null;
    }
  }
  async function spiHelperGetUsers(from, limit) {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      list: "allusers",
      aulimit: limit,
      auprefix: from,
      auprop: ["blockinfo"],
      formatversion: "2"
    };
    try {
      const response = await api.get(request);
      return response.query.allusers;
    } catch {
      return [];
    }
  }
  async function spiHelperGetPages(from, namespace, limit) {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      list: "allpages",
      aplimit: limit,
      apprefix: from,
      apnamespace: namespace,
      formatversion: "2"
    };
    try {
      const response = await api.get(request);
      return response.query.allpages;
    } catch {
      return [];
    }
  }
  async function spiHelperDeletePage(title, reason) {
    const activeOpKey = "delete_" + title;
    startOp(activeOpKey);
    const linkHtml = buildTitleLinkHtml(title);
    const message = new VueMessage({
      type: "notice",
      content: `Deleting ${linkHtml}`,
      isHtml: true
    }).show();
    const api = spiHelperGetAPI(title);
    const request = {
      action: "delete",
      title,
      reason
    };
    try {
      await api.postWithToken("csrf", request);
      message.update({ type: "success", content: `Deleted ${linkHtml}` });
      finishOp(activeOpKey, "success" /* Success */);
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to delete ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
      finishOp(activeOpKey, "failed" /* Failed */);
    }
  }
  async function spiHelperUndeletePage(title, reason) {
    const activeOpKey = "undelete_" + title;
    startOp(activeOpKey);
    const linkHtml = buildTitleLinkHtml(title);
    const message = new VueMessage({
      type: "notice",
      content: `Undeleting ${linkHtml}`,
      isHtml: true
    }).show();
    const api = spiHelperGetAPI(title);
    const request = {
      action: "undelete",
      title,
      reason
    };
    try {
      await api.postWithToken("csrf", request);
      message.update({ type: "success", content: `Undeleted ${linkHtml}` });
      finishOp(activeOpKey, "success" /* Success */);
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to undelete ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
      finishOp(activeOpKey, "failed" /* Failed */);
    }
  }
  async function spiHelperRenderText(title, text) {
    const request = {
      action: "parse",
      prop: "text",
      pst: true,
      text,
      title
    };
    try {
      const response = await spiHelperGetAPI(title).get(request);
      return response.parse?.text["*"] ?? "";
    } catch (error) {
      console.error("Error rendering text:", error);
      return "";
    }
  }
  async function spiHelperGetInvestigationSectionIDs(pageName) {
    const request = {
      action: "parse",
      prop: "tocdata",
      page: pageName
    };
    const api = spiHelperGetAPI();
    const response = await api.get(request);
    if (!response.parse) {
      console.error("spiHelperGetInvestigationSectionIDs: Could not parse sections");
      return [];
    }
    const dateSections = [];
    for (const section of response.parse.tocdata.sections) {
      if (parseInt(section.hLevel) === 3) {
        dateSections.push(new SectionEntry(parseInt(section.index), section.line));
      }
    }
    return dateSections;
  }
  async function spiHelperGetSPIBacklinks(casePageName) {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      format: "json",
      list: "backlinks",
      bltitle: casePageName,
      blnamespace: 4,
      bldir: "ascending",
      blfilterredir: "nonredirects"
    };
    try {
      const response = await api.get(request);
      return response.query.backlinks.filter((dictEntry) => {
        return dictEntry.title.startsWith("Wikipedia:Sockpuppet investigations/") && !dictEntry.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/") && !/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(dictEntry.title);
      });
    } catch {
      return [];
    }
  }
  async function spiHelperGetProtectionInformation(casePageName) {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      format: "json",
      prop: "info",
      titles: casePageName,
      inprop: "protection",
      formatversion: "2"
    };
    try {
      const response = await api.get(request);
      const [page] = response.query.pages;
      return page?.protection ?? [];
    } catch {
      return [];
    }
  }
  async function spiHelperGetStabilisationSettings(pageName) {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      format: "json",
      prop: "flagged",
      titles: pageName,
      formatversion: "2"
    };
    try {
      const response = await api.get(request);
      const [page] = response.query.pages;
      return page?.flagged ?? null;
    } catch {
      return null;
    }
  }
  async function spiHelperProtectPage(pageName, protections) {
    const activeOpKey = "protect_" + pageName;
    startOp(activeOpKey);
    const linkHtml = buildTitleLinkHtml(pageName);
    const message = new VueMessage({ type: "notice", content: `Protecting ${linkHtml}`, isHtml: true });
    const api = spiHelperGetAPI();
    try {
      let protectLevel = "";
      let expiryInfo = "";
      protections.forEach((protection) => {
        if (protectLevel !== "") {
          protectLevel = protectLevel + "|";
          expiryInfo = expiryInfo + "|";
        }
        protectLevel = protectLevel + protection.type + "=" + protection.level;
        expiryInfo = expiryInfo + protection.expiry;
      });
      const request = {
        action: "protect",
        format: "json",
        title: pageName,
        protections: protectLevel,
        expiry: expiryInfo,
        reason: "Restoring protection after history merge"
      };
      await api.postWithToken("csrf", request);
      message.update({ type: "success", content: `Protected ${linkHtml}` });
      finishOp(activeOpKey, "success" /* Success */);
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to protect ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
      finishOp(activeOpKey, "failed" /* Failed */);
    }
  }
  async function spiHelperConfigurePendingChanges(casePageName, protection) {
    if (protection.level === "") {
      return;
    }
    const activeOpKey = "stabilize_" + casePageName;
    startOp(activeOpKey);
    const api = spiHelperGetAPI();
    const request = {
      action: "stabilize",
      format: "json",
      titles: casePageName,
      protectlevel: protection.level,
      expiry: protection.expiry,
      reason: "Restoring pending changes protection after history merge"
    };
    try {
      await api.postWithToken("csrf", request);
      finishOp(activeOpKey, "success" /* Success */);
    } catch {
      finishOp(activeOpKey, "failed" /* Failed */);
    }
  }
  async function spiHelperGetSiteRestrictionInformation() {
    const api = spiHelperGetAPI();
    const request = {
      action: "query",
      format: "json",
      meta: "siteinfo",
      siprop: "restrictions"
    };
    try {
      const response = await api.get(request);
      return response.query.restrictions;
    } catch {
      return {
        types: [],
        levels: [],
        cascadinglevels: [],
        semiprotectedlevels: []
      };
    }
  }
  async function spiHelperBlockUser(opts) {
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
      watchExpiry = "indefinite"
    } = opts;
    const activeOpKey = "block_" + user;
    startOp(activeOpKey);
    const userPage = "User:" + user;
    const linkHtml = buildTitleLinkHtml(userPage);
    const message = new VueMessage({
      type: "notice",
      content: `Blocking ${linkHtml}`,
      isHtml: true
    }).show();
    const api = spiHelperGetAPI();
    const request = {
      action: "block",
      expiry: duration,
      reason,
      reblock,
      anononly,
      nocreate: accountcreation,
      autoblock,
      allowusertalk: !notalkpage,
      noemail,
      watchuser: watchBlockedUser,
      watchlistexpiry: watchExpiry,
      user
    };
    try {
      await api.postWithToken("csrf", request);
      message.update({ type: "success", content: `Blocked ${linkHtml}` });
      finishOp(activeOpKey, "success" /* Success */);
      return true;
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to block ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
      finishOp(activeOpKey, "failed" /* Failed */);
      return false;
    }
  }
  async function spiHelperPurgePage(title) {
    const linkHtml = buildTitleLinkHtml(title);
    const message = new VueMessage({
      type: "notice",
      content: `Purging ${linkHtml}`,
      isHtml: true
    }).show();
    const strippedTitle = spiHelperStripXWikiPrefix(title);
    const api = spiHelperGetAPI(title);
    const request = {
      action: "purge",
      titles: strippedTitle
    };
    try {
      await api.postWithToken("csrf", request);
      message.update({ type: "success", content: `Purged ${linkHtml}` });
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to purge ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
    }
  }
  async function spiHelperMovePage(opts) {
    const { sourcePage, destPage, summary, ignoreWarnings, moveSubpages = true } = opts;
    const activeOpKey = "move_" + sourcePage + "_" + destPage;
    startOp(activeOpKey);
    const api = spiHelperGetAPI();
    const sourceLinkHtml = buildTitleLinkHtml(sourcePage);
    const destLinkHtml = buildTitleLinkHtml(destPage);
    const message = new VueMessage({
      type: "notice",
      content: `Moving ${sourceLinkHtml} to ${destLinkHtml}`,
      isHtml: true
    }).show();
    const request = {
      action: "move",
      from: sourcePage,
      to: destPage,
      reason: summary + spiHelperAdvert,
      noredirect: false,
      movesubpages: moveSubpages,
      ignoreWarnings
    };
    try {
      await api.postWithToken("csrf", request);
      message.update({
        type: "success",
        content: `Moved ${sourceLinkHtml} to ${destLinkHtml}`
      });
      finishOp(activeOpKey, "success" /* Success */);
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to move ${sourceLinkHtml} to ${destLinkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
      finishOp(activeOpKey, "failed" /* Failed */);
    }
  }
  async function spiHelperEditPage(opts) {
    const {
      title,
      newText,
      summary,
      createonly = false,
      watch,
      watchExpiry,
      baseRevId,
      sectionId
    } = opts;
    let activeOpKey = `edit_${title}`;
    if (sectionId) {
      activeOpKey += `_${sectionId}`;
    }
    startOp(activeOpKey);
    const linkHtml = buildTitleLinkHtml(title);
    const message = new VueMessage({
      type: "notice",
      content: "Editing " + linkHtml,
      isHtml: true
    }).show();
    const api = spiHelperGetAPI(title);
    const finalTitle = spiHelperStripXWikiPrefix(title);
    const request = {
      action: "edit",
      watchlist: watch,
      summary: summary + spiHelperAdvert,
      text: newText,
      title: finalTitle,
      createonly
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
      await api.postWithToken("csrf", request);
      message.update({ type: "success", content: "Saved " + linkHtml, isHtml: true });
      finishOp(activeOpKey, "success" /* Success */);
      return true;
    } catch (error) {
      message.update({
        type: "error",
        content: `Edit failed on ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
        isHtml: true
      });
      console.error(error);
      finishOp(activeOpKey, "failed" /* Failed */);
      return false;
    }
  }
  async function spiHelperGetPageText(title, show, sectionId) {
    const linkHtml = buildTitleLinkHtml(title);
    const message = new VueMessage({ type: "notice", content: "Getting page " + linkHtml, isHtml: true });
    if (show) {
      message.show();
    }
    const finalTitle = spiHelperStripXWikiPrefix(title);
    const request = {
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      titles: finalTitle,
      formatversion: "2"
    };
    if (sectionId) {
      request.rvsection = sectionId.toString();
    }
    try {
      const response = await spiHelperGetAPI(title).get(request);
      const targetPage = response.query.pages[0];
      if (!targetPage || "missing" in targetPage) {
        if (show) {
          message.update({ type: "warning", content: `Page ${linkHtml} does not exist`, isHtml: true });
        }
        return "";
      }
      const latestRevision = targetPage.revisions?.[0];
      if (!latestRevision) {
        return "";
      }
      if (show) {
        message.update({ type: "success", content: `Got ${linkHtml}`, isHtml: true });
      }
      return latestRevision.slots.main.content;
    } catch (error) {
      if (show) {
        message.update({
          type: "error",
          content: `Failed to get ${linkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
          isHtml: true
        });
      }
      return "";
    }
  }
  async function spiHelperGetPageRev(title) {
    const finalTitle = spiHelperStripXWikiPrefix(title);
    const request = {
      action: "query",
      prop: "revisions",
      rvslots: "main",
      rvprop: "ids",
      titles: finalTitle,
      formatversion: "2"
    };
    try {
      const response = await spiHelperGetAPI(title).get(request);
      const targetPage = response.query.pages[0];
      if (!targetPage || "missing" in targetPage) {
        return 0;
      }
      const latestRevision = targetPage.revisions?.[0];
      if (!latestRevision) {
        return 0;
      }
      return latestRevision.revid;
    } catch {
      return 0;
    }
  }
  async function spiHelperGetPostExpandSize(title, sectionId) {
    const finalTitle = spiHelperStripXWikiPrefix(title);
    const request = {
      action: "parse",
      prop: "limitreportdata",
      page: finalTitle
    };
    if (sectionId) {
      request.section = sectionId.toString();
    }
    const api = spiHelperGetAPI(title);
    try {
      const response = await api.get(request);
      return Number(response.parse?.limitreportdata.find((item) => item.name === "limitreport-postexpandincludesize")?.["0"] ?? 0);
    } catch {}
    return 0;
  }
  async function spiHelperParseWikitext(wikitext) {
    const api = spiHelperGetAPI();
    const request = {
      action: "parse",
      prop: "text",
      text: wikitext,
      wrapoutputclass: "",
      disablelimitreport: true,
      disableeditsection: true,
      contentmodel: "wikitext"
    };
    try {
      const response = await api.get(request);
      return response.parse?.text["*"] ?? "";
    } catch {
      return "";
    }
  }
  var userAgent = `MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${"3.0.0-beta.3"}`;
  var APIs = {
    meta: new mw.ForeignApi("https://meta.wikimedia.org/w/api.php", { userAgent }),
    local: new mw.Api({ userAgent })
  };
  function spiHelperGetAPI(title) {
    if (title && (title.startsWith("m:") || title.startsWith("meta:"))) {
      return APIs.meta;
    } else {
      return APIs.local;
    }
  }

  // src/context.ts
  class SpiPageContext {
    pageName;
    prefixedName;
    caseName;
    userName;
    archiveName;
    isArchive;
    startingRevId;
    _text = null;
    constructor(pageName, currentPage = false) {
      this.pageName = pageName;
      this.prefixedName = spiHelperGetInterwikiPrefix() + pageName;
      this.isArchive = /Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(pageName);
      this.caseName = extractCaseName(pageName, this.isArchive);
      this.userName = spiHelperNormalizeUsername(this.caseName);
      this.archiveName = pageName + "/Archive";
      if (currentPage) {
        this.startingRevId = mw.config.get("wgCurRevisionId");
      } else {
        this.startingRevId = 0;
      }
    }
    async refreshRevId() {
      this.startingRevId = await spiHelperGetPageRev(this.pageName);
    }
    async getText(opts = {}) {
      const { purge = false, show = false } = opts;
      if (purge || this._text === null) {
        this._text = await spiHelperGetPageText(this.pageName, show);
      }
      return this._text;
    }
    async edit(opts) {
      return spiHelperEditPage({
        title: this.pageName,
        newText: opts.newText,
        summary: opts.summary,
        createonly: opts.createonly ?? false,
        watch: opts.watch,
        watchExpiry: opts.watchExpiry,
        baseRevId: opts.baseRevId,
        sectionId: opts.sectionId
      });
    }
  }
  function extractCaseName(pageName, isArchive) {
    const base = pageName.replace(/^Wikipedia:Sockpuppet investigations\//, "");
    return isArchive ? base.replace(/\/Archive.*/, "") : base;
  }
  function cleanPageName(pageName) {
    return pageName.replaceAll(/_/g, " ");
  }
  var rawPageName = mw.config.get("wgPageName");
  var pageName = cleanPageName(rawPageName);
  var context = new SpiPageContext(pageName, true);

  // src/state.ts
  class CaseState {
    sections;
    selectedSection;
    archiveNotice;
    _text = null;
    _loadingPromise = null;
    constructor(sections = [], selectedSection = null, archiveNotice = null) {
      this.sections = sections;
      if (selectedSection) {
        this.selectedSection = { type: "specific", section: selectedSection };
      } else {
        this.selectedSection = null;
      }
      this.archiveNotice = archiveNotice;
    }
  }

  class SectionEntry {
    id;
    name;
    _text = null;
    _loadingPromise = null;
    constructor(id, name) {
      this.id = id;
      this.name = name;
    }
  }
  async function loadCaseText(state, opts = {}) {
    const { purge = false, show = false } = opts;
    if (state._loadingPromise) {
      return state._loadingPromise;
    }
    if (state._text !== null && !purge) {
      return state._text;
    }
    state._loadingPromise = spiHelperGetPageText(context.pageName, show);
    state._text = await state._loadingPromise;
    state._loadingPromise = null;
    return state._text;
  }
  async function refreshSections(state) {
    state.sections = await spiHelperGetInvestigationSectionIDs(context.pageName);
  }
  async function loadSectionText(section, opts = {}) {
    const { purge = false, show = false } = opts;
    if (section._loadingPromise) {
      return section._loadingPromise;
    }
    if (section._text !== null && !purge) {
      return section._text;
    }
    section._loadingPromise = spiHelperGetPageText(context.pageName, show, section.id);
    section._text = await section._loadingPromise;
    section._loadingPromise = null;
    return section._text;
  }

  // node_modules/vue/dist/vue.runtime.esm-bundler.js
  var defineComponent = (c) => c;

  // src/types/vue.ts
  var WatchOptionsSelect = [
    { label: "Follow preferences", value: "preferences" },
    { label: "No change", value: "nochange" },
    { label: "Watch", value: "watch" },
    { label: "Unwatch", value: "unwatch" }
  ];
  var WatchOptions = ["preferences", "watch", "nochange", "unwatch"];
  var DefaultSockRow = {
    username: "",
    block: false,
    duration: "",
    acb: true,
    abao: true,
    ntp: false,
    nem: false,
    tag: "none",
    altmaster: "none",
    lock: false
  };
  var DefaultLinkRow = {
    username: "",
    analyser: false,
    timeline: false,
    timecard: false,
    pages: false,
    summary: false,
    cuwiki: false
  };

  // src/ui/views/options/watchSetting.ts
  var WatchSettingComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      label: { type: String, required: true },
      resetTrigger: { type: Number, default: 0 }
    },
    data() {
      return {
        internalValue: this.modelValue,
        watchOptions: WatchOptionsSelect,
        messages: { error: "Watch option is invalid" }
      };
    },
    computed: {
      status() {
        return WatchOptions.includes(this.internalValue) ? "default" : "error";
      }
    },
    watch: {
      resetTrigger() {
        this.internalValue = this.modelValue;
      },
      internalValue(newValue) {
        this.$emit("update:modelValue", newValue);
      }
    },
    template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="internalValue"
      />
    </cdx-field>
  `
  });
  // src/ui/views/options/expirySetting.ts
  var ExpirySettingComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      label: { type: String, required: true },
      resetTrigger: { type: Number, default: 0 }
    },
    data() {
      return {
        internalValue: this.modelValue,
        touched: false,
        isResetting: false
      };
    },
    watch: {
      resetTrigger() {
        this.isResetting = true;
        this.internalValue = this.modelValue;
        this.touched = false;
        this.$nextTick(() => {
          this.isResetting = false;
        });
      },
      internalValue(newValue) {
        if (!this.isResetting) {
          this.touched = true;
        }
        if (parseExpiry(newValue) !== null) {
          this.$emit("update:modelValue", newValue);
        }
      }
    },
    template: `
    <expiry-input :label="label" :touched="touched" v-model="internalValue" />
  `
  });
  // src/ui/views/options/logPageSetting.ts
  var LogPageSettingComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      prefix: { type: String, required: true }
    },
    data() {
      return {
        inputValue: this.modelValue,
        messages: { error: "Page name is invalid" },
        resetValue: "spihelper_log"
      };
    },
    computed: {
      valid() {
        return this.inputValue.length > 0 && mw.Title.newFromText(this.prefix + this.inputValue) !== null;
      },
      status() {
        return this.valid ? "default" : "error";
      }
    },
    watch: {
      inputValue(newValue) {
        if (this.valid) {
          this.$emit("update:modelValue", newValue);
        }
      }
    },
    methods: {
      resetInput() {
        this.inputValue = this.resetValue;
      }
    },
    template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>Page</template>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-family: monospace; color: #666">{{ this.prefix }}</span>
        <cdx-text-input v-model="inputValue" style="flex-grow: 1;"/>
      </div>
      <cdx-button @click="resetInput">
        Reset
      </cdx-button>
      <template #description>Page in your userspace to log to</template>
    </cdx-field>
  `
  });
  // src/options/utils.ts
  async function spiHelperValidateDate(dateInStringFormat) {
    const response = await spiHelperParseWikitext("{{#time:r|" + dateInStringFormat + "}}");
    return !response.includes("Error: Invalid time.");
  }
  function getFullLogPage(logPage) {
    return `User:${mw.config.get("wgUserName")}/${logPage}`;
  }

  // src/options/migration.ts
  var migrationMap = [
    { oldPath: "watchCase", newPath: ["watch", "case"], type: "WatchOption" },
    { oldPath: "watchArchive", newPath: ["watch", "archive"], type: "WatchOption" },
    { oldPath: "watchTaggedUser", newPath: ["watch", "tagged"], type: "WatchOption" },
    { oldPath: "watchNewCats", newPath: ["watch", "categories"], type: "WatchOption" },
    { oldPath: "watchBlockedUser", newPath: ["watch", "blocked"], type: "boolean" },
    { oldPath: "watchCaseExpiry", newPath: ["expiry", "case"], type: "expiry" },
    { oldPath: "watchArchiveExpiry", newPath: ["expiry", "archive"], type: "expiry" },
    { oldPath: "watchTaggedUserExpiry", newPath: ["expiry", "tagged"], type: "expiry" },
    { oldPath: "watchNewCatsExpiry", newPath: ["expiry", "categories"], type: "expiry" },
    { oldPath: "watchBlockedUserExpiry", newPath: ["expiry", "blocked"], type: "expiry" },
    { oldPath: "clerk", newPath: ["clerk"], type: "boolean" },
    { oldPath: "log", newPath: ["log", "enabled"], type: "boolean" },
    { oldPath: "reversed_log", newPath: ["log", "reversed"], type: "boolean" },
    { oldPath: "iUnderstandSectionMoves", newPath: ["iUnderstandSectionMoves"], type: "boolean" },
    { oldPath: "tickArchiveWhenCaseClosed", newPath: ["tickArchiveWhenCaseClosed"], type: "boolean" },
    { oldPath: "useCheckuserblockAccount", newPath: ["useCheckuserblockAccount"], type: "boolean" },
    { oldPath: "displayIPv6As64", newPath: ["interface", "displayIPv6As64"], type: "boolean" },
    { oldPath: "debugForceCheckuserState", newPath: ["debug", "forceCheckuser"], type: "boolean" },
    { oldPath: "debugForceAdminState", newPath: ["debug", "forceAdmin"], type: "boolean" }
  ];
  function setNestedValue(obj, path, value) {
    let current = obj;
    for (let i = 0;i < path.length - 1; i++) {
      if (!path[i]) {
        throw new Error(`Path segment "${path.join(".")}" is invalid`);
      }
      const key = path[i];
      const next = current[key];
      if (next === null || typeof next !== "object") {
        throw new Error(`Path segment "${path[i]}" is not an object`);
      }
      current = next;
    }
    const lastKey = path[path.length - 1];
    current[lastKey] = value;
  }
  async function migrateSettings(oldSettings) {
    const tasks = migrationMap.map(async ({ oldPath, newPath, type }) => {
      const value = oldSettings[oldPath];
      if (value === undefined) {
        return;
      }
      const isValid = await validateSetting(value, type);
      if (isValid) {
        setNestedValue(spiHelperSettings, newPath, value);
      }
    });
    await Promise.all(tasks);
  }
  async function validateSetting(value, type) {
    switch (type) {
      case "boolean":
        return typeof value === "boolean";
      case "WatchOption":
        return typeof value === "string" && ["preferences", "watch", "nochange", "unwatch"].includes(value);
      case "expiry":
        return typeof value === "string" && spiHelperValidateDate(value);
    }
  }

  // src/options/options.ts
  var spiHelperSettings = structuredClone(spiHelperDefaultSettings);
  var saveKey = "userjs-spihelper";
  function saveOptions() {
    return spiHelperGetAPI().saveOption(saveKey, JSON.stringify(spiHelperSettings));
  }
  function loadOptions() {
    const rawData = String(mw.user.options.get(saveKey));
    try {
      return rawData ? JSON.parse(rawData) : null;
    } catch (e) {
      console.warn("Failed to parse saved options", e);
      return null;
    }
  }
  async function migrateOptions() {
    mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "migrate" });
    try {
      await mw.loader.getScript("/w/index.php?title=Special:MyPage/spihelper-options.js&action=raw&ctype=text/javascript");
      if (spiHelperCustomOpts !== undefined) {
        await migrateSettings(spiHelperCustomOpts);
      }
    } catch (error) {
      mw.notify("Error retrieving your spihelper-options.js", { type: "error" });
      console.error("Error getting local spihelper-options.js: ", error);
    }
  }
  // src/role.ts
  function spiHelperIsCheckuser(allowDebug = true) {
    if (allowDebug && spiHelperSettings.debug.enabled) {
      return spiHelperSettings.debug.forceCheckuser;
    }
    return mw.config.get("wgUserGroups")?.includes("checkuser") ?? false;
  }
  function spiHelperIsClerk() {
    return spiHelperSettings.clerk || spiHelperIsCheckuser();
  }
  function spiHelperIsAdmin() {
    if (spiHelperSettings.debug.enabled) {
      return spiHelperSettings.debug.forceAdmin;
    }
    return mw.config.get("wgUserGroups")?.includes("sysop") ?? false;
  }

  // node_modules/@wikimedia/codex-icons/dist/codex-icons.js
  var M = '<path d="M11 9V4H9v5H4v2h5v5h2v-5h5V9z"/>';
  var r1 = '<path d="M10 0a10 10 0 1010 10A10 10 0 0010 0m2.5 14.5L9 11V4h2v6l3 3z"/>';
  var z1 = '<path d="m4.34 2.93 12.73 12.73-1.41 1.41L2.93 4.35z"/><path d="M17.07 4.34 4.34 17.07l-1.41-1.41L15.66 2.93z"/>';
  var i1 = '<path id="cdx-icon-code-a" d="M1 10.08V8.92h1.15c1.15 0 1.15 0 1.15-1.15V5a7.4 7.4 0 01.09-1.3 2 2 0 01.3-.7 1.84 1.84 0 01.93-.68A6.4 6.4 0 016.74 2h1.18v1.15h-.86A1.32 1.32 0 006 3.62a1.7 1.7 0 00-.36 1.23V7a3.2 3.2 0 01-.28 1.72 2 2 0 01-1.26.77 2.15 2.15 0 011.26.79A3.26 3.26 0 015.62 12v3.15A1.67 1.67 0 006 16.37a1.31 1.31 0 001.08.47h.87V18H6.74a6.3 6.3 0 01-2.12-.29 1.82 1.82 0 01-.93-.71 1.9 1.9 0 01-.3-.72A7.5 7.5 0 013.31 15v-3.77c0-1.15 0-1.15-1.15-1.15zm18 0V8.92h-1.15c-1.15 0-1.15 0-1.15-1.15V5a7.4 7.4 0 00-.08-1.32 2 2 0 00-.3-.73 1.84 1.84 0 00-.93-.68A6.4 6.4 0 0013.26 2h-1.18v1.15h.87a1.32 1.32 0 011.05.47 1.7 1.7 0 01.36 1.23V7a3.2 3.2 0 00.28 1.72 2 2 0 001.26.77 2.15 2.15 0 00-1.26.79 3.26 3.26 0 00-.26 1.72v3.15a1.67 1.67 0 01-.38 1.22 1.31 1.31 0 01-1.08.47h-.87V18h1.19a6.3 6.3 0 002.12-.29 1.82 1.82 0 00.93-.68 1.9 1.9 0 00.3-.72 7.5 7.5 0 00.1-1.31v-3.77c0-1.15 0-1.15 1.15-1.15z"/><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#cdx-icon-code-a" transform="matrix(-1 0 0 1 20 0)"/>';
  var p1 = '<path d="m2.5 15.25 7.5-7.5 7.5 7.5 1.5-1.5-9-9-9 9z"/>';
  var M1 = '<path d="M3 3h8v2h2V3c0-1.1-.895-2-2-2H3c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h2v-2H3z"/><path d="M9 9h8v8H9zm0-2c-1.1 0-2 .895-2 2v8c0 1.1.895 2 2 2h8c1.1 0 2-.895 2-2V9c0-1.1-.895-2-2-2z"/>';
  var I1 = '<path d="M17 12v5H3v-5H1v5a2 2 0 002 2h14a2 2 0 002-2v-5z"/><path d="M15 9h-4V1H9v8H5l5 6z"/>';
  var q1 = '<path d="m17.5 4.75-7.5 7.5-7.5-7.5L1 6.25l9 9 9-9z"/>';
  var Z1 = '<path d="M19 16 2 12a3.83 3.83 0 01-1-2.5A3.83 3.83 0 012 7l17-4z"/><rect width="4" height="8" x="4" y="9" rx="2"/>';
  var A0 = '<path d="M2 18.5A1.5 1.5 0 003.5 20H5V0H3.5A1.5 1.5 0 002 1.5zM6 0v20h10a2 2 0 002-2V2a2 2 0 00-2-2zm7 8H8V7h5zm3-2H8V5h8z"/>';
  var B2 = '<path d="M13 15v2a3 3 0 01-3 3 10 10 0 1110-10 5 5 0 01-5 5ZM3 8.5a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3-4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0m3 4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0"/>';
  var E2 = '<path d="M13 8V2a2 2 0 002-2H5a2 2 0 002 2v6H6a2 2 0 00-2 2v1h5v5l1 4 1-4v-5h5v-1a2 2 0 00-2-2z"/>';
  var _2 = '<path d="M15.65 4.35A8 8 0 1017.4 13h-2.22a6 6 0 11-1-7.22L11 9h7V2z"/>';
  var N5 = '<path d="M17 2h-3.5l-1-1h-5l-1 1H3v2h14zM4 17a2 2 0 002 2h8a2 2 0 002-2V5H4z"/>';
  var $5 = '<path d="m6.4 17-1.26-1.25 2.32-2.25H1v-1.75h6.46L5.14 9.5 6.4 8.25l4.5 4.38zm7.2-5.25L9.1 7.37 13.6 3l1.26 1.25-2.32 2.25H19v1.75h-6.46l2.32 2.25z"/>';
  var V3 = '<path d="M1 3h16v2H1Zm0 6h6v2H1Zm0 6h8v2H1Zm8-4.24h3.85L14.5 7l1.65 3.76H20l-3 3.17.9 4.05-3.4-2.14L11.1 18l.9-4.05Z"/>';
  var k3 = M;
  var d4 = r1;
  var e4 = z1;
  var r4 = i1;
  var z4 = p1;
  var p4 = {
    ltr: M1,
    shouldFlip: true
  };
  var u4 = I1;
  var f4 = q1;
  var q4 = {
    ltr: Z1,
    shouldFlip: true
  };
  var z6 = {
    ltr: A0,
    shouldFlip: true
  };
  var u7 = {
    ltr: B2,
    shouldFlip: true
  };
  var y7 = E2;
  var U7 = _2;
  var F8 = N5;
  var T8 = {
    ltr: $5,
    shouldFlip: true
  };
  var t9 = {
    ltr: V3,
    shouldFlip: true
  };

  // src/ui/views/options/modal.ts
  var OptionsComponent = defineComponent({
    props: {
      feedbackDialog: { type: Object, required: true },
      openButton: { type: Object, required: true }
    },
    data: function() {
      const username = mw.config.get("wgUserName") ?? "";
      const logPrefix = `User:${username}/`;
      return {
        open: false,
        _openHandler: null,
        showExtra: spiHelperSettings.debug.enabled || spiHelperSettings.iUnderstandSectionMoves,
        showExtraMessage: false,
        _showExtraHandler: null,
        logPrefix,
        cdxIconWatchlist: t9,
        cdxIconClock: d4,
        cdxIconClose: e4,
        cdxIconCode: r4,
        cdxIconFeedback: q4,
        cdxIconJournal: z6,
        cdxIconPalette: u7,
        cdxIconReload: U7,
        spiHelperSettings,
        resetTrigger: 0
      };
    },
    computed: {
      logPage() {
        return `${mw.config.get("wgServer")}/wiki/${getFullLogPage(spiHelperSettings.log.page)}`;
      },
      isCheckUser() {
        const { debug } = this.spiHelperSettings;
        const isCU = mw.config.get("wgUserGroups")?.includes("checkuser") ?? false;
        return isCU || debug.enabled && debug.forceCheckuser;
      }
    },
    template: `
    <cdx-dialog v-model:open="open" title="spiHelper Options" id="spiHelper-opts-dialog" close-button-label="Close">
      <template #header>
        <div class="cdx-dialog__header__title-group">
          <h2 class="cdx-dialog__header__title">
            spiHelper Options
          </h2>
        </div>
        <div>
          <cdx-button weight="quiet" type="button" aria-label="Give feedback" @click="feedbackDialog.launch()">
            <cdx-icon :icon="cdxIconFeedback" />
          </cdx-button>
          <cdx-button
              class="cdx-dialog__header__close-button"
              weight="quiet"
              type="button"
              aria-label="Close"
              @click="open = false"
          >
            <cdx-icon :icon="cdxIconClose" />
          </cdx-button>
        </div>
      </template>
      <p>Configure your spiHelper options</p>
      <cdx-message v-if="showExtraMessage" type="success" :fade-in="true" :auto-dismiss="true" :display-time="3000">
        I trust that you understand section moves
      </cdx-message>
      <cdx-accordion :action-icon="cdxIconWatchlist" :action-always-visible="true">
        <template #title>Watch</template>
        <watch-setting label="Cases" v-model="spiHelperSettings.watch.case" :reset-trigger="resetTrigger" />
        <watch-setting label="Archives" v-model="spiHelperSettings.watch.archive" :reset-trigger="resetTrigger" />
        <watch-setting label="Tagged Users" v-model="spiHelperSettings.watch.tagged" :reset-trigger="resetTrigger" />
        <watch-setting label="Categories" v-model="spiHelperSettings.watch.categories" :reset-trigger="resetTrigger" />
        <cdx-field>
          <template #label>Blocked Users</template>
          <cdx-toggle-switch v-model="spiHelperSettings.watch.blocked" />
          <template #help-text>Due to API limitations, only a toggle is available</template>
        </cdx-field>
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconClock" :action-always-visible="true">
        <template #title>Expiry</template>
        <p>
          Expiry values may be relative (e.g. 5 months or 2 weeks) or absolute (e.g. 2014-09-18T12:34:56Z). For no
          expiry, use infinite, indefinite, infinity or never.
        </p>
        <expiry-setting label="Cases" v-model="spiHelperSettings.expiry.case" :reset-trigger="resetTrigger" />
        <expiry-setting label="Archives" v-model="spiHelperSettings.expiry.archive" :reset-trigger="resetTrigger" />
        <expiry-setting label="Tagged Users" v-model="spiHelperSettings.expiry.tagged" :reset-trigger="resetTrigger" />
        <expiry-setting label="Categories" v-model="spiHelperSettings.expiry.categories"
                        :reset-trigger="resetTrigger" />
        <expiry-setting label="Blocked Users" v-model="spiHelperSettings.expiry.blocked"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconJournal" :action-always-visible="true">
        <template #title>Log</template>
        <cdx-toggle-switch v-model="spiHelperSettings.log.enabled">
          Enabled
          <template #description>Log all actions to your userspace</template>
        </cdx-toggle-switch>
        <div v-if="spiHelperSettings.log.enabled">
          <log-page-setting v-model="spiHelperSettings.log.page" :prefix="logPrefix" />
          <br>
          <cdx-toggle-switch v-model="spiHelperSettings.log.reversed">
            Reverse log
            <template #description>Reverse said log, so that the newest actions are at the top</template>
          </cdx-toggle-switch>
          <p style="word-wrap: anywhere">
            Logging to [[<a :href="logPage">{{ logPrefix + spiHelperSettings.log.page }}</a>]]
          </p>
        </div>
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconPalette" :action-always-visible="true">
        <template #title>Interface</template>
        <cdx-toggle-switch v-model="spiHelperSettings.interface.displayIPv6As64" :align-switch="true">
          Display IPv6 as /64
          <template #description>Default IPv6 listings to /64 in the block/tag socks menu</template>
        </cdx-toggle-switch>
        <expiry-setting label="Default block duration" v-model="spiHelperSettings.interface.defaultBlockDuration" :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconCode" :action-always-visible="true" v-if="showExtra">
        <template #title>Debug</template>
        <cdx-toggle-switch v-model="spiHelperSettings.debug.enabled" :align-switch="true">
          Enabled
        </cdx-toggle-switch>
        <cdx-field v-if="spiHelperSettings.debug.enabled">
          <template #description>These will override your roles. For example, if you are an administrator and force
            admin is unchecked, spiHelper will not consider you as an admninistrator.
          </template>
          <cdx-toggle-switch v-model="spiHelperSettings.debug.forceCheckuser" :align-switch="true">
            Force CheckUser state
          </cdx-toggle-switch>
          <cdx-toggle-switch v-model="spiHelperSettings.debug.forceAdmin" :align-switch="true">
            Force Admin state
          </cdx-toggle-switch>
        </cdx-field>
      </cdx-accordion>
      <div class="spiHelper-setting">
        <cdx-toggle-switch v-model="spiHelperSettings.clerk" :align-switch="true">Clerk</cdx-toggle-switch>
        <cdx-toggle-switch v-model="spiHelperSettings.tickArchiveWhenCaseClosed" :align-switch="true">
          Archive closed by default
          <template #description>If the case is closed, enable archival by default</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-if="isCheckUser" v-model="spiHelperSettings.useCheckuserblockAccount" :align-switch="true">
          <span v-pre>Use {{<a href="//en.wikipedia.org/wiki/Template:Checkuserblock-account">checkuserblock-account</a>}} when CU blocking</span>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="spiHelperSettings.useLookup" :align-switch="true">
          Use lookups
          <template #description>Use the API to suggest autocompletions</template>
        </cdx-toggle-switch>
        <div v-if="showExtra">
          <cdx-toggle-switch v-model="spiHelperSettings.iUnderstandSectionMoves" :align-switch="true">
            I understand section moves
          </cdx-toggle-switch>
        </div>
        <br>
        <cdx-button @click="loadDefaults">
          Load defaults
          <cdx-icon :icon="cdxIconReload" />
        </cdx-button>
      </div>
    </cdx-dialog>
  `,
    methods: {
      loadDefaults() {
        this.spiHelperSettings = JSON.parse(JSON.stringify(spiHelperDefaultSettings));
        Object.assign(spiHelperSettings, spiHelperDefaultSettings);
        this.resetTrigger++;
      }
    },
    watch: {
      open(newVal) {
        if (newVal) {
          if (!this.showExtra && this._showExtraHandler) {
            window.addEventListener("keydown", this._showExtraHandler);
          }
        } else {
          saveOptions();
          if (this._showExtraHandler) {
            window.removeEventListener("keydown", this._showExtraHandler);
          }
        }
      }
    },
    mounted() {
      this._openHandler = () => {
        this.open = true;
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "options" });
      };
      this.openButton.addEventListener("click", this._openHandler);
      //! Use the Konami code to unlock section moves
      const konami = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight"
      ];
      let i = 0;
      this._showExtraHandler = (e) => {
        if (e.key === konami[i]) {
          i++;
          if (i === konami.length) {
            this.showExtra = true;
            this.showExtraMessage = true;
            if (this._showExtraHandler) {
              window.removeEventListener("keydown", this._showExtraHandler);
            }
            i = 0;
          }
        } else {
          i = 0;
        }
      };
    },
    beforeUnmount() {
      if (this._openHandler) {
        this.openButton.removeEventListener("click", this._openHandler);
      }
    }
  });

  // src/ui/views/top/utils/setup.ts
  function getActionButtons() {
    return {
      sections: {
        label: "Sections",
        selectionType: "both"
      },
      comment: {
        label: "Comment",
        selectionType: "section"
      },
      status: {
        label: "Case Status",
        selectionType: "section"
      },
      block: {
        label: spiHelperIsAdmin() ? "Block/Tag Socks" : "Tag Socks",
        selectionType: "both"
      },
      link: {
        label: "Generate Links",
        selectionType: "both"
      },
      management: {
        label: "SPI Management",
        selectionType: "case"
      },
      move: {
        label: {
          case: "Move/Merge Full Case",
          section: "Move Section"
        },
        selectionType: "both"
      },
      archive: {
        label: {
          case: "Archive Closed",
          section: "Archive"
        },
        selectionType: "both"
      }
    };
  }
  function getInitialCaseActions() {
    return {
      sections: {
        enabled: true,
        data: {
          section: null
        }
      },
      comment: {
        enabled: false,
        data: {
          text: "* "
        }
      },
      status: {
        enabled: false,
        data: {
          old: "",
          new: "nochange"
        }
      },
      block: {
        enabled: false,
        data: {
          options: {
            noBlock: false,
            override: false,
            tagUnattached: true,
            cuBlock: false,
            cuBlockOnly: false,
            addMasterNotice: true,
            addSockNotice: true,
            blankTalk: false,
            lockHideNames: false
          },
          accounts: [],
          userlocks: new Map,
          master: context.caseName,
          altmaster: context.caseName,
          lockcomment: ""
        }
      },
      link: {
        enabled: false,
        data: {
          rows: []
        }
      },
      management: {
        enabled: false,
        data: {
          flags: new Set
        }
      },
      move: {
        enabled: false,
        data: {
          target: ""
        }
      },
      archive: {
        enabled: false
      }
    };
  }
  var NonArchiveActions = new Set(["status", "management", "comment", "move", "archive"]);

  // src/ui/views/top/actionAccordion.ts
  var ActionAccordionComponent = defineComponent({
    props: {
      selection: { type: Object, required: true },
      name: { type: String, required: true },
      label: { type: [String, Object], required: true },
      selectionType: { type: String, required: true },
      displayedForms: { type: Array, required: true },
      actionEnabled: { type: Boolean, required: true }
    },
    emits: ["actionToggled"],
    data() {
      return {
        accordionModel: true
      };
    },
    computed: {
      allSelected() {
        return this.selection === "all";
      },
      showAccordion() {
        if (context.isArchive) {
          return !NonArchiveActions.has(this.name);
        }
        if (this.name === "sections")
          return true;
        if (this.selection === null)
          return false;
        if (this.selectionType === "both")
          return true;
        return this.selectionType === "case" === this.allSelected;
      },
      text() {
        if (typeof this.label === "string") {
          return this.label;
        }
        if (this.selectionType === "both") {
          return this.allSelected ? this.label.case : this.label.section;
        }
        return "Unexpected configuration";
      },
      showEnabledClass() {
        return this.name !== "sections" && this.actionEnabled;
      }
    },
    template: `
    <cdx-accordion
        v-if="showAccordion"
        :name="name"
        :model-value="this.displayedForms.includes(name)"
        @click.prevent="$emit('actionToggled')"
        :class="{'action-enabled': showEnabledClass}"
    >
      <template #title>{{ text }}</template>
      <slot />
    </cdx-accordion>
  `
  });
  // src/ui/views/top/actionButton.ts
  var ActionButtonComponent = defineComponent({
    props: {
      selection: { type: Object, required: true },
      name: { type: String, required: true },
      label: { type: [String, Object], required: true },
      selectionType: { type: String, required: true },
      displayedForms: { type: Array, required: true },
      actionEnabled: { type: Boolean, required: true }
    },
    computed: {
      buttonEnabled() {
        return this.displayedForms.includes(this.name) || this.actionEnabled;
      },
      allSelected() {
        return this.selection === "all";
      },
      showButton() {
        if (context.isArchive) {
          return !NonArchiveActions.has(this.name);
        }
        if (this.name === "sections")
          return true;
        if (this.selection === null)
          return false;
        if (this.selectionType === "both")
          return true;
        return this.selectionType === "case" === this.allSelected;
      },
      buttonAction() {
        return this.buttonEnabled ? "progressive" : "normal";
      },
      buttonStyle() {
        return {
          opacity: this.buttonEnabled ? 1 : 0.7,
          color: this.displayedForms.includes(this.name) ? "var(--color-base)" : ""
        };
      },
      text() {
        if (typeof this.label === "string") {
          return this.label;
        }
        if (this.selectionType === "both") {
          return this.allSelected ? this.label.case : this.label.section;
        }
        return "Unexpected configuration";
      }
    },
    template: `
    <cdx-button
        v-if="showButton"
        :name="name"
        :action="buttonAction"
        :style="buttonStyle"
    >
      {{ text }}
    </cdx-button>
  `
  });
  // src/ui/views/top/actionContainer.ts
  var ActionContainerComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      empty: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false }
    },
    emits: ["update:enabled"],
    template: `
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="enabled && !empty">
      <slot />
    </div>
  `
  });
  // src/ui/views/userLookup.ts
  var ITEM_LIMIT = 10;
  function HandleUserSelected(data, row) {
    if (data.blockid !== undefined) {
      row.block = true;
    }
    if (data.blocknocreate !== undefined) {
      row.acb = data.blocknocreate;
    }
    if (data.blockemail !== undefined) {
      row.nem = data.blockemail;
    }
    if (mw.util.isIPAddress(data.name) && data.blockanononly !== undefined) {
      row.abao = data.blockanononly;
    }
    if (data.blockowntalk !== undefined) {
      row.ntp = data.blockowntalk;
    }
    if (data.blockexpiry) {
      row.duration = data.blockexpiry;
    }
  }
  var UserLookupComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      label: { type: String, required: false }
    },
    emits: ["update:modelValue", "user-selected"],
    data() {
      const menuConfig = {
        visibleItemLimit: 6,
        searchQuery: ""
      };
      const messages2 = {
        success: "Valid user",
        warning: "User not found"
      };
      return {
        lookupStatus: "default",
        messages: messages2,
        selection: null,
        userSuggestions: [],
        menuConfig,
        useLookup: spiHelperSettings.useLookup
      };
    },
    template: `
    <cdx-field :status="lookupStatus" :messages="messages" :hide-label="!label">
      <cdx-lookup
          v-if="useLookup"
          v-model:selected="selection"
          v-model:input-value="username"
          :menu-items="userSuggestions"
          :menu-config="menuConfig"
          placeholder="Sock"
          @update:input-value="onUpdateInputValue"
          @load-more="onLoadMore"
          @focus="onLoadMore"
          @update:selected="onSelection"
          @blur="validateInstantly"
          @keydown.enter="validateInstantly"
          @clear="validateInstantly"
          clearable
          class="user-lookup"
      >
        <template #no-results>
          No users found
        </template>
      </cdx-lookup>
      <cdx-text-input v-else v-model="username" placeholder="Sock" clearable class="user-lookup" />
      <template v-if="label" #label>
        {{ label }}
      </template>
    </cdx-field>
  `,
    methods: {
      onUpdateInputValue(value) {
        this.menuConfig.searchQuery = value;
        if (!value) {
          this.userSuggestions = [];
          return;
        }
        spiHelperGetUsers(value, ITEM_LIMIT).then((users) => {
          if (this.username !== value) {
            return;
          }
          if (users.length === 0) {
            this.userSuggestions = [];
            return;
          }
          this.userSuggestions = users.map((user) => ({
            label: user.name,
            value: user.userid.toString(),
            customData: user
          }));
        }).catch(() => {
          this.userSuggestions = [];
        });
      },
      onLoadMore() {
        if (!this.username) {
          return;
        }
        spiHelperGetUsers(this.username, this.userSuggestions.length + ITEM_LIMIT).then((users) => {
          if (users.length === 0) {
            return;
          }
          this.userSuggestions = users.map((user) => ({
            label: user.name,
            value: user.userid.toString(),
            customData: user
          }));
        }, () => {});
      },
      async validateInstantly() {
        await this.$nextTick(() => {
          if (this.username.length === 0 || mw.util.isIPAddress(this.username)) {
            this.lookupStatus = "default";
            return;
          }
          const selection = this.userSuggestions.find((item) => item.label === this.username) ?? null;
          if (selection !== null) {
            this.$emit("user-selected", selection.customData);
            this.selection = selection.value;
          }
          this.lookupStatus = this.selection === null ? "warning" : "success";
        });
      },
      onSelection(newSelection) {
        if (newSelection !== null) {
          const selection = this.userSuggestions.find((item) => item.value === newSelection) ?? null;
          if (selection) {
            this.$emit("user-selected", selection.customData);
          }
          this.lookupStatus = "success";
        }
      }
    },
    computed: {
      username: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit("update:modelValue", value);
        }
      }
    }
  });

  // src/types/spi.ts
  class ParsedArchiveNotice {
    username;
    crosswiki;
    deny;
    notalk;
    moot;
    constructor(opts) {
      this.username = opts?.username ?? context.caseName;
      this.crosswiki = opts?.crosswiki ?? false;
      this.deny = opts?.deny ?? false;
      this.notalk = opts?.notalk ?? false;
      this.moot = opts?.moot ?? false;
    }
    generateWikitext() {
      let notice = "{{SPI archive notice|1=" + this.username;
      if (this.crosswiki) {
        notice += "|crosswiki=yes";
      }
      if (this.deny) {
        notice += "|deny=yes";
      }
      if (this.notalk) {
        notice += "|notalk=yes";
      }
      if (this.moot) {
        notice += "|moot=yes";
      }
      notice += "}}";
      return notice;
    }
  }

  // src/template.ts
  function parseTemplates(wikitext) {
    const templates = [];
    const matches = wikitext.trim().matchAll(/\{\{([\s\S]+?)}}/g);
    for (const match of matches) {
      if (!match[1]) {
        continue;
      }
      templates.push(parseTemplate(match[1]));
    }
    return templates;
  }
  function parseTemplate(templateText) {
    const parts = templateText.split("|").map((p) => p.trim());
    const name = parts.shift()?.toLowerCase() ?? "unknown";
    const params = {};
    const positional = [];
    for (const part of parts) {
      const eq = part.indexOf("=");
      if (eq !== -1) {
        const key = part.slice(0, eq).trim().toLowerCase();
        params[key] = part.slice(eq + 1).trim();
      } else if (part) {
        positional.push(part);
      }
    }
    return { name, params, positional };
  }
  function fetchTemplateArguments(template) {
    const result = [];
    for (const positional of template.positional) {
      result.push(positional);
    }
    for (const [key, value] of Object.entries(template.params)) {
      if (!Number.isNaN(Number(key))) {
        result.push(value);
      }
    }
    return result;
  }

  // src/archivenotice.ts
  async function spiHelperParseArchiveNotice(page, state) {
    let pageText;
    if (page === context.pageName && state) {
      pageText = await loadCaseText(state);
    } else {
      pageText = await spiHelperGetPageText(page, false);
    }
    const templates = parseTemplates(pageText);
    const archiveNoticeTemplate = templates.find((tl) => /SPI\s*archive notice/i.exec(tl.name));
    if (!archiveNoticeTemplate) {
      console.error("Missing archive notice");
      return null;
    }
    const username = archiveNoticeTemplate.positional[0] ?? archiveNoticeTemplate.params["1"];
    if (!username) {
      console.error("Invalid archive notice: Username missing");
      return null;
    }
    const flags = { deny: false, crosswiki: false, notalk: false, moot: false };
    for (const [key, val] of Object.entries(archiveNoticeTemplate.params)) {
      if (key === "1") {
        continue;
      }
      if (val !== "yes") {
        console.warn("Malformed archivenotice parameter", key, "=", val);
        continue;
      }
      if (key in flags) {
        flags[key] = true;
      } else {
        console.warn("Unrecognised archivenotice parameter", key, "=", val);
      }
    }
    return new ParsedArchiveNotice({ username, ...flags });
  }
  async function spiHelperAddArchiveNotice(state) {
    let pageText = await loadCaseText(state);
    if (spiHelperPriorCasesRegex.exec(pageText) === null) {
      pageText = `{{SPIpriorcases}}
` + pageText;
    }
    const archiveNotice = state.archiveNotice ?? new ParsedArchiveNotice({ username: context.caseName });
    const archiveNoticeText = archiveNotice.generateWikitext();
    const tocMatch = /(<noinclude>)?__TOC__(<\/noinclude>)?/.exec(pageText);
    if (tocMatch) {
      const tocEnd = tocMatch.index + tocMatch[0].length;
      pageText = pageText.slice(0, tocEnd) + `
` + archiveNoticeText + pageText.slice(tocEnd);
    } else {
      pageText = `<noinclude>__TOC__</noinclude>
` + archiveNoticeText + pageText;
    }
    await spiHelperEditPage({
      title: context.pageName,
      newText: pageText,
      summary: "Adding archive notice",
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
  }

  // src/ui/utils.ts
  function getSockEntries(opts) {
    const { text, fullSearch, state } = opts;
    const likelySocks = fullSearch ? [generateSockRow(context.caseName, state)] : [];
    const possibleSocks = [];
    const allUsernames = fullSearch ? new Set([context.caseName]) : new Set;
    if (fullSearch) {
      let $searchOrigin = $(document);
      if (state.selectedSection?.type === "specific") {
        $searchOrigin = $(`a[href$="section=${state.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");
      }
      const sockList = $searchOrigin.find(".cuEntry").find("a:first");
      for (const entryElement of sockList) {
        const username = spiHelperNormalizeUsername($(entryElement).text());
        if (allUsernames.has(username)) {
          continue;
        }
        likelySocks.push(generateSockRow(username, state));
        allUsernames.add(username);
      }
    }
    const isRelevantTemplate = (templateName) => {
      return /sock ?list/.exec(templateName) !== null || ["ip", "vandal", "user", "noping"].some((t) => templateName.includes(t));
    };
    const allTemplates = parseTemplates(text);
    for (const template of allTemplates) {
      if (isRelevantTemplate(template.name)) {
        const templateUsernames = fetchTemplateArguments(template);
        for (const templateUsername of templateUsernames) {
          const username = spiHelperNormalizeUsername(templateUsername);
          if (!allUsernames.has(username)) {
            possibleSocks.push(generateSockRow(username, state));
            allUsernames.add(username);
          }
        }
      }
    }
    return [likelySocks, possibleSocks, Array.from(allUsernames)];
  }
  function generateSockRow(username, state) {
    if (mw.util.isIPAddress(username, true)) {
      if (spiHelperSettings.interface.displayIPv6As64 && mw.util.isIPv6Address(username, false)) {
        return {
          ...getDefaultSockRow(state.archiveNotice),
          username: buildIPBlock(username)
        };
      } else {
        return { ...getDefaultSockRow(state.archiveNotice), username };
      }
    } else {
      return { ...getDefaultSockRow(state.archiveNotice), username };
    }
  }
  function buildIPBlock(fullIP) {
    if (!mw.util.isIPv6Address(fullIP, false)) {
      return fullIP;
    }
    return fullIP.split(":").slice(0, 4).concat("0", "0", "0", "0").join(":") + "/64";
  }
  function getDefaultSockRow(archiveNotice) {
    const newRow = { ...DefaultSockRow };
    if (archiveNotice) {
      if (archiveNotice.crosswiki) {
        newRow.lock = true;
      }
      if (archiveNotice.deny) {
        newRow.nem = true;
        newRow.ntp = true;
      }
    }
    newRow.duration = spiHelperSettings.interface.defaultBlockDuration;
    return newRow;
  }
  function updateSockRowSettings(opts) {
    const { row, currentBlock, currentTags, defaultBlock } = opts;
    if (currentBlock) {
      row.block = true;
      row.acb = currentBlock.acb;
      row.abao = currentBlock.abao;
      row.ntp = currentBlock.ntp;
      row.nem = currentBlock.nem;
      row.duration = currentBlock.duration;
    } else {
      row.block = defaultBlock;
      if (mw.util.isIPAddress(row.username, true)) {
        row.duration = "1 week";
      }
    }
    if (currentTags) {
      const templates = parseTemplates(currentTags);
      for (const template of templates) {
        if (["sockpuppeteer", "sockmaster"].includes(template.name)) {
          const firstParam = template.params["1"] ?? template.positional[0];
          if (firstParam === "banned") {
            row.tag = "Mbanned";
          } else if (firstParam === "blocked") {
            row.tag = template.params.checked?.toLowerCase() === "yes" ? "Mconfirmed" : "Mblocked";
          } else {
            console.warn("Unrecognised master status", firstParam, "for", row.username);
          }
        } else if (["sockpuppet", "sock"].includes(template.name)) {
          const blockParam = template.params["2"] ?? template.positional[1];
          switch (blockParam) {
            case "blocked":
              row.tag = "Ssuspected";
              break;
            case "proven":
              row.tag = "Sproven";
              break;
            case "confirmed":
            case "nbconfirmed":
            case "cuconfirmed":
              row.tag = "Sconfirmed";
              break;
            default:
              console.warn("Unrecognised sock status", blockParam, "for", row.username);
              break;
          }
          if (template.params.altmaster) {
            const altmasterStatus = template.params["altmaster-status"];
            switch (altmasterStatus) {
              case undefined:
                row.altmaster = "none";
                break;
              case "suspect":
              case "suspected":
                row.altmaster = "suspected";
                break;
              case "proven":
                row.altmaster = "proven";
                break;
              default:
                console.warn("Unrecognised altmaster status", altmasterStatus, "for", row.username);
            }
          }
        }
      }
    }
    return row;
  }
  var isMenuGroupData = (item) => ("items" in item);

  // src/ui/views/top/utils/archive.ts
  function getManagementFlagsFromArchiveNotice(archiveNotice) {
    const flags = new Set;
    if (archiveNotice === null) {
      return flags;
    }
    if (archiveNotice.deny) {
      flags.add("deny");
    }
    if (archiveNotice.moot) {
      flags.add("moot");
    }
    if (archiveNotice.notalk) {
      flags.add("notalk");
    }
    if (archiveNotice.crosswiki) {
      flags.add("crosswiki");
    }
    return flags;
  }
  // src/ui/views/top/utils/section.ts
  async function prefetchSockRowsForSelection(selection, state, userlocks) {
    if (!selection) {
      return [];
    }
    const searchText = await (selection.type === "all" ? loadCaseText(state) : loadSectionText(selection.section));
    const [likelySocks, possibleSocks, allUsernames] = getSockEntries({
      text: searchText,
      fullSearch: true,
      state
    });
    const likelySet = new Set(likelySocks);
    const validUsernames = allUsernames.filter((name) => !isNonRegisteredAccount(name)).map((name) => `User:${name}`);
    const [blockSettings, userPages] = await Promise.all([
      spiHelperGetBulkUserBlockSettings(allUsernames),
      spiHelperGetBulkPageText(validUsernames)
    ]);
    const userPromises = [...likelySocks, ...possibleSocks].map(async (sock) => {
      const blockSetting = blockSettings.get(sock.username);
      const userPage = userPages.get(`User:${sock.username}`);
      const row = updateSockRowSettings({
        row: sock,
        defaultBlock: likelySet.has(sock),
        currentBlock: blockSetting,
        currentTags: userPage
      });
      const globalUser = await spiHelperGetGlobalUser(row.username);
      if (globalUser) {
        const locked = globalUser.locked;
        userlocks.set(sock.username, locked);
        if (locked) {
          row.lock = true;
        } else if (!state.archiveNotice?.crosswiki) {
          row.lock = false;
        }
      }
      return row;
    });
    return await Promise.all(userPromises);
  }
  // src/ui/views/top/utils/status.ts
  function getStatusTemplate(status) {
    switch (status) {
      case "CUrequest":
        return "{{CURequest}}";
      case "admin":
        return "{{awaitingadmin}}";
      case "clerk":
        return "{{Clerk Request}}";
      case "selfendorse":
        return "{{Requestandendorse}}";
      case "inprogress":
        return "{{Inprogress}}";
      case "decline":
        return "{{Decline}}";
      case "cudecline":
        return "{{Cudecline}}";
      case "endorse":
        return "{{Endorse}}";
      case "cuendorse":
        return "{{cu-endorsed}}";
      case "moreinfo":
      case "cumoreinfo":
        return "{{moreinfo}}";
      case "relist":
        return "{{relisted}}";
      case "hold":
      case "cuhold":
        return "{{onhold}}";
      case "reopen":
        return "{{reopen}}";
      case "checked":
      case "closed":
        return null;
      default:
        console.warn("New case status", status, "is unexpected");
        return null;
    }
  }
  function updateCommentWithStatus(commentText, newStatus) {
    const newTemplate = getStatusTemplate(newStatus);
    if (newTemplate === null) {
      return commentText;
    }
    if (spiHelperClerkStatusRegex.test(commentText)) {
      let updatedText = commentText.replace(spiHelperClerkStatusRegex, newTemplate);
      if (!newTemplate) {
        updatedText = updatedText.replace(/^(\s*\*\s*)? [-–] /, "$1");
      }
      return updatedText;
    } else if (newTemplate) {
      return "* " + newTemplate + " – " + commentText.replace(/^\s*\*\s*/, "");
    }
    return commentText;
  }
  function normalizeCaseStatus(caseStatus) {
    if (spiHelperCaseClosedRegex.test(caseStatus))
      return "closed";
    if (/^open$/i.test(caseStatus))
      return "open";
    if (/^(?:inprogress|checking)$/i.test(caseStatus))
      return "inprogress";
    if (/^relist(ed)?$/i.test(caseStatus))
      return "relist";
    if (/^checked|completed$/i.test(caseStatus))
      return "checked";
    if (/^declined?$/i.test(caseStatus))
      return "decline";
    if (/^cudeclin(ed)?$/i.test(caseStatus))
      return "cudecline";
    if (/^endorsed?$/i.test(caseStatus))
      return "endorse";
    if (/^(?:CU|checkuser|CUrequest|request)$/i.test(caseStatus))
      return "CUrequest";
    if (/^cumoreinfo$/i.test(caseStatus))
      return "cumoreinfo";
    if (/^hold$/i.test(caseStatus))
      return "hold";
    if (/^cuhold$/i.test(caseStatus))
      return "cuhold";
    return "new";
  }
  // src/actions/log.ts
  async function spiHelperLog(logString) {
    const now = new Date;
    const dateString = now.toLocaleString("en", { month: "long" }) + " " + now.toLocaleString("en", { year: "numeric" });
    const dateHeader = "==\\s*" + dateString + "\\s*==";
    const dateHeaderRe = new RegExp(dateHeader, "i");
    const dateHeaderReWithAnyDate = /==.*?==/i;
    const logPage = getFullLogPage(spiHelperSettings.log.page);
    let logPageText = await spiHelperGetPageText(logPage, false);
    if (!logPageText.match(dateHeaderRe)) {
      if (spiHelperSettings.log.reversed) {
        const firstHeaderMatch = dateHeaderReWithAnyDate.exec(logPageText);
        if (firstHeaderMatch?.index) {
          logPageText = logPageText.slice(0, firstHeaderMatch.index) + "== " + dateString + ` ==
` + logPageText.slice(firstHeaderMatch.index);
        }
      } else {
        logPageText += `
== ` + dateString + " ==";
      }
    }
    if (spiHelperSettings.log.reversed) {
      const firstHeaderMatch = dateHeaderReWithAnyDate.exec(logPageText);
      if (firstHeaderMatch?.index) {
        logPageText = logPageText.slice(0, firstHeaderMatch.index + firstHeaderMatch[0].length) + `
` + logString + logPageText.slice(firstHeaderMatch.index + firstHeaderMatch[0].length);
      }
    } else {
      logPageText += `
` + logString;
    }
    await spiHelperEditPage({
      title: logPage,
      newText: logPageText,
      summary: "Logging spihelper edits",
      createonly: false,
      watch: "nochange"
    });
  }

  // src/actions/move.ts
  async function getNewProtection(oldTitle, newTitle, siteRestrictions) {
    const oldPageNameProtection = await spiHelperGetProtectionInformation(oldTitle);
    const newPageNameProtection = await spiHelperGetProtectionInformation(newTitle);
    const newProtectionValues = [];
    siteRestrictions.types.forEach((type) => {
      const oldPageNameEntry = oldPageNameProtection.find((dict) => dict.type === type);
      const newPageNameEntry = newPageNameProtection.find((dict) => dict.type === type);
      if (oldPageNameEntry && newPageNameEntry) {
        let expiry = newPageNameEntry.expiry;
        if (isAbsoluteExpiry(newPageNameEntry.expiry) || isAbsoluteExpiry(oldPageNameEntry.expiry)) {
          expiry = "infinite";
        } else if (newPageNameEntry.expiry < oldPageNameEntry.expiry) {
          expiry = oldPageNameEntry.expiry;
        }
        const oldPageNameEntryLevelIndex = siteRestrictions.levels.indexOf(oldPageNameEntry.level);
        const newPageNameEntryLevelIndex = siteRestrictions.levels.indexOf(newPageNameEntry.level);
        let level;
        if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
          console.error("Invalid protection information provided from API");
          return;
        } else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
          level = oldPageNameEntry.level;
        } else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
          level = newPageNameEntry.level;
        } else {
          return;
        }
        newProtectionValues.push({ type: oldPageNameEntry.type, expiry, level });
      } else if (oldPageNameEntry) {
        newProtectionValues.push(oldPageNameEntry);
      } else if (newPageNameEntry) {
        newProtectionValues.push(newPageNameEntry);
      }
    });
    return newProtectionValues;
  }
  async function getNewPendingChanges(oldTitle, newTitle, siteRestrictions) {
    const oldPageStabilisation = await spiHelperGetStabilisationSettings(oldTitle);
    const newPageStabilisation = await spiHelperGetStabilisationSettings(newTitle);
    let newStabilisationSettings = { level: "" };
    if (oldPageStabilisation && newPageStabilisation) {
      if (isAbsoluteExpiry(oldPageStabilisation.protection_expiry) || isAbsoluteExpiry(newPageStabilisation.protection_expiry)) {
        newStabilisationSettings.expiry = "infinite";
      } else if (newPageStabilisation.protection_expiry < oldPageStabilisation.protection_expiry) {
        newStabilisationSettings.expiry = oldPageStabilisation.protection_expiry;
      } else {
        newStabilisationSettings.expiry = newPageStabilisation.protection_expiry;
      }
      const oldPageNameEntryLevelIndex = siteRestrictions.levels.indexOf(oldPageStabilisation.protection_level);
      const newPageNameEntryLevelIndex = siteRestrictions.levels.indexOf(newPageStabilisation.protection_level);
      if (oldPageNameEntryLevelIndex === -1 || newPageNameEntryLevelIndex === -1) {
        console.error("Invalid protection information provided from API");
        return newStabilisationSettings;
      } else if (oldPageNameEntryLevelIndex > newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = oldPageStabilisation.protection_level;
      } else if (oldPageNameEntryLevelIndex <= newPageNameEntryLevelIndex) {
        newStabilisationSettings.level = newPageStabilisation.protection_level;
      }
    } else if (oldPageStabilisation) {
      newStabilisationSettings = {
        level: oldPageStabilisation.protection_level,
        expiry: oldPageStabilisation.protection_expiry
      };
    } else if (newPageStabilisation) {
      newStabilisationSettings = {
        level: newPageStabilisation.protection_level,
        expiry: newPageStabilisation.protection_expiry
      };
    }
    return newStabilisationSettings;
  }
  async function spiHelperMoveCase(target, archiveNotice) {
    const oldContext = context;
    const newContext = new SpiPageContext(context.pageName.replace(context.caseName, target));
    const targetPageText = await newContext.getText();
    if (targetPageText) {
      if (spiHelperIsAdmin()) {
        const proceed = confirm("Target page exists, do you want to histmerge the cases?");
        if (!proceed) {
          new VueMessage({ type: "warning", content: "Aborted merge" }).show();
          return;
        }
      } else {
        new VueMessage({
          type: "warning",
          content: "Target page exists and you are not an admin, aborting merge"
        }).show();
        return;
      }
    }
    if (newContext.pageName === oldContext.pageName) {
      new VueMessage({ type: "error", content: "Target page is the current page, aborting merge" }).show();
      return;
    }
    let archivesCopied = false;
    if (targetPageText) {
      let sourceArchiveText = await spiHelperGetPageText(oldContext.archiveName, false);
      let targetArchiveText = await spiHelperGetPageText(newContext.archiveName, false);
      if (sourceArchiveText && targetArchiveText) {
        new VueMessage({
          type: "notice",
          content: "Archives detected on both source and target cases, copying it manually."
        }).show();
        sourceArchiveText = sourceArchiveText.replace(/^\s*__TOC__\s*$\n/gm, "");
        sourceArchiveText = sourceArchiveText.replace(spiHelperArchiveNoticeRegex, "");
        sourceArchiveText = sourceArchiveText.replace(spiHelperPriorCasesRegex, "");
        sourceArchiveText = sourceArchiveText.replace(/^\n*/, "");
        targetArchiveText += `
` + sourceArchiveText;
        await spiHelperEditPage({
          title: newContext.archiveName,
          newText: targetArchiveText,
          summary: `Copying archives from [[${oldContext.prefixedName}]], see page history for attribution`,
          createonly: false,
          watch: spiHelperSettings.watch.archive,
          watchExpiry: spiHelperSettings.expiry.archive
        });
        await spiHelperDeletePage(oldContext.archiveName, "Deleting copied archive");
        archivesCopied = true;
      }
      const siteRestrictions = await spiHelperGetSiteRestrictionInformation();
      const newProtection = await getNewProtection(oldContext.pageName, newContext.pageName, siteRestrictions);
      const newPendingChanges = await getNewPendingChanges(oldContext.pageName, newContext.pageName, siteRestrictions);
      await spiHelperDeletePage(newContext.pageName, "Deleting as part of case merge");
      await spiHelperMovePage({
        sourcePage: oldContext.pageName,
        destPage: newContext.pageName,
        summary: `Merging case to [[${newContext.prefixedName}]]`,
        ignoreWarnings: true
      });
      await spiHelperUndeletePage(newContext.pageName, "Restoring page history after merge");
      if (archivesCopied) {
        await spiHelperEditPage({
          title: oldContext.archiveName,
          newText: `#REDIRECT [[${newContext.archiveName}]]`,
          summary: "Redirecting old archive to new archive",
          createonly: false,
          watch: spiHelperSettings.watch.archive,
          watchExpiry: spiHelperSettings.expiry.archive
        });
      }
      if (newProtection.length !== 0) {
        await spiHelperProtectPage(newContext.pageName, newProtection);
        await spiHelperProtectPage(oldContext.pageName, newProtection);
      }
      if (newPendingChanges.level !== "") {
        await spiHelperConfigurePendingChanges(newContext.pageName, newPendingChanges);
        await spiHelperConfigurePendingChanges(oldContext.pageName, newPendingChanges);
      }
    } else {
      await spiHelperMovePage({
        sourcePage: oldContext.pageName,
        destPage: newContext.pageName,
        summary: `Moving case to [[${newContext.prefixedName}]]`,
        ignoreWarnings: false
      });
    }
    await spiHelperPostRenameCleanup(oldContext, newContext, archiveNotice);
    if (targetPageText) {
      await spiHelperPostMergeCleanup(targetPageText, newContext);
    }
    if (archivesCopied) {
      new VueMessage({
        type: "notice",
        content: "Archives were merged during the case move, please reorder the archive sections"
      }).show();
    }
  }
  async function spiHelperMoveCaseSection(mergeTarget, section) {
    const newContext = new SpiPageContext(context.pageName.replace(context.caseName, mergeTarget));
    let targetPageText = await newContext.getText();
    let sectionText = await loadSectionText(section);
    sectionText = sectionText.replace(/\n*----(?!(\n|.)*----)/, `
* {{clerknote}} originally filed under [[Wikipedia:Sockpuppet investigations/` + context.caseName + `]]. ~~~~
----`);
    if (targetPageText === "") {
      targetPageText = `<noinclude>__TOC__</noinclude>
{{SPI archive notice|` + mergeTarget + `}}
{{SPIpriorcases}}`;
    }
    targetPageText += `
` + sectionText;
    newContext.edit({
      newText: targetPageText,
      summary: "Moving case section from [[" + context.prefixedName + "]], see page history for attribution",
      createonly: false,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
    await context.edit({
      newText: "",
      summary: "Moving case section to [[" + newContext.prefixedName + "]]",
      createonly: false,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId,
      sectionId: section.id
    });
  }
  async function spiHelperPostRenameCleanup(oldContext, newContext, oldNotice) {
    const newNotice = new ParsedArchiveNotice({ username: newContext.caseName });
    const replacementArchiveNotice = newNotice.generateWikitext();
    newNotice.crosswiki = oldNotice.crosswiki;
    newNotice.deny = oldNotice.deny;
    newNotice.notalk = oldNotice.notalk;
    newNotice.moot = oldNotice.moot;
    const pagesChecked = [];
    const pagesToCheck = [oldContext.pageName];
    let currentPageToCheck = null;
    while (pagesToCheck.length !== 0) {
      currentPageToCheck = pagesToCheck.pop();
      if (!currentPageToCheck || currentPageToCheck === newContext.pageName || currentPageToCheck === oldContext.pageName) {
        continue;
      }
      pagesChecked.push(currentPageToCheck);
      const backlinks = await spiHelperGetSPIBacklinks(currentPageToCheck);
      for (const backlink of backlinks) {
        const archiveNotice = await spiHelperParseArchiveNotice(backlink.title);
        if (!archiveNotice) {
          continue;
        }
        if (archiveNotice.username === currentPageToCheck.replace(/Wikipedia:Sockpuppet investigations\//g, "")) {
          spiHelperEditPage({
            title: backlink.title,
            newText: replacementArchiveNotice,
            summary: "Updating backlink following page move",
            watch: spiHelperSettings.watch.case,
            watchExpiry: spiHelperSettings.expiry.case
          });
          if (pagesChecked.includes(backlink.title)) {
            pagesToCheck.push(backlink.title);
          }
        }
      }
    }
    await oldContext.edit({
      newText: replacementArchiveNotice,
      summary: "Updating old case following page move",
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
    let newPageText = await newContext.getText({ purge: true, show: true });
    newPageText = newPageText.replace(spiHelperArchiveNoticeRegex, newNotice.generateWikitext());
    newPageText = newPageText.replace(spiHelperSockSectionWithNewlineRegex, "====Suspected sockpuppets====" + `
* {{checkuser|1=` + oldContext.caseName + `}} ({{clerknote}} original case name)
`);
    const newMasterReString = "(sockpuppets\\s*====.*?)\\n^\\s*\\*\\s*{{checkuser\\|(?:1=)?" + newContext.caseName + "(?:\\|master name\\s*=.*?)?}}\\s*$(.*====\\s*<big>)";
    const newMasterRe = new RegExp(newMasterReString, "sm");
    newPageText = newPageText.replace(newMasterRe, `$1
$2`);
    await newContext.edit({
      newText: newPageText,
      summary: "Updating new case following page move",
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
  }
  async function spiHelperPostMergeCleanup(originalText, newContext) {
    let newText = await newContext.getText({ purge: true });
    newText = newText.replace(/\n*<noinclude>__TOC__.*\n/ig, "");
    newText = newText.replace(spiHelperArchiveNoticeRegex, "");
    newText = newText.replace(spiHelperPriorCasesRegex, "");
    newText = originalText + `
` + newText;
    await newContext.edit({
      newText,
      summary: "Re-adding previous cases following merge",
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
  }

  // src/actions/tag.ts
  function createCategoryPage(title) {
    return spiHelperEditPage({
      title,
      newText: "{{sockpuppet category}}",
      summary: `Creating sockpuppet category per [[${context.prefixedName}]]`,
      createonly: true,
      watch: spiHelperSettings.watch.categories,
      watchExpiry: spiHelperSettings.expiry.categories
    });
  }
  async function spiHelperTagUser(opts) {
    const { sock, tagNonLocalAccounts, master, altmaster, blocked } = opts;
    if (isNonRegisteredAccount(sock.username)) {
      return false;
    }
    const userInfo = await spiHelperGetGlobalUser(sock.username);
    if (!userInfo) {
      new VueMessage({ type: "warning", content: `The account ${sock.username} does not exist and so has not been tagged` }).show();
      return false;
    }
    if (!tagNonLocalAccounts && !userInfo.existsLocally) {
      new VueMessage({ type: "warning", content: `The account ${sock.username} does not exist locally and so has not been tagged` }).show();
      return false;
    }
    let tagText = "";
    const isMaster = sock.tag.startsWith("M");
    let tag;
    switch (sock.tag) {
      case "Mblocked":
        tag = "blocked";
        break;
      case "Mconfirmed":
        tag = "blocked";
        break;
      case "Mbanned":
        tag = "banned";
        break;
      case "Ssuspected":
        tag = "blocked";
        break;
      case "Sproven":
        tag = "proven";
        break;
      case "Sconfirmed":
        tag = "confirmed";
        break;
      default:
        console.error("spiHelperTagUser: Unexpected tag value", sock.tag);
        return false;
    }
    const isNotBlocked = !userInfo.existsLocally || !blocked;
    if (isMaster) {
      tagText += `{{sockpuppeteer
| 1 = ${tag}
| checked = ${sock.tag === "Mconfirmed" || sock.tag === "Mbanned"}
| locked = ${userInfo.locked ? "yes" : "no"}
}}`;
    }
    const tagAltmaster = sock.altmaster !== "none";
    if (!isMaster || tagAltmaster) {
      let altmasterParam = tagAltmaster ? altmaster : "";
      let altmasterStatusParam = tagAltmaster ? sock.altmaster : "";
      let sockmasterName = master;
      if (tagAltmaster && isMaster) {
        sockmasterName = altmaster;
        tag = sock.altmaster === "suspected" ? "blocked" : sock.altmaster;
        altmasterParam = "";
        altmasterStatusParam = "";
        tagText += `
`;
      }
      tagText += `{{sockpuppet
| 1 = ${sockmasterName}
| 2 = ${tag}
| locked = ${userInfo.locked ? "yes" : "no"}
| notblocked = ${isNotBlocked ? "yes" : "no"}
| altmaster = ${altmasterParam}
| altmaster-status = ${altmasterStatusParam}
}}`;
    }
    return spiHelperEditPage({
      title: `User:${sock.username}`,
      newText: tagText,
      summary: `Adding sockpuppetry tag per [[${context.prefixedName}]]`,
      createonly: false,
      watch: spiHelperSettings.watch.tagged,
      watchExpiry: spiHelperSettings.expiry.tagged
    });
  }
  async function createSockCategories(opts) {
    const { sockRows, master, altmaster } = opts;
    let needsPurge = false;
    const checkConfirmedCat = sockRows.some((sock) => sock.tag === "Sproven" || sock.tag === "Sconfirmed");
    const checkSuspectedCat = sockRows.some((sock) => sock.tag === "Ssuspected");
    const checkAltSuspectedCat = sockRows.some((sock) => sock.altmaster === "suspected");
    const checkAltProvenCat = sockRows.some((sock) => sock.altmaster === "proven");
    if (checkAltProvenCat) {
      const catName = `Category:Wikipedia sockpuppets of ${altmaster}`;
      const catText = await spiHelperGetPageText(catName, false);
      if (!catText) {
        await createCategoryPage(catName);
        needsPurge = true;
      }
    }
    if (checkAltSuspectedCat) {
      const catName = `Category:Suspected Wikipedia sockpuppets of ${altmaster}`;
      const catText = await spiHelperGetPageText(catName, false);
      if (!catText) {
        await createCategoryPage(catName);
        needsPurge = true;
      }
    }
    if (checkConfirmedCat) {
      const catName = `Category:Wikipedia sockpuppets of ${master}`;
      const catText = await spiHelperGetPageText(catName, false);
      if (!catText) {
        await createCategoryPage(catName);
        needsPurge = true;
      }
    }
    if (checkSuspectedCat) {
      const catName = `Category:Suspected Wikipedia sockpuppets of ${master}`;
      const catText = await spiHelperGetPageText(catName, false);
      if (!catText) {
        await createCategoryPage(catName);
        needsPurge = true;
      }
    }
    return needsPurge;
  }

  // src/actions/block.ts
  function buildTalkNotice(sock, noticeType, sockmaster, cuBlock) {
    let newText;
    let isSock = noticeType === "sock";
    if (isSock && sock.username === spiHelperNormalizeUsername(sockmaster)) {
      isSock = false;
    }
    if (isSock) {
      newText = `== Blocked as a sockpuppet ==
`;
    } else {
      newText = `== Blocked for sockpuppetry ==
`;
    }
    if (cuBlock) {
      newText += "{{checkuserblock-account|sig=~~~~";
    } else {
      newText += "{{subst:uw-sockblock|sig=yes";
    }
    newText += "|spi=" + context.caseName;
    if (isNoExpiry(sock.duration)) {
      newText += "|indef=yes";
    } else {
      newText += "|time=" + sock.duration;
      if (cuBlock) {
        newText += "|indef=no";
      }
    }
    if (sock.ntp) {
      newText += "|notalk=yes";
    }
    if (isSock) {
      newText += "|master=" + sockmaster;
    }
    newText += "}}";
    return newText;
  }
  function buildBlockSummary(blockOptions, isIP, isIPRange, acb) {
    let blockSummary = `Abusing [[WP:SOCK|multiple accounts]]: Please see: [[${context.prefixedName}]]`;
    if (spiHelperIsCheckuser() && blockOptions.cuBlock) {
      const cuBlockTemplate = isIP ? "{{checkuserblock}}" : "{{checkuserblock-account}}";
      if (blockOptions.cuBlockOnly) {
        blockSummary = cuBlockTemplate;
      } else {
        blockSummary = cuBlockTemplate + ": " + blockSummary;
      }
    } else if (isIPRange) {
      blockSummary = `{{rangeblock|1=${blockSummary}`;
      if (!acb) {
        blockSummary += "|create=yes";
      }
      blockSummary += "}}";
    }
    return blockSummary;
  }
  async function spiHelperProcessBlockRow(opts) {
    const { sock, userBlock, userTalkContent, blockOptions, noticeType, sockmaster } = opts;
    const blockReason = userBlock?.reason;
    if (!spiHelperIsCheckuser() && blockOptions.override && blockReason && spiHelperCUBlockRegex.exec(blockReason)) {
      const prompt = "User " + sock.username + ` is CheckUser-blocked, are you SURE you want to re-block them?
` + `Current block message:
` + blockReason;
      if (!confirm(prompt)) {
        return false;
      }
    }
    if (!sock.duration) {
      new VueMessage({
        type: "error",
        content: `Block target ${sock.username} does not have an intended duration`
      }).show();
      return false;
    }
    const isIP = mw.util.isIPAddress(sock.username, true);
    const isIPRange = isIP && !mw.util.isIPAddress(sock.username, false);
    const blockSummary = buildBlockSummary(blockOptions, isIP, isIPRange, sock.acb);
    const blockSuccess = await spiHelperBlockUser({
      user: sock.username,
      duration: sock.duration,
      reason: blockSummary,
      reblock: blockOptions.override,
      anononly: isIP ? sock.abao : false,
      accountcreation: sock.acb,
      autoblock: isIP ? false : sock.abao,
      notalkpage: sock.ntp,
      noemail: sock.nem,
      watchBlockedUser: spiHelperSettings.watch.blocked,
      watchExpiry: spiHelperSettings.expiry.blocked
    });
    if (isIPRange) {
      return blockSuccess;
    }
    if (!blockSuccess) {
      return false;
    }
    if (noticeType) {
      const cuBlock = blockOptions.cuBlock && spiHelperIsCheckuser() && spiHelperSettings.useCheckuserblockAccount;
      let newText = buildTalkNotice(sock, noticeType, sockmaster, cuBlock);
      const userTalkPage = `User talk:${sock.username}`;
      if (!blockOptions.blankTalk) {
        if (userTalkContent) {
          newText = userTalkContent + `
` + newText;
        }
      }
      await spiHelperEditPage({
        title: userTalkPage,
        newText,
        summary: `Adding sockpuppetry block notice per [[${context.prefixedName}]]`,
        createonly: false,
        watch: "nochange"
      });
    }
    return true;
  }

  // src/actions/archive.ts
  async function spiHelperArchiveCase(state) {
    const sectionFetchMessage = new VueMessage({ type: "notice", content: "Loading all sections" }).show();
    const pageTextPromise = loadCaseText(state);
    const sectionsToArchive = (await Promise.all(state.sections.map(async (section) => {
      const sectionText = await loadSectionText(section);
      const caseStatus = spiHelperCaseStatusRegex.exec(sectionText);
      if (!caseStatus?.[1]) {
        return null;
      }
      return spiHelperCaseClosedRegex.test(caseStatus[1]) ? section : null;
    }))).filter((section) => section !== null);
    let newText = await pageTextPromise;
    sectionFetchMessage.update({ type: "success", content: "All sections loaded" });
    if (sectionsToArchive.length === 0) {
      new VueMessage({ type: "warning", content: "Nothing to archive" }).show();
      return;
    }
    let newArchiveText = await spiHelperGetPageText(context.archiveName, true);
    const postExpandPercent = (await spiHelperGetPostExpandSize(context.pageName) + await spiHelperGetPostExpandSize(context.archiveName)) / spiHelperGetMaxPostExpandSize();
    if (postExpandPercent >= 1) {
      let archiveId = 0;
      while (newArchiveText !== "") {
        newArchiveText = await spiHelperGetPageText(`${context.archiveName}/${++archiveId}`, true);
      }
      const newArchiveName = `${context.archiveName}/${archiveId}`;
      await spiHelperMovePage({
        sourcePage: context.archiveName,
        destPage: newArchiveName,
        summary: "Moving archive to avoid exceeding post expand size limit",
        ignoreWarnings: false,
        moveSubpages: false
      });
      await spiHelperEditPage({
        title: context.archiveName,
        newText: "",
        summary: "Removing redirect",
        createonly: false,
        watch: "nochange"
      });
    }
    if (newArchiveText === "") {
      newArchiveText = `__TOC__
{{SPI archive notice|1=${context.caseName}}}
{{SPIpriorcases}}
`;
    } else {
      newArchiveText = newArchiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, `
{{SPIpriorcases}}`);
    }
    let sectionsAdded = 0;
    for (const section of sectionsToArchive) {
      const sectionText = await loadSectionText(section);
      newText = newText.replace(sectionText + `
`, "").replace(sectionText, "");
      const cleanSectionText = sectionText.slice(sectionText.search(spiHelperSectionRegex)).replace(spiHelperCaseStatusRegex, "");
      if (newArchiveText.includes(cleanSectionText)) {
        new VueMessage({ type: "warning", content: `Section ${section.name} already exists in the archive` }).show();
        continue;
      }
      newArchiveText += `
`;
      newArchiveText += cleanSectionText;
      sectionsAdded++;
    }
    if (sectionsAdded === 0) {
      new VueMessage({ type: "warning", content: "Nothing to archive" }).show();
      return;
    }
    const usePlural = sectionsAdded > 1;
    const summaryPrefix = `Archiving ${sectionsAdded} section${usePlural ? "s" : ""}`;
    const archiveSuccess = await spiHelperEditPage({
      title: context.archiveName,
      newText: newArchiveText,
      summary: `${summaryPrefix} from [[${context.prefixedName}]]`,
      watch: spiHelperSettings.watch.archive,
      watchExpiry: spiHelperSettings.expiry.archive
    });
    if (!archiveSuccess) {
      new VueMessage({ type: "error", content: "Failed to update archive, not removing sections from case page" }).show();
      return;
    }
    await context.edit({
      newText,
      summary: `${summaryPrefix} to [[${spiHelperGetInterwikiPrefix()}${context.archiveName}]]`,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId
    });
    context.refreshRevId();
    refreshSections(state);
  }
  async function spiHelperArchiveCaseSection(section) {
    let sectionText = await loadSectionText(section);
    sectionText = sectionText.replace(spiHelperCaseStatusRegex, "");
    const newArchiveText = sectionText.slice(sectionText.search(spiHelperSectionRegex));
    let archiveText = await spiHelperGetPageText(context.archiveName, true);
    const message = new VueMessage({ type: "error", content: "" });
    if (archiveText.includes(sectionText)) {
      message.type = "warning";
      message.content = "Looks like the page has been archived already";
      message.show();
      return;
    }
    if (archiveText === "") {
      archiveText = `__TOC__
{{SPI archive notice|1=` + context.caseName + `}}
{{SPIpriorcases}}
`;
    } else {
      archiveText = archiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, `
{{SPIpriorcases}}`);
    }
    archiveText += `
` + newArchiveText;
    const archiveSuccess = await spiHelperEditPage({
      title: context.archiveName,
      newText: archiveText,
      summary: `Archiving case section from [[${context.prefixedName}]]`,
      createonly: false,
      watch: spiHelperSettings.watch.archive,
      watchExpiry: spiHelperSettings.expiry.archive
    });
    if (!archiveSuccess) {
      message.content = "Failed to update archive, not removing section from case page";
      message.show();
      return;
    }
    await context.edit({
      newText: "",
      summary: `Archiving case section to [[${spiHelperGetInterwikiPrefix()}${context.archiveName}]]`,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId,
      sectionId: section.id
    });
    await context.refreshRevId();
  }

  // src/actions/lock.ts
  async function filterLockedAccounts(users) {
    const lockResults = await Promise.all(users.map(async (user) => (await spiHelperGetGlobalUser(user))?.locked ? null : user));
    return lockResults.filter((user) => user !== null);
  }
  async function spiHelperRequestLocks(opts) {
    const { master, hideNames } = opts;
    const lockTargets = opts.lockTargets.length < 6 ? await filterLockedAccounts(opts.lockTargets) : opts.lockTargets;
    if (lockTargets.length === 0) {
      return [];
    }
    let lockTemplate;
    const usePlural = lockTargets.length > 1;
    if (!usePlural && lockTargets[0]) {
      lockTemplate = `* {{LockHide|1=${lockTargets[0]}}}`;
    } else {
      lockTemplate = "{{MultiLock";
      lockTargets.forEach((user, i) => {
        lockTemplate += `|${i + 1}=${user}`;
      });
      if (hideNames) {
        lockTemplate += "|hidename=1";
      }
      lockTemplate += "}}";
    }
    let heading;
    let headingText;
    if (hideNames) {
      heading = usePlural ? `${lockTargets.length} sockpuppets` : "a sockpuppet";
      headingText = heading;
    } else {
      heading = `${lockTargets.length} [[Special:CentralAuth/${master}|${master}]] ${usePlural ? "socks" : "sock"}`;
      headingText = `${lockTargets.length} ${master} ${usePlural ? "socks" : "sock"}`;
    }
    const lockComment = opts.lockComment.trim().replace(/\.+$/, "");
    let message = `=== Global lock for ${heading} ===`;
    message += `
{{status}}`;
    message += `
${lockTemplate}`;
    message += `
${usePlural ? "Sockpuppets" : "Sockpuppet"} found in enwiki sockpuppet investigation, see [[${context.prefixedName}]].`;
    if (lockComment !== "") {
      message += ` ${lockComment}.`;
    }
    message += " ~~~~";
    let srgText = await spiHelperGetPageText("meta:Steward requests/Global", false);
    srgText = srgText.replace(/\n+(== See also == *\n)/, `

` + message + `

$1`);
    new VueMessage({ type: "notice", content: "Filing global lock request" }).show();
    const editSuccess = await spiHelperEditPage({
      title: "meta:Steward requests/Global",
      newText: srgText,
      summary: `Global lock request for ${heading}`,
      createonly: false,
      watch: "nochange"
    });
    if (editSuccess) {
      const linkHtml = buildTitleLinkHtml(`meta:Steward requests/Global#${headingText}`, "filed");
      new VueMessage({ type: "success", content: `Global lock request ${linkHtml} successfully!`, isHtml: true }).show();
    } else {
      new VueMessage({ type: "warning", content: "Global lock request failed." }).show();
    }
    return lockTargets;
  }

  // src/caseActions.ts
  async function spiHelperOneClickArchive(state) {
    startOp("oneClickArchive");
    new VueMessage({ type: "notice", content: "Starting OCA" }).show();
    const pageText = await loadCaseText(state, { show: true, purge: true });
    if (!spiHelperSectionRegex.test(pageText)) {
      new VueMessage({ type: "notice", content: "Looks like the page has been archived already" }).show();
      finishOp("oneClickArchive", "success" /* Success */);
      return;
    }
    await refreshSections(state);
    await spiHelperArchiveCase(state);
    await spiHelperPurgePage(context.pageName);
    const logMessage = `* [[${context.pageName}]]: used one-click archiver ~~~~~`;
    if (spiHelperSettings.log.enabled) {
      await spiHelperLog(logMessage);
    }
    new VueMessage({ type: "success", content: "Done!" }).show();
    finishOp("oneClickArchive", "success" /* Success */);
  }
  async function spiHelperPerformActions(opts) {
    const { actions, state } = opts;
    if (Object.values(actions).every((action) => !action.enabled)) {
      new VueMessage({ type: "warning", content: "No actions are enabled" }).show();
      return;
    }
    if (!state.selectedSection) {
      console.error("spiHelperPerformActions: Expected a selected section, got null");
      new VueMessage({ type: "error", content: "Expected a selected section, got null" }).show();
      return;
    }
    if (!state.archiveNotice) {
      console.error("spiHelperPerformActions: Could not find archive notice");
      new VueMessage({ type: "error", content: "Could not find archive notice" }).show();
      return;
    }
    const { master, altmaster } = actions.block.data;
    if (!master) {
      console.error("spiHelperPerformActions: Could not get master");
      new VueMessage({ type: "error", content: "Could not get master" }).show();
      return;
    }
    if (!altmaster) {
      console.error("spiHelperPerformActions: Could not get altmaster");
      new VueMessage({ type: "error", content: "Could not get altmaster" }).show();
      return;
    }
    const sectionType = state.selectedSection.type;
    new VueMessage({ type: "notice", content: "Running actions" }).show();
    const editSummaryActions = [];
    let logMessage = `* [[${context.pageName}]]`;
    if (state.selectedSection.type === "specific") {
      logMessage += ` (section ${state.selectedSection.section.name})`;
    } else {
      logMessage += " (full case)";
    }
    logMessage += " ~~~~~";
    let targetText = await (sectionType === "specific" ? loadSectionText(state.selectedSection.section) : loadCaseText(state));
    if (!targetText) {
      new VueMessage({ type: "error", content: "Could not fetch text for the page" }).show();
      return;
    }
    const startText = targetText;
    let blockPromises = [];
    let tagPromises = [];
    let lockPromise = Promise.resolve([]);
    if (actions.block.enabled) {
      ({ blockPromises, tagPromises, lockPromise } = await spiHelperHandleBlocks(actions.block.data));
    }
    const userActionsPromise = Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
      lockPromise
    ]);
    if (!context.isArchive) {
      if (sectionType === "specific") {
        const caseStatusResult = spiHelperCaseStatusRegex.exec(targetText);
        if (caseStatusResult === null) {
          targetText = targetText.replace(/^(\s*===.*===[^\S\r\n]*)/, `$1
{{SPI case status|}}`);
          actions.status.data.old = "new";
        }
        if (actions.status.data.new === "nochange") {
          actions.status.data.new = actions.status.data.old;
        }
        if (actions.status.enabled && actions.status.data.new !== actions.status.data.old) {
          const statusResult = spiHelperHandleStatus(actions.status.data.new, targetText);
          targetText = statusResult.targetText;
          if (statusResult.newStatus !== "nochange") {
            editSummaryActions.push(statusResult.summaryItem);
            logMessage += `
** changed case status from ${actions.status.data.old} to ${statusResult.newStatus}`;
          }
        }
        if (actions.comment.enabled && actions.comment.data.text.trim() !== "*") {
          targetText = spiHelperHandleComment(targetText, actions.comment.data.text);
          editSummaryActions.push("comment");
          logMessage += `
** commented`;
        }
      } else {
        if (actions.management.enabled) {
          const noticeOpts = actions.management.data.flags;
          state.archiveNotice = new ParsedArchiveNotice({
            username: state.archiveNotice.username || context.caseName,
            deny: noticeOpts.has("deny"),
            crosswiki: noticeOpts.has("crosswiki"),
            notalk: noticeOpts.has("notalk"),
            moot: noticeOpts.has("moot")
          });
          const archiveNoticeWikitext = state.archiveNotice.generateWikitext();
          targetText = targetText.replace(spiHelperArchiveNoticeRegex, archiveNoticeWikitext);
          editSummaryActions.push("update archivenotice");
          logMessage += `
** Updated archivenotice`;
        }
      }
    }
    if (editSummaryActions.length === 0) {
      editSummaryActions.push("Saving page");
    }
    if (!context.isArchive && targetText !== startText) {
      const sectionId = state.selectedSection.type === "all" ? null : state.selectedSection.section.id;
      const editSummary = formatEditSummary(editSummaryActions);
      const editSucceeded = await context.edit({
        newText: targetText,
        summary: editSummary,
        watch: spiHelperSettings.watch.case,
        watchExpiry: spiHelperSettings.expiry.case,
        baseRevId: context.startingRevId,
        sectionId
      });
      if (!editSucceeded) {
        new VueMessage({ type: "error", content: "Failed to save edit" }).show();
      }
    }
    await context.refreshRevId();
    if (actions.archive.enabled) {
      switch (state.selectedSection.type) {
        case "all": {
          logMessage += `
** Archived case`;
          await spiHelperArchiveCase(state);
          break;
        }
        case "specific": {
          logMessage += `
** Archived section`;
          await spiHelperArchiveCaseSection(state.selectedSection.section);
          break;
        }
      }
    } else if (actions.move.enabled) {
      const renameTarget = spiHelperNormalizeUsername(actions.move.data.target);
      if (renameTarget) {
        switch (state.selectedSection.type) {
          case "all": {
            logMessage += `
** moved/merged case to ` + renameTarget;
            await spiHelperMoveCase(renameTarget, state.archiveNotice);
            break;
          }
          case "specific": {
            logMessage += `
** moved section to ` + renameTarget;
            await spiHelperMoveCaseSection(renameTarget, state.selectedSection.section);
            break;
          }
        }
      }
    }
    const [blockedUsers, taggedUsers, lockedUsers] = await userActionsPromise;
    if (spiHelperSettings.log.enabled) {
      if (blockedUsers.length > 0) {
        logMessage += `
** blocked ` + blockedUsers.filter(Boolean).join(", ");
      }
      if (taggedUsers.length > 0) {
        logMessage += `
** tagged ` + taggedUsers.filter(Boolean).join(", ");
      }
      if (lockedUsers.length > 0) {
        logMessage += `
** requested locks for ` + lockedUsers.map((user) => `{{noping|1=${user}}}`).join(", ");
      }
      await spiHelperLog(logMessage);
    }
    await spiHelperPurgePage(context.pageName);
    await refreshSections(state);
    new VueMessage({ type: "success", content: "Done!" }).show();
  }
  function spiHelperHandleComment(targetText, comment) {
    if (!targetText.includes(`
----`)) {
      targetText.replace("<!--- All comments go ABOVE this line, please. -->", "");
      targetText.replace("<!-- All comments go ABOVE this line, please. -->", "");
      targetText += `
----<!-- All comments go ABOVE this line, please. -->`;
    }
    comment = addSignature(comment.trimEnd());
    if (spiHelperIsClerk() || spiHelperIsAdmin()) {
      return targetText.replace(/\n*----(?!.*----)/s, `
${comment}
----`);
    } else {
      return targetText.replace(spiHelperAdminSectionWithPrecedingNewlinesRegex, `
` + comment + `

====<big>Clerk, CheckUser, and/or patrolling admin comments</big>====
`);
    }
  }
  function spiHelperHandleStatus(newStatus, targetText) {
    let summaryItem = "";
    switch (newStatus) {
      case "reopen":
        newStatus = "open";
        summaryItem = "Reopening";
        break;
      case "open":
        summaryItem = "Marking request as open";
        break;
      case "CUrequest":
        summaryItem = "Adding checkuser request";
        break;
      case "admin":
        summaryItem = "Requesting admin action";
        break;
      case "clerk":
        summaryItem = "Requesting clerk action";
        break;
      case "selfendorse":
        newStatus = "endorse";
        summaryItem = "Adding checkuser request (self-endorsed for checkuser attention)";
        break;
      case "checked":
        summaryItem = "Marking request as checked";
        break;
      case "inprogress":
        summaryItem = "Marking request in progress";
        break;
      case "decline":
        summaryItem = "Declining checkuser";
        break;
      case "cudecline":
        summaryItem = "CU declining checkuser";
        break;
      case "endorse":
        summaryItem = "Endorsing for checkuser attention";
        break;
      case "cuendorse":
        summaryItem = "CU endorsing for checkuser attention";
        break;
      case "moreinfo":
      case "cumoreinfo":
        summaryItem = "Requesting additional information";
        break;
      case "relist":
        summaryItem = "Relisting case for another check";
        break;
      case "hold":
        summaryItem = "Putting case on hold";
        break;
      case "cuhold":
        summaryItem = "Placing checkuser request on hold";
        break;
      case "closed":
        summaryItem = "Closing case";
        break;
      case "nochange":
        break;
      default:
        console.error("Unexpected case status value", newStatus);
    }
    const caseStatusResult = spiHelperCaseStatusRegex.exec(targetText);
    if (caseStatusResult?.[0]) {
      targetText = targetText.replace(caseStatusResult[0], `{{SPI case status|${newStatus}}}`);
    }
    return { newStatus, summaryItem, targetText };
  }
  async function spiHelperHandleBlocks(opts) {
    const blockPromises = [];
    const tagPromises = [];
    let lockPromise = Promise.resolve([]);
    const {
      userlocks: userLocks,
      options: blockOptions,
      lockcomment: lockComment,
      master,
      altmaster
    } = opts;
    const sockRows = opts.accounts.filter((sock) => sock.username !== "");
    const lockTargets = [];
    const needsPurge = await createSockCategories({ sockRows, master, altmaster });
    const blockAvailable = spiHelperIsAdmin() && !blockOptions.noBlock;
    const allUsernames = sockRows.map((user) => user.username);
    const allUserTalkPages = allUsernames.map((username) => `User talk:${username}`);
    const fetchMessage = new VueMessage({ type: "notice", content: "Fetching user blocks and talkpages" }).show();
    const [userBlocks, userTalkPages] = await Promise.all([
      spiHelperGetBulkUserBlockSettings(allUsernames),
      spiHelperGetBulkPageText(allUserTalkPages)
    ]);
    fetchMessage.update({ type: "success", content: "Got previous blocks and talkpages " });
    const tagSock = async (sockRow, blocked) => {
      const tagSuccess = await spiHelperTagUser({
        sock: sockRow,
        tagNonLocalAccounts: blockOptions.tagUnattached,
        blocked,
        master,
        altmaster
      });
      if (tagSuccess) {
        if (needsPurge) {
          await spiHelperPurgePage(`User:${sockRow.username}`);
        }
      }
      return tagSuccess ? sockRow.username : null;
    };
    for (const sockRow of sockRows) {
      if (sockRow.lock && !isNonRegisteredAccount(sockRow.username)) {
        if (userLocks.get(sockRow.username) !== true) {
          lockTargets.push(sockRow.username);
        }
      }
      const username = spiHelperNormalizeUsername(sockRow.username);
      if (blockAvailable && sockRow.block) {
        let noticeType = null;
        const masterTag = sockRow.tag.includes("master") || context.userName === username;
        if (blockOptions.addMasterNotice && masterTag) {
          noticeType = "master";
        } else if (blockOptions.addSockNotice) {
          noticeType = "sock";
        }
        blockPromises.push((async () => {
          await new Promise((r) => setTimeout(r, Math.random() * 500));
          const blockSuccess = await spiHelperProcessBlockRow({
            sock: sockRow,
            userBlock: userBlocks.get(sockRow.username),
            userTalkContent: userTalkPages.get(sockRow.username),
            blockOptions,
            noticeType,
            sockmaster: master
          });
          if (!blockSuccess) {
            return null;
          }
          if (sockRow.tag !== "none" || sockRow.altmaster !== "none") {
            tagPromises.push(tagSock(sockRow, true));
          }
          return sockRow.username;
        })());
      } else if (sockRow.tag !== "none" || sockRow.altmaster !== "none") {
        tagPromises.push(tagSock(sockRow, userBlocks.get(sockRow.username) !== undefined));
      }
    }
    if (lockTargets.length > 0) {
      const hideNames = blockOptions.lockHideNames;
      lockPromise = spiHelperRequestLocks({ lockTargets, hideNames, master, lockComment });
    }
    return { blockPromises, tagPromises, lockPromise };
  }
  function formatEditSummary(editSummaryActions) {
    const [firstAction, ...rest] = editSummaryActions;
    if (!firstAction) {
      return "";
    }
    const formattedStart = firstAction.charAt(0).toUpperCase() + firstAction.slice(1);
    const remainder = rest.length ? `, ${rest.join(", ")}` : "";
    return formattedStart + remainder;
  }

  // src/ui/views/top/topView.ts
  var TopViewComponent = defineComponent({
    props: {
      state: { type: Object, required: true },
      feedbackDialog: { type: Object, required: true },
      openButton: { type: Object, required: true }
    },
    data() {
      const actionButtons = getActionButtons();
      const actionButtonKeys = Object.keys(actionButtons);
      return {
        open: false,
        _openHandler: null,
        _beforeUnloadHandler: null,
        actionsRunning: false,
        displayedForms: ["sections"],
        unpinned: !spiHelperSettings.interface.pinned,
        buttonLayout: spiHelperSettings.interface.buttonLayout,
        actionButtons,
        actionButtonKeys,
        caseActions: getInitialCaseActions(),
        messages,
        cdxIconPushPin: y7,
        cdxIconCollapse: z4,
        cdxIconExpand: f4,
        cdxIconFeedback: q4
      };
    },
    computed: {
      menuItems() {
        const items = this.state.sections.map((s) => ({
          value: s.id,
          label: s.name
        }));
        items.push({ value: "all", label: "All Sections" });
        return items;
      },
      currentStatus() {
        const statuses = this.caseActions.status.data;
        switch (statuses.new) {
          case "nochange":
            return statuses.old;
          case "selfendorse":
            return "endorse";
          default:
            return statuses.new;
        }
      },
      allDisabled() {
        for (const [name, action] of Object.entries(this.caseActions)) {
          if (name === "sections" || name === "link") {
            continue;
          }
          if (action.enabled) {
            return false;
          }
        }
        return true;
      },
      selectedSection() {
        return this.state.selectedSection;
      },
      archiveNotice() {
        return this.state.archiveNotice;
      },
      stateSections() {
        return this.state.sections;
      },
      mountPoint() {
        return this.$el.parentElement;
      }
    },
    template: `
    <div id="spiHelper-topView-Card" v-if="open">
      <div id="spiHelper-topView-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="feedbackDialog.launch()">
            <cdx-icon :icon="cdxIconFeedback" />
          </cdx-button>
          <cdx-button aria-label="Toggle layout" weight="quiet" @click="toggleButtonLayout">
            <cdx-icon :icon="buttonLayout ? cdxIconExpand : cdxIconCollapse" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-topView-Action" v-if="buttonLayout">
        <div id="buttonRow">
          <action-button
              v-for="[name, button] of Object.entries(actionButtons)"
              :key="name"
              :name="name"
              :label="button.label"
              :selection-type="button.selectionType"
              :selection="caseActions.sections.data.section"
              :displayedForms="displayedForms"
              :actionEnabled="caseActions[name].enabled"
              @click="onActionClick($event, name)"
          />
        </div>
        <div id="contentRow">
          <div v-for="name of actionButtonKeys"
               :key="name"
               :class="{ 'is-visible': isVisible(name) }">
            <action-content
                :name="name"
                :case-actions="caseActions"
                :state="state"
                :menu-items="menuItems"
                :current-status="currentStatus"
                @update-section-selection="onUpdateSectionSelection"
                @block-username-change="handleBlockUsernameChange"
                @link-username-change="handleLinkUsernameChange"
                @link-username-selected="handleLinkUsernameSelected"
                @remove-rows="handleRemoveRows"
                @add-row="handleAddRow"
                @fetch-rows="handleFetchRows"
            />
          </div>
        </div>
      </div>
      <div id="spiHelper-topView-Accordion" v-else>
        <action-accordion
            v-for="[name, button] of Object.entries(actionButtons)"
            :key="name"
            :name="name"
            :label="button.label"
            :selection-type="button.selectionType"
            :selection="caseActions.sections.data.section"
            :displayedForms="displayedForms"
            :actionEnabled="caseActions[name].enabled"
            @action-toggled="onAccordionToggle(name)"
        >
          <action-content
              :name="name"
              :case-actions="caseActions"
              :state="state"
              :menu-items="menuItems"
              :current-status="currentStatus"
              @update-section-selection="onUpdateSectionSelection"
              @block-username-change="handleBlockUsernameChange"
              @link-username-change="handleLinkUsernameChange"
              @link-username-selected="handleLinkUsernameSelected"
              @remove-rows="handleRemoveRows"
              @add-row="handleAddRow"
              @fetch-rows="handleFetchRows"
          />
        </action-accordion>
      </div>
      <submit-form v-if="caseActions.sections.data.section !== null" v-model:socks="caseActions.block.data.accounts"
                   v-model:master="caseActions.block.data.master" v-model:altmaster="caseActions.block.data.altmaster"
                   v-model:lock-comment="caseActions.block.data.lockcomment" :locks="caseActions.block.data.userlocks"
                   :all-disabled="allDisabled"
                   @on-submit="onSubmitActions" />
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div id="messageRow">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `,
    watch: {
      unpinned(newVal) {
        if (!this.mountPoint) {
          console.error("TopViewComponent unpinned: Could not find mountPoint");
          return;
        }
        if (newVal) {
          this.mountPoint.classList.add("unpinned");
        } else {
          this.mountPoint.classList.remove("unpinned");
        }
        spiHelperSettings.interface.pinned = !newVal;
      },
      open(newVal) {
        if (newVal) {
          if (!this.state.archiveNotice) {
            spiHelperParseArchiveNotice(context.pageName.replace(/\/Archive/, "")).then((archiveNoticeResult) => {
              if (archiveNoticeResult === null) {
                this.state.archiveNotice = new ParsedArchiveNotice({ username: context.caseName });
                new VueMessage({
                  type: "warning",
                  content: "Can't find archivenotice template! Automatically adding the archive notice to the page."
                }).show();
                spiHelperAddArchiveNotice(this.state);
              } else {
                this.state.archiveNotice = archiveNoticeResult;
              }
              this.handleAddRow();
            }).catch(() => {
              console.error("topView failed in spiHelperParseArchiveNotice");
            });
          }
        } else {
          saveOptions();
        }
      },
      async stateSections(newValue) {
        if (this.caseActions.sections.data.section === null) {
          const firstSection = newValue[0];
          if (firstSection) {
            this.caseActions.sections.data.section = firstSection.id;
            await this.loadNewSection(firstSection);
          }
        }
      },
      async selectedSection(selection) {
        if (!selection) {
          return;
        }
        const allRows = await prefetchSockRowsForSelection(selection, this.state, this.caseActions.block.data.userlocks);
        this.massAddSockRows(allRows);
      },
      archiveNotice(newNotice) {
        this.caseActions.management.data.flags = getManagementFlagsFromArchiveNotice(newNotice);
      },
      "caseActions.sections.data.section"(newSection, oldSection) {
        if (newSection === oldSection) {
          return;
        }
        for (const [actionName, caseAction] of Object.entries(this.caseActions)) {
          if (actionName === "sections") {
            continue;
          }
          caseAction.enabled = false;
        }
      },
      "caseActions.status.data.status"(newStatus) {
        this.caseActions.comment.data.text = updateCommentWithStatus(this.caseActions.comment.data.text, newStatus);
      }
    },
    methods: {
      toggleButtonLayout() {
        this.buttonLayout = !this.buttonLayout;
        spiHelperSettings.interface.buttonLayout = this.buttonLayout;
      },
      onActionClick(event, formNameString) {
        const formName = formNameString;
        if (event.ctrlKey || event.metaKey) {
          const formIndex = this.displayedForms.indexOf(formName);
          if (formIndex === -1) {
            this.displayedForms.push(formName);
          } else {
            this.displayedForms.splice(formIndex, 1);
          }
        } else {
          this.displayedForms = [formName];
        }
      },
      onAccordionToggle(formNameString) {
        const formName = formNameString;
        const index = this.displayedForms.indexOf(formName);
        if (index === -1) {
          this.displayedForms.push(formName);
        } else {
          this.displayedForms.splice(index, 1);
        }
      },
      isVisible(name) {
        return this.displayedForms.includes(name);
      },
      async onUpdateSectionSelection(newSelection) {
        if (newSelection === null) {
          return;
        }
        if (typeof newSelection !== typeof this.state.selectedSection?.type) {
          this.displayedForms = ["sections"];
        }
        if (newSelection === "all") {
          this.state.selectedSection = { type: "all" };
          return;
        }
        const targetSection = this.state.sections.find((section) => section.id === newSelection);
        if (targetSection === undefined) {
          console.error("onUpdateSectionSelection: Could not find target section with ID", newSelection);
          return;
        }
        await this.loadNewSection(targetSection);
      },
      async loadNewSection(targetSection) {
        this.state.selectedSection = { type: "specific", section: targetSection };
        const newText = await loadSectionText(targetSection);
        const result = spiHelperCaseStatusRegex.exec(newText);
        const normalisedStatus = normalizeCaseStatus(result?.[1] ?? "");
        this.caseActions.status.data.old = normalisedStatus;
        this.caseActions.status.data.new = normalisedStatus;
        if (normalisedStatus === "closed" && spiHelperSettings.tickArchiveWhenCaseClosed) {
          this.caseActions.archive.enabled = true;
        }
      },
      async onSubmitActions() {
        if (isOpRunning("mainActions")) {
          return;
        }
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "submit" });
        startOp("mainActions");
        this.actionsRunning = true;
        await spiHelperPerformActions({
          actions: this.caseActions,
          state: this.state
        });
        finishOp("mainActions", "success" /* Success */);
        this.actionsRunning = false;
      },
      handleFetchRows() {
        const [likelySocks, possibleSocks] = getSockEntries({
          text: this.caseActions.comment.data.text,
          fullSearch: false,
          state: this.state
        });
        const likelySet = new Set(likelySocks);
        const allRows = [...likelySocks, ...possibleSocks].map((sock) => updateSockRowSettings({
          row: sock,
          defaultBlock: likelySet.has(sock)
        }));
        this.massAddSockRows(allRows);
      },
      handleBlockUsernameChange(newUsername, index) {
        if (this.caseActions.link.data.rows.length < index + 1) {
          console.error("handleBlockUsernameChange: Index", index, "doesn't exist in table");
          return;
        }
        this.caseActions.link.data.rows[index].username = newUsername;
      },
      handleLinkUsernameChange(newUsername, index) {
        if (this.caseActions.block.data.accounts.length < index + 1) {
          console.error("handleLinkUsernameChange: Index", index, "doesn't exist in table");
          return;
        }
        this.caseActions.block.data.accounts[index].username = newUsername;
      },
      handleLinkUsernameSelected(data, index) {
        if (this.caseActions.block.data.accounts.length < index + 1) {
          console.error("handleLinkUsernameSelected: Index", index, "doesn't exist in table");
          return;
        }
        HandleUserSelected(data, this.caseActions.block.data.accounts[index]);
      },
      handleAddRow(row) {
        row ??= getDefaultSockRow(this.state.archiveNotice);
        this.caseActions.block.data.accounts = [
          ...this.caseActions.block.data.accounts,
          row
        ];
        this.caseActions.link.data.rows = [
          ...this.caseActions.link.data.rows,
          { ...DefaultLinkRow, username: row.username }
        ];
      },
      handleRemoveRows(indexes) {
        this.caseActions.block.data.accounts = this.caseActions.block.data.accounts.filter((_row, index) => !indexes.includes(index));
        this.caseActions.link.data.rows = this.caseActions.link.data.rows.filter((_row, index) => !indexes.includes(index));
      },
      massAddSockRows(newRows) {
        const sockRows = this.caseActions.block.data.accounts;
        const linkRows = this.caseActions.link.data.rows;
        const withDefault = sockRows.at(-1)?.username === "";
        const existingUsernames = new Set(sockRows.map((s) => s.username));
        newRows.forEach((newRow) => {
          if (existingUsernames.has(newRow.username)) {
            return;
          }
          if (withDefault) {
            sockRows.splice(sockRows.length - 1, 0, newRow);
            linkRows.splice(linkRows.length - 1, 0, { ...DefaultLinkRow, username: newRow.username });
          } else {
            this.handleAddRow(newRow);
          }
        });
      }
    },
    mounted() {
      if (!this.mountPoint) {
        console.error("TopViewComponent mounted: Could not find mountPoint");
        return;
      }
      if (this.unpinned) {
        this.mountPoint.classList.add("unpinned");
      } else {
        this.mountPoint.classList.remove("unpinned");
      }
      this._beforeUnloadHandler = (e) => {
        const opState = getOpState("mainActions");
        if (!this.allDisabled && opState !== "success" /* Success */) {
          e.preventDefault();
        }
      };
      this._openHandler = () => {
        this.open = !this.open;
        if (this.open) {
          mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "open" });
        }
        if (this._beforeUnloadHandler) {
          if (this.open) {
            window.addEventListener("beforeunload", this._beforeUnloadHandler);
          } else {
            window.removeEventListener("beforeunload", this._beforeUnloadHandler);
          }
        }
      };
      this.openButton.addEventListener("click", this._openHandler);
    },
    beforeUnmount() {
      if (this._openHandler) {
        this.openButton.removeEventListener("click", this._openHandler);
      }
      if (this._beforeUnloadHandler) {
        window.removeEventListener("beforeunload", this._beforeUnloadHandler);
      }
    }
  });
  // src/constants/spi.ts
  var spiHelperCUTemplates = [
    {
      label: "Results",
      items: [
        { value: "{{confirmed}}", label: "Confirmed" },
        { value: "{{confirmed-nc}}", label: "Confirmed, no comment for IPs" },
        { value: "{{tallyho}}", label: "Indistinguishable" },
        { value: "{{highly likely}}", label: "Highly likely" },
        { value: "{{likely}}", label: "Likely" },
        { value: "{{possilikely}}", label: "Possilikely" },
        { value: "{{possible}}", label: "Possible" },
        { value: "{{unlikely}}", label: "Unlikely" },
        { value: "{{unrelated}}", label: "Unrelated" },
        { value: "{{inconclusive}}", label: "Inconclusive" },
        { value: "{{IPstale}}", label: "Stale" }
      ]
    },
    {
      label: "Addendums",
      items: [
        { value: "{{behav}}", label: "Needs behavioral evaluation" },
        { value: "{{nosleepers}}", label: "No sleepers" },
        { value: "{{ncip}}", label: "No comment for IPs" }
      ]
    },
    {
      label: "Novelties",
      items: [
        { value: "{{8ball}} ", label: "Magic 8-Ball" },
        { value: "{{crystalball", label: "Not a crystal ball" },
        { value: "{{fishing}}", label: "Not fishing" },
        { value: "{{pixiedust}}", label: "Not pixie dust" }
      ]
    }
  ];
  var spiHelperClerkTemplates = [
    {
      label: "Ducks",
      items: [
        { value: "{{duck}}", label: "Duck" },
        { value: "{{megaphone duck}}", label: "Megaphone duck" },
        { value: "{{megaphone duck|ultimate}}", label: "Ultimate duck" }
      ]
    },
    {
      label: "Results",
      items: [
        { value: "{{IPblock}}", label: "IP blocked" },
        { value: "{{bnt}}", label: "Blocked and tagged" },
        { value: "{{bwt}}", label: "Blocked without tags" },
        { value: "{{sblock}}", label: "Blocked, awaiting tags" },
        { value: "{{btc}}", label: "Blocked, tagged, closed" },
        { value: "{{Action and close}}", label: "Requested actions completed, closing" },
        { value: "{{Closing without action}}", label: "Closing without action" }
      ]
    },
    {
      label: "Other",
      items: [
        { value: "{{subst:DiffsNeeded|moreinfo}}", label: "Diffs needed" },
        { value: "{{GlobalLocksRequested}}", label: "Locks requested" }
      ]
    }
  ];

  // src/ui/views/top/actions/commentAction.ts
  var CommentActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      text: { type: String, required: true }
    },
    data() {
      const noteTemplates = [
        { value: "takenote", label: "Note" }
      ];
      const clerkTemplates = [...spiHelperClerkTemplates];
      const cuTemplates = [...spiHelperCUTemplates];
      if (spiHelperIsCheckuser()) {
        noteTemplates.unshift({ value: "cunote", label: "CheckUser note" });
      }
      if (spiHelperIsAdmin()) {
        noteTemplates.unshift({ value: "adminnote", label: "Administrator note" });
      }
      if (spiHelperIsClerk()) {
        noteTemplates.unshift({ value: "clerknote", label: "Clerk note" });
      }
      return {
        noteTemplates,
        clerkTemplates,
        cuTemplates,
        loadingPreview: false,
        htmlPreview: "",
        cdxIconReload: U7
      };
    },
    emits: ["update:enabled", "update:text"],
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="onEnable">
      <div>
        <cdx-select :menu-items="noteTemplates" default-label="Comment templates" @update:selected="insertNote" />
        <cdx-select :menu-items="clerkTemplates" default-label="Admin/clerk templates" @update:selected="insertText" />
        <cdx-select :menu-items="cuTemplates" default-label="CheckUser templates" @update:selected="insertText" />
      </div>
      <cdx-text-area ref="commentBox" :autosize="true" placeholder="Write your comment" :model-value="text"
                     @update:model-value="onTextUpdate" />
      <div id="spiHelper-PreviewBox" class="cdx-card" style="min-height:26px">
        <cdx-button aria-label="Load preview" @click="updatePreview" weight="primary" action="progressive"
                    :disabled="loadingPreview">
          <cdx-progress-indicator v-if="loadingPreview">Loading preview</cdx-progress-indicator>
          <cdx-icon v-else :icon="cdxIconReload" />
        </cdx-button>
        <div v-html="htmlPreview" id="htmlPreview" />
      </div>
    </action-container>
  `,
    computed: {
      commentBox() {
        return this.$refs.commentBox;
      }
    },
    methods: {
      onEnable(newEnabled) {
        this.$emit("update:enabled", newEnabled);
        if (newEnabled) {
          this.$nextTick(() => {
            this.commentBox.focus();
          });
        }
      },
      onTextUpdate(newValue) {
        this.$emit("update:text", newValue);
      },
      async updatePreview() {
        this.loadingPreview = true;
        this.htmlPreview = await spiHelperRenderText(context.pageName, addSignature(this.text));
        this.loadingPreview = false;
      },
      insertNote(noteValue) {
        const newText = this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i, "* {{" + noteValue + "}} ");
        this.$emit("update:text", newText);
        this.commentBox.focus();
      },
      insertText(templateValue) {
        const textareaElement = this.commentBox.$el.querySelector("textarea");
        if (!textareaElement) {
          console.error("commentAction: Unable to find textarea");
          return;
        }
        const selectionStart = textareaElement.selectionStart;
        const selectionEnd = textareaElement.selectionEnd;
        let newText = this.text;
        if (selectionStart || selectionStart === 0) {
          newText = newText.slice(0, selectionStart) + templateValue + newText.slice(selectionEnd, newText.length);
          textareaElement.selectionStart = selectionStart + templateValue.length;
          textareaElement.selectionEnd = selectionEnd + templateValue.length;
        } else {
          newText += templateValue;
        }
        this.$emit("update:text", newText);
        this.commentBox.focus();
      }
    }
  });
  // src/ui/views/top/actions/changeStatusAction.ts
  var ChangeStatusActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      status: { type: String, required: true }
    },
    data() {
      return {
        localStatus: this.status
      };
    },
    emits: ["update:enabled", "update:status"],
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `,
    computed: {
      selected: {
        get() {
          if (this.localStatus === "nochange") {
            return "nochange";
          }
          const itemData = this.caseStatusItems.flatMap((item) => isMenuGroupData(item) ? item.items : [item]).find((item) => item.value === this.status);
          return itemData?.value ?? null;
        },
        set(value) {
          if (value === null) {
            return;
          }
          this.localStatus = String(value);
          if (value !== "nochange") {
            this.$emit("update:status", String(value));
          }
        }
      },
      caseStatusItems() {
        const mainItems = [];
        const clerkItems = [];
        const cuItems = [];
        const deferItems = [];
        const isCheckuser = spiHelperIsCheckuser();
        const isClerk = spiHelperIsClerk();
        const cuRequested = /^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.status);
        const cuEndorsed = /^endorsed?$/i.test(this.status);
        const cuCompleted = /^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclin(ed)?)$/i.test(this.status);
        mainItems.push({ label: "No change", value: "nochange" });
        if (spiHelperCaseClosedRegex.test(this.status)) {
          mainItems.push({ label: "Reopen", value: "reopen" });
        } else {
          mainItems.push({ label: "Open", value: "open" });
        }
        mainItems.push({ label: "Close", value: "closed" });
        cuItems.push({ label: "Request CheckUser", value: "CUrequest" });
        if (isCheckuser) {
          cuItems.push({ label: "Check in progress", value: "inprogress" });
        }
        if (isClerk) {
          cuItems.push({ label: "Request and self-endorse", value: "selfendorse" });
          clerkItems.push({ label: "Request more information", value: "moreinfo" });
          if (isCheckuser) {
            cuItems.push({ label: "Mark as checked", value: "checked" });
          }
          if (cuCompleted) {
            cuItems.push({ label: "Relist for another check", value: "relist" });
          }
        }
        if (isClerk) {
          if (cuRequested) {
            if (isCheckuser) {
              cuItems.push({ label: "Endorse CheckUser", value: "cuendorse" });
              cuItems.push({ label: "Decline CheckUser", value: "cudecline" });
            } else {
              cuItems.push({ label: "Endorse for CheckUser attention", value: "endorse" });
              cuItems.push({ label: "Decline CheckUser", value: "decline" });
            }
            clerkItems.push({ label: "Request more information for CheckUser", value: "cumoreinfo" });
          } else if (cuEndorsed) {
            if (spiHelperIsCheckuser()) {
              cuItems.push({ label: "Decline CheckUser", value: "cudecline" });
            } else {
              cuItems.push({ label: "Decline CheckUser", value: "decline" });
            }
            clerkItems.push({ label: "Request more information for CheckUser", value: "cumoreinfo" });
          }
        }
        if (isCheckuser) {
          clerkItems.push({ label: "Place case on CU hold", value: "cuhold" });
        } else {
          clerkItems.push({ label: "Place case on hold", value: "hold" });
        }
        deferItems.push({ label: "Request clerk action", value: "clerk" });
        if (spiHelperIsAdmin() || isClerk) {
          deferItems.push({ label: "Request admin action", value: "admin" });
        }
        const groups = [
          clerkItems.length ? { label: "Clerking", items: clerkItems } : null,
          cuItems.length ? { label: "CheckUser", items: cuItems } : null,
          deferItems.length ? { label: "Deferral", items: deferItems } : null
        ].filter((g) => g !== null);
        return [...mainItems, ...groups];
      }
    },
    methods: {}
  });
  // src/ui/views/top/actions/blockAction.ts
  var BlockActionComponent = defineComponent({
    props: {
      modelValue: { type: Array, required: true },
      blockOptions: { type: Object, required: true },
      userLocks: { type: Map, required: true },
      enabled: { type: Boolean, required: true }
    },
    data() {
      const columns = [
        { id: "username", label: "Username" },
        { id: "tag", label: "Tag" },
        { id: "altmaster", label: "Alternate Master Tag" },
        { id: "lock", label: "Request Lock" }
      ];
      const isAdmin = spiHelperIsAdmin();
      const isCheckuser = spiHelperIsCheckuser();
      const isClerk = spiHelperIsClerk();
      if (isAdmin) {
        columns.splice(1, 0, ...[
          { id: "block", label: "Block" },
          { id: "duration", label: "Duration" },
          { id: "acb", label: "ACB" },
          { id: "abao", label: "AB/AO" },
          { id: "ntp", label: "NTP" },
          { id: "nem", label: "NEM" }
        ]);
      }
      const tagOptions = [
        { value: "none", label: "None" },
        {
          label: "Sock",
          items: [
            { value: "Ssuspected", label: "S-Suspected" },
            { value: "Sproven", label: "S-Proven" },
            { value: "Sconfirmed", label: "S-Confirmed" }
          ]
        },
        {
          label: "Master",
          items: [
            { value: "Mblocked", label: "M-Blocked" },
            { value: "Mconfirmed", label: "M-Confirmed" },
            { value: "Mbanned", label: "M-3X Banned" }
          ]
        }
      ];
      const altmasterOptions = [
        { value: "none", label: "None" },
        { value: "suspected", label: "Suspected" },
        { value: "proven", label: "Proven" }
      ];
      const allTagSelections = {
        tag: "none",
        altmaster: "none"
      };
      const selectedRows = [];
      const topButtonActions = { copied: false, fetched: false };
      return {
        columns,
        tagOptions,
        altmasterOptions,
        allTagSelections,
        selectedRows,
        topButtonActions,
        isAdmin,
        isCheckuser,
        isClerk,
        cdxIconCopy: p4,
        cdxIconDownload: u4,
        cdxIconTrash: F8
      };
    },
    emits: ["update:enabled", "update:modelValue", "update:blockOptions", "removeRows", "addRow", "userSelected", "usernameChanged", "fetchRows"],
    template: `
    <!--suppress VueUnrecognizedDirective, VueUnrecognizedSlot -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <div role="group" aria-labelledby="spiHelper-blockoptions-group-label" class="spiHelper-blockoptions-group">
        <cdx-label id="spiHelper-blockoptions-group-label">
          {{ isAdmin ? 'Block Options' : 'Tag Options' }}
        </cdx-label>

        <cdx-checkbox v-model="blockOptionsLocal.noBlock" v-if="isAdmin">
          Do not make any blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.override" v-if="isAdmin" :disabled="blockOptionsLocal.noBlock">
          Override any existing blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.tagUnattached" v-if="isClerk">
          Tag accounts without an attached local account
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.cuBlock" v-if="isCheckuser">
          Mark blocks as Checkuser blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.cuBlockOnly" v-if="isCheckuser" :disabled="!blockOptionsLocal.cuBlock">
          <span v-pre>
            Suppress the usual block summary and only use {{checkuserblock-account}} and {{checkuserblock}}
          </span>
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.addMasterNotice" v-if="isAdmin">
          Add talk page notice when (re)blocking the sockmaster
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.addSockNotice" v-if="isAdmin">
          Add talk page notice when blocking socks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.blankTalk" v-if="isAdmin">
          Blank the talk page when adding talk notices
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptionsLocal.lockHideNames">
          Hide usernames when requesting global locks
        </cdx-checkbox>
      </div>
      <cdx-table caption="Socks" :show-vertical-borders="true" :use-row-selection="true"
                 :columns="columns" :data="modelValue" v-model:selected-rows="selectedRows"
                 class="spiHelper-sockTable">
        <template #header>
          <div class="header-content">
            <span>
              {{ selectedRows.length }} sock{{ selectedRows.length === 1 ? '' : 's' }} selected
            </span>
            <span class="header-content-buttons">
              <cdx-button @click="copySocks" aria-label="Copy socks">
                <cdx-icon :icon="cdxIconCopy" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.copied" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('copied')" @auto-dismissed="onMessageDismissed('copied')"
                           :inline="true">Copied!</cdx-message>
              <cdx-button @click="fetchSocks" aria-label="Fetch socks from comment">
                <cdx-icon :icon="cdxIconDownload" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.fetched" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('fetched')"
                           @auto-dismissed="onMessageDismissed('fetched')"
                           :inline="true">Fetched from comment!</cdx-message>
              <cdx-button @click="removeSocks" action="destructive" aria-label="Remove selected rows">
                <cdx-icon :icon="cdxIconTrash" />
              </cdx-button>
            </span>
          </div>
        </template>
        <template #thead>
          <thead>
          <tr>
            <th class="cdx-table__table__select-rows" :rowspan="isAdmin ? 2 : 1">
              <cdx-checkbox
                  v-model="selectAll"
                  :hide-label="true"
                  :indeterminate="selectAllIndeterminate"
                  @update:model-value="handleSelectAll"
              >
                Select all
              </cdx-checkbox>
            </th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1">Username</th>
            <th scope="col" rowspan="2" v-if="isAdmin" class="checkboxHeader">Block</th>
            <th scope="col" rowspan="2" v-if="isAdmin" style="width: 300px;">Duration</th>
            <th scope="colgroup" colspan="4" v-if="isAdmin">Block Settings</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="selectHeader">Tag</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="selectHeader">Alternate Master Tag</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="checkboxHeader">Lock</th>
          </tr>
          <tr v-if="isAdmin" class="blockSettingsRow">
            <th scope="col" v-tooltip="'Account Creation Blocked'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              ACB
            </th>
            <th scope="col" class="spihelper-hovertext cdx-table__table__cell--align-center">
              <span v-tooltip="'Autoblock (for logged-in users)'">AB</span>
              /
              <span v-tooltip="'Anonymous-only (for IPs)'">AO</span>
            </th>
            <th scope="col" v-tooltip="'Disable talkpage access'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              NTP
            </th>
            <th scope="col" v-tooltip="'Disable email'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              NEM
            </th>
          </tr>
          <tr class="setAllRow">
            <th scope="col" style="border-right: none;" />
            <!-- Do this instead of rowspan="2" to align it properly -->
            <th scope="col" style="min-width: 150px;">(all users)</th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('block', $event)">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAll('duration', $event)" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('acb', $event)">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('abao', $event)">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('ntp', $event)">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('nem', $event)">
                Set all no email
              </cdx-checkbox>
            </th>

            <th scope="col" class="selectTagOptions">
              <cdx-select :menu-items="tagOptions" v-model:selected="allTagSelections.tag"
                          @update:selected="setAll('tag', $event)" />
            </th>
            <th scope="col" class="selectTagOptions">
              <cdx-select :menu-items="altmasterOptions" v-model:selected="allTagSelections.altmaster"
                          @update:selected="setAll('altmaster', $event)" />
            </th>

            <th scope="col">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('lock', $event)">
                Set all request locks
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)"
                       @update:model-value="handleUsernameChange($event, row)" />
        </template>

        <template #item-block="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block" :disabled="blockOptionsLocal.noBlock">Block</cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.duration" :shortened="true" :auto-dismiss="true" placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.acb">Account creation blocked</cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.abao">Autoblock/Anon-only</cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.ntp">No talk page</cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.nem">No email</cdx-checkbox>
        </template>

        <template #item-tag="{ item, row }">
          <cdx-select :menu-items="tagOptions" v-model:selected="row.tag"
                      :disabled="isNonRegisteredAccount(row.username)" class="tagOptions" />
        </template>

        <template #item-altmaster="{ item, row }">
          <cdx-select :menu-items="altmasterOptions" v-model:selected="row.altmaster"
                      :disabled="isNonRegisteredAccount(row.username)" />
        </template>

        <template #item-lock="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.lock"
                        :disabled="isNonRegisteredAccount(row.username) || userLocks.get(row.username) === true">
            Request lock
          </cdx-checkbox>
        </template>

        <template #footer>
          <cdx-button @click="addDefaultRow">Add Row</cdx-button>
        </template>
      </cdx-table>
    </action-container>
  `,
    computed: {
      selectAll() {
        return this.selectedRows.length === this.modelValue.length;
      },
      selectAllIndeterminate() {
        if (this.selectedRows.length === this.modelValue.length) {
          return false;
        } else
          return this.selectedRows.length !== 0;
      },
      blockOptionsLocal: {
        get() {
          return this.blockOptions;
        },
        set(value) {
          this.$emit("update:blockOptions", value);
        }
      }
    },
    methods: {
      isNonRegisteredAccount,
      async copySocks() {
        if (this.selectedRows.length === 0) {
          return;
        }
        let text = "{{sock list";
        this.selectedRows.forEach((row, index) => {
          const rowData = this.modelValue[row];
          if (!rowData)
            return;
          text += `|${index + 1}=${rowData.username}`;
        });
        text += "}}";
        await navigator.clipboard.writeText(text);
        this.topButtonActions.copied = true;
      },
      onMessageDismissed(actionType) {
        setTimeout(() => {
          this.topButtonActions[actionType] = false;
        }, 200);
      },
      removeSocks() {
        this.$emit("removeRows", this.selectedRows);
        this.selectedRows = [];
      },
      addDefaultRow() {
        this.$emit("addRow");
      },
      handleSelectAll(newValue) {
        this.selectAllIndeterminate = false;
        if (newValue) {
          this.selectedRows = this.modelValue.map((_row, index) => index);
        } else {
          this.selectedRows = [];
        }
      },
      handleUserSelected(data, row) {
        HandleUserSelected(data, row);
      },
      handleUsernameChange(username, row) {
        this.$emit("usernameChanged", username, this.modelValue.findIndex((item) => item.username === row.username));
      },
      setAll(key, value) {
        for (const row of this.modelValue) {
          if (key === "lock" && this.userLocks.get(row.username) === true) {
            continue;
          }
          row[key] = value;
        }
      },
      fetchSocks() {
        this.topButtonActions.fetched = true;
        this.$emit("fetchRows");
      }
    }
  });
  // src/constants/linkview.ts
  var spiHelperLinkViewURLFormats = {
    editorInteractionAnalyser: {
      baseUrl: new URL("https://sigma.toolforge.org/editorinteract.py"),
      userQueryStringKey: "users",
      userQueryStringSeparator: "&",
      userQueryStringWrapper: "",
      multipleUserQueryStringKeys: true
    },
    interactionTimeline: {
      baseUrl: new URL("https://interaction-timeline.toolforge.org"),
      startingParams: new URLSearchParams("wiki=enwiki"),
      userQueryStringKey: "user",
      userQueryStringSeparator: "&",
      userQueryStringWrapper: "",
      multipleUserQueryStringKeys: true
    },
    SPITools: {
      timecard: {
        baseUrl: new URL("https://spi-tools.toolforge.org/spi/timecard/" + context.caseName),
        userQueryStringKey: "users",
        userQueryStringSeparator: "&",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: true
      },
      consolidatedTimeline: {
        baseUrl: new URL("https://spi-tools.toolforge.org/spi/timeline/" + context.caseName),
        userQueryStringKey: "users",
        userQueryStringSeparator: "&",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: true
      },
      pages: {
        baseUrl: new URL("https://spi-tools.toolforge.org/spi/pages/" + context.caseName),
        userQueryStringKey: "users",
        userQueryStringSeparator: "&",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: true
      }
    },
    sandals: {
      timecard: {
        baseUrl: new URL("https://sandals.toolforge.org/timecard"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      },
      consolidatedTimeline: {
        baseUrl: new URL("https://sandals.toolforge.org/timeline"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      },
      pages: {
        baseUrl: new URL("https://sandals.toolforge.org/pages"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      },
      summaries: {
        baseUrl: new URL("https://sandals.toolforge.org/summaries"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      }
    },
    checkUserWikiSearch: {
      baseUrl: new URL("https://checkuser.wikimedia.org/w/index.php"),
      startingParams: new URLSearchParams("ns0=1"),
      userQueryStringKey: "search",
      userQueryStringSeparator: " OR ",
      userQueryStringWrapper: '"',
      multipleUserQueryStringKeys: false
    }
  };

  // src/ui/views/top/actions/linkAction.ts
  var LinkActionComponent = defineComponent({
    props: {
      modelValue: { type: Array, required: true },
      enabled: { type: Boolean, required: true }
    },
    data() {
      const columns = [
        { id: "username", label: "Username" },
        { id: "analyser", label: "Interaction Analyser" },
        { id: "timeline", label: "Timeline" },
        { id: "timecard", label: "Timecard" },
        { id: "pages", label: "Pages" },
        { id: "summary", label: "Summaries" },
        { id: "cuwiki", label: "CU wiki" }
      ];
      const optionColumns = columns.slice(1);
      const selectedRows = [];
      return {
        columns,
        optionColumns,
        selectedRows,
        cdxIconAdd: k3,
        cdxIconTrash: F8
      };
    },
    emits: ["update:enabled", "update:modelValue", "removeRows", "addRow", "userSelected", "usernameChanged"],
    template: `
    <!--suppress VueUnrecognizedDirective -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-table :hide-caption="false" caption="Links" :use-row-selection="true"
                 :columns="columns" :data="modelValue" v-model:selected-rows="selectedRows"
                 class="spiHelper-sockTable linkTable">
        <template #header>
          <div class="header-content">
            <span>
              {{ selectedRows.length }} row{{ selectedRows.length === 1 ? '' : 's' }} selected
            </span>
            <span class="header-content-buttons">
              <cdx-button action="progressive" @click="addDefaultRow" aria-label="Add row">
                <cdx-icon :icon="cdxIconAdd" />
              </cdx-button>
              <cdx-button @click="removeRows" action="destructive" aria-label="Remove selected rows">
                <cdx-icon :icon="cdxIconTrash" />
              </cdx-button>
            </span>
          </div>
        </template>
        <template #thead>
          <thead>
          <tr>
            <th class="cdx-table__table__select-rows">
              <cdx-checkbox
                  v-model="selectAll"
                  :hide-label="true"
                  :indeterminate="selectAllIndeterminate"
                  @update:model-value="handleSelectAll"
              >
                Select all rows
              </cdx-checkbox>
            </th>
            <th scope="col">Username</th>
            <th v-for="column in optionColumns" :key="column.id">
              {{ column.label }}
            </th>
          </tr>
          <tr class="setAllRow">
            <th scope="col">
              <cdx-checkbox
                  :hide-label="true" :model-value="allColumnsChecked"
                  :indeterminate="allColumnsIndeterminate" @update:model-value="toggleAllColumns">
                Select all columns
              </cdx-checkbox>
            </th>
            <th scope="col" style="padding-left: 12px; min-width: 155px;">(all users)</th>
            <th v-for="column in optionColumns" :key="column.id">
              <cdx-checkbox
                  :hide-label="true" :model-value="columnState[column.id].checked"
                  :indeterminate="columnState[column.id].indeterminate"
                  @update:model-value="toggleColumn(column.id, $event)">
                Toggle all rows for {{ column.label }}
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)"
                       @update:model-value="handleUsernameChange($event, row)" />
        </template>

        <template #item-analyser="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.analyser">Editor interaction analyser</cdx-checkbox>
        </template>
        <template #item-timeline="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.timeline">Consolidated timeline</cdx-checkbox>
        </template>
        <template #item-timecard="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.timecard">Timecard</cdx-checkbox>
        </template>
        <template #item-pages="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.pages">Pages</cdx-checkbox>
        </template>
        <template #item-summary="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.summary">Summaries</cdx-checkbox>
        </template>
        <template #item-cuwiki="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.cuwiki">CheckUser wiki</cdx-checkbox>
        </template>
      </cdx-table>
      <ul>
        <li v-for="linkItem in linkItems" :key="linkItem.label">
          <a :href="linkItem.url.href">{{ linkItem.label }}</a>
        </li>
      </ul>
    </action-container>
  `,
    watch: {
      selectedRows(newValue, oldValue) {
        const oldSet = new Set(oldValue);
        const newSet = new Set(newValue);
        const toggle = (index, enabled) => {
          const row = this.modelValue[index];
          if (row)
            this.toggleRow(row, enabled);
        };
        for (const index of newSet) {
          if (!oldSet.has(index))
            toggle(index, true);
        }
        for (const index of oldSet) {
          if (!newSet.has(index))
            toggle(index, false);
        }
      }
    },
    methods: {
      handleSelectAll(newValue) {
        if (newValue) {
          this.selectedRows = this.modelValue.map((_row, index) => index);
        } else {
          this.selectedRows = [];
        }
      },
      handleUserSelected(data, row) {
        this.$emit("userSelected", data, this.modelValue.findIndex((item) => item.username === row.username));
      },
      handleUsernameChange(username, row) {
        this.$emit("usernameChanged", username, this.modelValue.findIndex((item) => item.username === row.username));
      },
      addDefaultRow() {
        this.$emit("addRow");
      },
      removeRows() {
        this.$emit("removeRows", this.selectedRows);
        this.selectedRows = [];
      },
      toggleColumn(key, value) {
        for (const row of this.modelValue) {
          row[key] = value;
        }
      },
      toggleAllColumns(value) {
        for (const column of this.optionColumns) {
          this.toggleColumn(column.id, value);
        }
      },
      toggleRow(row, value) {
        for (const col of this.optionColumns) {
          row[col.id] = value;
        }
      },
      getLinkFormat(columnId) {
        switch (columnId) {
          case "analyser":
            return spiHelperLinkViewURLFormats.editorInteractionAnalyser;
          case "cuwiki":
            return spiHelperLinkViewURLFormats.checkUserWikiSearch;
          case "pages":
            return spiHelperLinkViewURLFormats.sandals.pages;
          case "summary":
            return spiHelperLinkViewURLFormats.sandals.summaries;
          case "timecard":
            return spiHelperLinkViewURLFormats.sandals.timecard;
          case "timeline":
            return spiHelperLinkViewURLFormats.sandals.consolidatedTimeline;
          default:
            return null;
        }
      }
    },
    computed: {
      columnState() {
        const rows = this.modelValue;
        const state = {};
        for (const column of this.optionColumns) {
          if (rows.length === 0) {
            state[column.id] = {
              checked: false,
              indeterminate: false
            };
            continue;
          }
          const values = rows.map((r) => r[column.id]);
          const all = values.every(Boolean);
          const none = values.every((v) => !v);
          state[column.id] = {
            checked: all,
            indeterminate: !all && !none
          };
        }
        return state;
      },
      allColumnsChecked() {
        return this.modelValue.length > 0 && this.optionColumns.every((k) => this.columnState[k.id].checked);
      },
      allColumnsIndeterminate() {
        const checkedCount = this.optionColumns.filter((k) => this.columnState[k.id].checked).length;
        return checkedCount > 0 && checkedCount < this.optionColumns.length;
      },
      linkItems() {
        const result = {};
        for (const linkColumn of this.optionColumns) {
          const linkFormat = this.getLinkFormat(linkColumn.id);
          if (linkFormat === null) {
            console.error("Couldn't find link format for", linkColumn.id);
            continue;
          }
          const resultUrl = new URL(linkFormat.baseUrl.href);
          const includedUsers = this.modelValue.reduce((accumulator, row) => {
            if (row[linkColumn.id]) {
              accumulator.push(linkFormat.userQueryStringWrapper + row.username + linkFormat.userQueryStringWrapper);
            }
            return accumulator;
          }, []);
          if (includedUsers.length === 0) {
            continue;
          }
          if (linkFormat.multipleUserQueryStringKeys) {
            for (const username of includedUsers) {
              resultUrl.searchParams.append(linkFormat.userQueryStringKey, username);
            }
          } else {
            resultUrl.searchParams.set(linkFormat.userQueryStringKey, includedUsers.join(linkFormat.userQueryStringSeparator));
          }
          result[linkColumn.id] = { url: resultUrl, label: linkColumn.label };
        }
        return result;
      },
      selectAll() {
        return this.modelValue.length > 0 && this.selectedRows.length === this.modelValue.length;
      },
      selectAllIndeterminate() {
        if (this.selectedRows.length === this.modelValue.length) {
          return false;
        } else
          return this.selectedRows.length !== 0;
      }
    }
  });
  // src/ui/views/top/actions/managementAction.ts
  var ManagementActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      flags: { type: Set, required: true }
    },
    data() {
      const archiveNoticeFlags = [
        { value: "crosswiki", label: "Cross-wiki" },
        { value: "deny", label: "Deny" },
        { value: "notalk", label: "No talkpage access" },
        { value: "moot", label: "Moot" }
      ];
      return {
        archiveNoticeFlags
      };
    },
    emits: ["update:enabled", "update:flags"],
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `,
    computed: {
      internalFlags: {
        get() {
          return Array.from(this.flags);
        },
        set(newValue) {
          this.$emit("update:flags", new Set(newValue));
        }
      }
    }
  });
  // src/ui/views/expiryInput.ts
  var ExpiryInputComponent = defineComponent({
    props: {
      modelValue: { type: String, required: false, default: "" },
      label: { type: String, required: false },
      touched: { type: Boolean, default: false },
      shortened: { type: Boolean, default: false },
      autoDismiss: { type: Boolean, default: false }
    },
    inheritAttrs: false,
    emits: ["update:touched"],
    data() {
      return {
        messages: {
          warning: this.shortened ? "Invalid" : "Expiry option is invalid",
          success: this.shortened ? "Valid" : "Valid expiry option"
        },
        showSuccess: !this.autoDismiss,
        internalTouched: this.touched,
        successTimeout: null
      };
    },
    computed: {
      valid() {
        return parseExpiry(this.modelValue) !== null;
      },
      status() {
        if (!this.internalTouched || this.modelValue.length === 0)
          return "default";
        if (this.valid) {
          return this.showSuccess ? "success" : "default";
        } else {
          return "warning";
        }
      }
    },
    watch: {
      modelValue() {
        this.internalTouched = true;
        if (!this.autoDismiss) {
          return;
        }
        if (this.successTimeout) {
          clearTimeout(this.successTimeout);
        }
        if (this.valid) {
          this.showSuccess = true;
          this.successTimeout = window.setTimeout(() => {
            this.showSuccess = false;
          }, 3000);
        }
      },
      internalTouched(newValue) {
        this.$emit("update:touched", newValue);
      }
    },
    template: `
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" v-bind="$attrs" />
    </cdx-field>
  `,
    beforeUnmount() {
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
    }
  });

  // src/ui/views/top/actions/archiveAction.ts
  var ArchiveActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      status: { type: String, required: true },
      selection: { type: Object, required: true }
    },
    emits: ["update:enabled"],
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus" type="warning" :inline="true">
      The selected section status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
  `,
    computed: {
      badStatus() {
        return this.selection !== "all" && this.status !== "closed";
      }
    }
  });

  // src/ui/views/top/actions/moveAction.ts
  var MoveActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      target: { type: String, required: true },
      selection: { type: Object, required: true },
      archiveEnabled: { type: Boolean, required: true }
    },
    emits: ["update:enabled", "update:target"],
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);"
                    :disabled="disabled">
      <h3>Moving {{ moveTitle }}</h3>
      <page-lookup :model-value="this.target" @update:model-value="this.$emit('update:target', $event)"
                   :namespace="4" prefix="Sockpuppet investigations/"
                   placeholder="Title" label="New Case Name" />
      <cdx-message v-if="isSectionMove" type="notice" :allow-user-dismiss="true" style="margin-top: 16px;">
        <p><strong>You are moving a section</strong></p>
        <p>Make sure you are expecting to only move the section and not the entire case.</p>
      </cdx-message>
    </action-container>
    <cdx-message v-if="isSectionMove && !allowSectionMoves" type="error" :inline="true">
      You do not yet understand section moves. You probably want to move the entire case.
    </cdx-message>
    <cdx-message v-if="archiveEnabled" type="warning" :inline="true">
      Archival is enabled, which overrides moving.
    </cdx-message>
  `,
    computed: {
      allowSectionMoves() {
        return this.selectionType === "all" || this.isSectionMove && spiHelperSettings.iUnderstandSectionMoves;
      },
      isSectionMove() {
        return this.selectionType === "specific";
      },
      moveTitle() {
        if (!this.selection) {
          return "ERROR";
        }
        if (this.selection.type === "all") {
          return "entire case";
        }
        return "section " + this.selection.section.name;
      },
      disabled() {
        return this.archiveEnabled || this.isSectionMove && !this.allowSectionMoves;
      },
      selectionType() {
        return this.selection?.type ?? null;
      }
    },
    watch: {
      selectionType: {
        handler(newType) {
          if (newType === "specific") {
            if (!this.allowSectionMoves) {
              this.$emit("update:enabled", false);
            }
          }
        },
        immediate: true
      },
      archiveEnabled: {
        handler(enabled) {
          if (enabled) {
            this.$emit("update:enabled", false);
          }
        },
        immediate: true
      }
    }
  });

  // src/ui/views/pageLookup.ts
  var ITEM_LIMIT2 = 10;
  var PageLookupComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      placeholder: { type: String, default: "Page" },
      label: { type: String, default: null },
      namespace: { type: Number, required: true },
      prefix: { type: String, default: "" }
    },
    emits: ["update:modelValue"],
    data() {
      const menuConfig = {
        visibleItemLimit: 6,
        searchQuery: ""
      };
      const messages2 = {
        success: "Page exists",
        warning: "Page not found"
      };
      return {
        lookupStatus: "default",
        messages: messages2,
        pageSuggestions: [],
        useLookup: spiHelperSettings.useLookup,
        selection: null,
        menuConfig
      };
    },
    template: `
    <cdx-field :status="lookupStatus" :messages="messages" :hide-label="!label">
      <template v-if="label" #label>
        {{ label }}
      </template>
      <cdx-lookup
          v-if="useLookup"
          v-model:selected="selection"
          v-model:input-value="pagename"
          :menu-items="pageSuggestions"
          :menu-config="menuConfig"
          :placeholder="placeholder"
          @update:input-value="onUpdateInputValue"
          @load-more="onLoadMore"
          @focus="onLoadMore"
          @update:selected="onSelection"
          @blur="validateInstantly"
          @keydown.enter="validateInstantly"
          @clear="validateInstantly"
          clearable
      >
        <template #no-results>
          No pages found
        </template>
      </cdx-lookup>
      <cdx-text-input v-else v-model="pagename" :placeholder="placeholder" clearable />
    </cdx-field>
  `,
    methods: {
      async onUpdateInputValue(value) {
        this.menuConfig.searchQuery = value;
        if (!value) {
          this.pageSuggestions = [];
          return;
        }
        await this.$nextTick(() => {
          spiHelperGetPages(this.fullPagename, 4, ITEM_LIMIT2).then((pages) => {
            if (this.pagename !== value) {
              return;
            }
            if (pages.length === 0) {
              this.pageSuggestions = [];
              return;
            }
            this.pageSuggestions = pages.filter((page) => !page.title.includes("/Archive")).map((page) => ({
              label: this.stripTitle(page.title),
              value: page.pageid.toString()
            }));
          }).catch(() => {
            this.pageSuggestions = [];
          });
        });
      },
      onLoadMore() {
        if (!this.pagename) {
          return;
        }
        spiHelperGetPages(this.fullPagename, 4, this.pageSuggestions.length + ITEM_LIMIT2).then((pages) => {
          if (pages.length === 0) {
            return;
          }
          this.pageSuggestions = pages.filter((page) => !page.title.includes("/Archive")).map((page) => ({
            label: this.stripTitle(page.title),
            value: page.pageid.toString()
          }));
        }, () => {});
      },
      async validateInstantly() {
        await this.$nextTick(() => {
          if (this.pagename.length === 0) {
            this.lookupStatus = "default";
            return;
          }
          const selection = this.pageSuggestions.find((item) => item.label === this.pagename) ?? null;
          if (selection !== null) {
            this.selection = selection.value;
          }
          this.lookupStatus = this.selection === null ? "warning" : "success";
        });
      },
      onSelection(newSelection) {
        if (newSelection !== null) {
          this.lookupStatus = "success";
        }
      },
      stripTitle(fullTitle) {
        return fullTitle.split(this.prefix)[1] ?? fullTitle;
      }
    },
    computed: {
      pagename: {
        get() {
          return this.modelValue;
        },
        set(value) {
          this.$emit("update:modelValue", value);
        }
      },
      fullPagename() {
        return `${this.prefix}${this.pagename}`;
      }
    }
  });

  // src/ui/views/top/submitForm.ts
  var SubmitFormComponent = defineComponent({
    props: {
      state: { type: Object, required: true },
      socks: { type: Array, required: true },
      locks: { type: Map, required: true },
      master: { type: String, required: true },
      altmaster: { type: String, required: true },
      lockComment: { type: String, required: true },
      allDisabled: { type: Boolean, required: true }
    },
    data() {
      const cancelAction = { label: "Cancel" };
      const continueAction = { label: "Continue", actionType: "progressive" };
      return {
        popover: {
          show: false,
          revId: 0,
          cancelAction,
          continueAction
        },
        submitElement: null,
        cdxIconUpdate: T8
      };
    },
    emits: ["update:master", "update:altmaster", "update:lockComment", "onSubmit"],
    template: `
    <div class="spiHelper-submitForm">
      <user-lookup v-if="needsSockmaster" label="Master" v-model="masterValue" />
      <user-lookup v-if="needsAltmaster" label="Alternate master" v-model="altmasterValue" />
      <cdx-field v-if="needsLockComment">
        <template #label>Lock Comment</template>
        <template #description>Optional comment to include in the global lock request</template>
        <cdx-text-input v-model="lockCommentValue" placeholder="Comment" />
      </cdx-field>
      <cdx-button ref="submitElement" action="progressive" weight="primary" @click="onSubmit" :disabled="disableButton">
        Submit
      </cdx-button>
      <cdx-popover :anchor="submitElement"
                   v-model:open="popover.show" :icon="cdxIconUpdate" title="Edit Conflict"
                   close-button-label="Cancel"
                   :primary-action="popover.continueAction" @primary="confirmSubmit"
                   :default-action="popover.cancelAction" @default="popover.show = false">
        The page has been edited after you loaded it. Do you want to continue?
      </cdx-popover>
    </div>
  `,
    computed: {
      needsAltmaster() {
        return this.socks.some((sock) => sock.altmaster !== "none" && !isNonRegisteredAccount(sock.username));
      },
      needsSockmaster() {
        return this.socks.some((sock) => sock.tag.startsWith("S") && !isNonRegisteredAccount(sock.username));
      },
      needsLockComment() {
        return this.socks.some((sock) => sock.lock && !isNonRegisteredAccount(sock.username) && this.locks.get(sock.username) !== true);
      },
      disableButton() {
        return isOpRunning("mainActions") || this.allDisabled || this.needsSockmaster && !this.master || this.needsAltmaster && !this.altmaster;
      },
      masterValue: {
        get() {
          return this.master;
        },
        set(value) {
          this.$emit("update:master", value);
        }
      },
      altmasterValue: {
        get() {
          return this.altmaster;
        },
        set(value) {
          this.$emit("update:altmaster", value);
        }
      },
      lockCommentValue: {
        get() {
          return this.lockComment;
        },
        set(value) {
          this.$emit("update:lockComment", value);
        }
      }
    },
    methods: {
      async onSubmit() {
        this.popover.revId = await spiHelperGetPageRev(context.pageName);
        if (this.popover.revId === context.startingRevId) {
          this.$emit("onSubmit");
        } else {
          this.popover.show = true;
        }
      },
      confirmSubmit() {
        this.popover.show = false;
        context.startingRevId = this.popover.revId;
        this.state.selectedSection?.type === "specific" ? loadSectionText(this.state.selectedSection.section, { purge: true }) : loadCaseText(this.state, { purge: true });
        this.$emit("onSubmit");
      }
    },
    mounted() {
      this.submitElement = this.$refs.submitElement;
    }
  });

  // src/ui/views/top/actionContent.ts
  var ActionContentComponent = defineComponent({
    props: {
      name: { type: String, required: true },
      caseActions: { type: Object, required: true },
      state: { type: Object, required: true },
      menuItems: { type: Array, required: true },
      currentStatus: { type: String, required: true }
    },
    emits: [
      "update-section-selection",
      "block-username-change",
      "link-username-change",
      "link-username-selected",
      "remove-rows",
      "add-row",
      "fetch-rows"
    ],
    methods: {
      handleUpdateSectionSelection(selection) {
        this.$emit("update-section-selection", selection);
      },
      handleBlockUsernameChange(username, index) {
        this.$emit("block-username-change", username, index);
      },
      handleLinkUsernameChange(username, index) {
        this.$emit("link-username-change", username, index);
      },
      handleLinkUsernameSelected(data, index) {
        this.$emit("link-username-selected", data, index);
      },
      handleRemoveRows(indexes) {
        this.$emit("remove-rows", indexes);
      },
      handleAddRow(row) {
        this.$emit("add-row", row);
      },
      handleFetchRows() {
        this.$emit("fetch-rows");
      }
    },
    template: `
    <!-- Sections special case -->
    <div v-if="name === 'sections'">
      <cdx-select :menu-items="menuItems" v-model:selected="caseActions.sections.data.section"
                  @update:selected="handleUpdateSectionSelection" />
    </div>

    <!-- Other actions -->
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" />
    <change-status-action v-else-if="name === 'status'" v-model:enabled="caseActions.status.enabled"
                          v-model:status="caseActions.status.data.new" />
    <block-action v-else-if="name === 'block'" v-model:enabled="caseActions.block.enabled"
                  v-model="caseActions.block.data.accounts" v-model:block-options="caseActions.block.data.options"
                  :user-locks="caseActions.block.data.userlocks"
                  @username-changed="handleBlockUsernameChange"
                  @remove-rows="handleRemoveRows" @add-row="handleAddRow"
                  @fetch-rows="handleFetchRows" />
    <link-action v-else-if="name === 'link'" v-model:enabled="caseActions.link.enabled"
                 v-model="caseActions.link.data.rows"
                 @user-selected="handleLinkUsernameSelected" @username-changed="handleLinkUsernameChange"
                 @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="caseActions.sections.data.section"
                    :status="currentStatus" />
  `
  });

  // src/ui/views/OCAModal.ts
  var OneClickArchivalComponent = defineComponent({
    props: {
      state: { type: Object, required: true },
      activateButton: { type: Object, required: true }
    },
    data() {
      return {
        _activateHandler: null,
        open: false,
        archiving: false,
        messages
      };
    },
    template: `
    <cdx-dialog v-model:open="open" title="One Click Archival">
      <cdx-progress-bar v-if="archiving" aria-label="Archival in progress" />
      <div style="margin-top: 12px;">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </cdx-dialog>
  `,
    mounted() {
      this._activateHandler = () => {
        messages.length = 0;
        this.open = true;
        this.archiving = true;
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "oneclickarchive" });
        spiHelperOneClickArchive(this.state).then(() => {
          this.archiving = false;
        }, () => {});
      };
      this.activateButton.addEventListener("click", this._activateHandler);
    },
    beforeUnmount() {
      if (this._activateHandler) {
        this.activateButton.removeEventListener("click", this._activateHandler);
      }
    }
  });

  // src/spihelper.ts
  mw.loader.using(["vue", "@wikimedia/codex", "mediawiki.api", "mediawiki.util", "mediawiki.user", "mediawiki.feedback"], (require2) => {
    if (!mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/")) {
      return;
    }
    const Vue = require2("vue");
    const Codex = require2("@wikimedia/codex");
    const feedbackDialog = new mw.Feedback(FeedbackConfig);
    if (false) {} else if (true) {
      importStylesheet("User:DatGuy/spihelper.dev.css");
    } else {}
    const caseState = Vue.reactive(new CaseState);
    refreshSections(caseState);
    const loadedOptions = loadOptions();
    if (loadedOptions) {
      Object.assign(spiHelperSettings, loadedOptions);
    } else {
      (async () => {
        await migrateOptions();
        saveOptions();
      })();
    }
    const initLink = mw.util.addPortletLink("p-cactions", "#", "SPI-Beta", "ca-spiHelper", "Run spiHelper");
    if (initLink) {
      const mountPoint = document.createElement("div");
      mountPoint.setAttribute("id", "spiHelper-vue-mount-point");
      mw.util.$content.prepend(mountPoint);
      Vue.createMwApp(TopViewComponent, { state: caseState, feedbackDialog, openButton: initLink }).component("cdx-tabs", Codex.CdxTabs).component("cdx-tab", Codex.CdxTab).component("cdx-select", Codex.CdxSelect).component("cdx-card", Codex.CdxCard).component("cdx-toggle-switch", Codex.CdxToggleSwitch).component("cdx-text-area", Codex.CdxTextArea).component("cdx-toggle-button", Codex.CdxToggleButton).component("cdx-toggle-button-group", Codex.CdxToggleButtonGroup).component("cdx-button-group", Codex.CdxButtonGroup).component("cdx-button", Codex.CdxButton).component("cdx-icon", Codex.CdxIcon).component("cdx-table", Codex.CdxTable).component("cdx-text-input", Codex.CdxTextInput).component("cdx-checkbox", Codex.CdxCheckbox).component("cdx-lookup", Codex.CdxLookup).component("cdx-field", Codex.CdxField).component("cdx-message", Codex.CdxMessage).component("cdx-progress-bar", Codex.CdxProgressBar).component("cdx-progress-indicator", Codex.CdxProgressIndicator).component("cdx-accordion", Codex.CdxAccordion).component("cdx-label", Codex.CdxLabel).component("cdx-popover", Codex.CdxPopover).component("action-accordion", ActionAccordionComponent).component("action-button", ActionButtonComponent).component("action-container", ActionContainerComponent).component("action-content", ActionContentComponent).component("submit-form", SubmitFormComponent).component("comment-action", CommentActionComponent).component("change-status-action", ChangeStatusActionComponent).component("block-action", BlockActionComponent).component("link-action", LinkActionComponent).component("management-action", ManagementActionComponent).component("archive-action", ArchiveActionComponent).component("move-action", MoveActionComponent).component("user-lookup", UserLookupComponent).component("page-lookup", PageLookupComponent).component("expiry-input", ExpiryInputComponent).directive("tooltip", Codex.CdxTooltip).mount(mountPoint);
    }
    const settingsLink = mw.util.addPortletLink("p-cactions", "#", "SPI-Beta-Options", "ca-spiHelperOpts", "Modify spiHelper settings");
    if (settingsLink) {
      const mountPoint = document.body.appendChild(document.createElement("div"));
      Vue.createMwApp(OptionsComponent, { feedbackDialog, openButton: settingsLink }).component("cdx-button", Codex.CdxButton).component("cdx-dialog", Codex.CdxDialog).component("cdx-field", Codex.CdxField).component("cdx-select", Codex.CdxSelect).component("cdx-toggle-switch", Codex.CdxToggleSwitch).component("cdx-accordion", Codex.CdxAccordion).component("cdx-text-input", Codex.CdxTextInput).component("cdx-icon", Codex.CdxIcon).component("cdx-message", Codex.CdxMessage).component("watch-setting", WatchSettingComponent).component("expiry-setting", ExpirySettingComponent).component("expiry-input", ExpiryInputComponent).component("log-page-setting", LogPageSettingComponent).mount(mountPoint);
    }
    if (mw.config.get("wgCategories").includes("SPI cases awaiting archive") && spiHelperIsClerk()) {
      const oneClickArchiveLink = mw.util.addPortletLink("p-cactions", "#", "SPI-Beta-Archive", "ca-spiHelperArchive", "Run one click archival");
      if (oneClickArchiveLink) {
        const mountPoint = document.body.appendChild(document.createElement("div"));
        Vue.createMwApp(OneClickArchivalComponent, {
          state: caseState,
          activateButton: oneClickArchiveLink
        }).component("cdx-dialog", Codex.CdxDialog).component("cdx-message", Codex.CdxMessage).component("cdx-progress-bar", Codex.CdxProgressBar).mount(mountPoint);
      }
    }
    window.addEventListener("beforeunload", (e) => {
      if (hasRunningOps()) {
        e.preventDefault();
      }
    });
  });
})();

// </nowiki>
