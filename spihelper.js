// {{Wikipedia:USync|repo=https://github.com/DatGuy1/spihelper|ref=refs/heads/build/develop|path=spihelper.js}}
// v3.4.0
// <nowiki>
'use strict';
(() => {

  // src/constants/linkview.ts
  var spiHelperLinkViewURLFormats = {
    editorInteractionAnalyser: {
      baseUrl: (_caseName) => new URL("https://sigma.toolforge.org/editorinteract.py"),
      userQueryStringKey: "users",
      userQueryStringSeparator: "&",
      userQueryStringWrapper: "",
      multipleUserQueryStringKeys: true
    },
    interactionTimeline: {
      baseUrl: (_caseName) => new URL("https://interaction-timeline.toolforge.org"),
      startingParams: new URLSearchParams("wiki=enwiki"),
      userQueryStringKey: "user",
      userQueryStringSeparator: "&",
      userQueryStringWrapper: "",
      multipleUserQueryStringKeys: true
    },
    SPITools: {
      timecard: {
        baseUrl: (caseName) => new URL("https://spi-tools.toolforge.org/spi/timecard/" + caseName),
        userQueryStringKey: "users",
        userQueryStringSeparator: "&",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: true
      },
      consolidatedTimeline: {
        baseUrl: (caseName) => new URL("https://spi-tools.toolforge.org/spi/timeline/" + caseName),
        userQueryStringKey: "users",
        userQueryStringSeparator: "&",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: true
      },
      pages: {
        baseUrl: (caseName) => new URL("https://spi-tools.toolforge.org/spi/pages/" + caseName),
        userQueryStringKey: "users",
        userQueryStringSeparator: "&",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: true
      }
    },
    sandals: {
      timecard: {
        baseUrl: (_caseName) => new URL("https://sandals.toolforge.org/timecard"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      },
      consolidatedTimeline: {
        baseUrl: (_caseName) => new URL("https://sandals.toolforge.org/contributions"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      },
      pages: {
        baseUrl: (_caseName) => new URL("https://sandals.toolforge.org/pages"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      },
      summaries: {
        baseUrl: (_caseName) => new URL("https://sandals.toolforge.org/summaries"),
        userQueryStringKey: "users",
        userQueryStringSeparator: "|",
        userQueryStringWrapper: "",
        multipleUserQueryStringKeys: false
      }
    },
    checkUserWikiSearch: {
      baseUrl: (_caseName) => new URL("https://checkuser.wikimedia.org/w/index.php"),
      startingParams: new URLSearchParams("ns0=1"),
      userQueryStringKey: "search",
      userQueryStringSeparator: " OR ",
      userQueryStringWrapper: '"',
      multipleUserQueryStringKeys: false
    },
    interleaved: {
      baseUrl: (_caseName) => new URL("https://interleaved.toolforge.org/"),
      userQueryStringKey: "user",
      userQueryStringSeparator: "|",
      userQueryStringWrapper: "",
      multipleUserQueryStringKeys: false
    }
  };
  // src/constants/regex.ts
  var spiHelperCaseStatusRegex = /{{\s*SPI case status\s*\|?\s*(\S*?)\s*}}/i;
  var spiHelperCaseClosedRegex = /^closed?$/i;
  var spiHelperClerkStatusRegex = /{{(CURequest|awaitingadmin|clerk ?request|(?:self|requestand|cu-?)?endorse|inprogress|(?:cu\s?)?decline(?:-ip)?|(?:cu)?moreinfo|relisted|onhold)}}/i;
  var spiHelperSockSectionWithNewlineRegex = /====\s*Suspected sockpuppets\s*====\n*/i;
  var spiHelperAdminSectionWithPrecedingNewlinesRegex = /\s*====\s*<big>Clerk, CheckUser, and\/or patrolling admin comments<\/big>\s*====\s*/i;
  var spiHelperClosingRuleRegex = /\n*----(?!.*----)/s;
  var spiHelperCommentMarkerRegex = /<!-+ All comments go ABOVE this line, please. -+>/;
  var spiHelperCUBlockRegex = /{{(checkuserblock(-account|-wide)?|checkuser block)}}/i;
  var spiHelperArchiveNoticeRegex = /{{\s*SPI\s*archive notice\|(?:1=)?([^|]*?)(\|.*)?}}/i;
  var spiHelperArchiveNoticeNameRegex = /SPI\s*archive notice/i;
  var spiHelperSectionRegex = /^(?:===[^=]*===|=====[^=]*=====)\s*$/m;
  var spiHelperHiddenCharNormRegex = /\u200E/g;
  var spiHelperSignatureRegex = /(?<!~)~~~~(?!~)/;
  // src/constants/settings.ts
  function spiHelperAdvert(interwiki) {
    return ` (using [[${interwiki ? ":w:en:" : ""}WP:SPIH-D|SPIH-D]])`;
  }
  function getFeedbackConfig() {
    return {
      title: new mw.Title("User talk:DatGuy/spihelper"),
      bugsLink: "//github.com/DatGuy1/spihelper/issues/new",
      showUseragentCheckbox: true,
      useragentCheckboxMessage: "I want to share my user agent publicly alongside my feedback. This is optional."
    };
  }
  var VERSION = "3.4.0";
  var MODE = "dev";
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
    tickArchiveWhenCaseClosed: false,
    useCheckuserblockAccount: mw.config.get("wgUserGroups")?.includes("checkuser") ?? false,
    useLookup: true,
    defaultActions: ["comment"],
    interface: {
      defaultBlockDuration: "indefinite",
      displayIPv6As64: true,
      fullPreview: false,
      pinned: true,
      buttonLayout: false
    },
    highlightSection: true,
    custom: {
      commentTemplates: []
    },
    debug: {
      enabled: false,
      forceCheckuser: false,
      forceAdmin: false
    },
    lastSeenVersion: VERSION
  };
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
        { value: "{{ncip}}", label: "No comment for IPs" },
        { value: "{{ncta}}", label: "No comment for TAs" }
      ]
    },
    {
      label: "Novelties",
      items: [
        { value: "{{8ball}} ", label: "Magic 8-Ball" },
        { value: "{{crystalball}}", label: "Not a crystal ball" },
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
        { value: "{{GlobalLocksRequested}}", label: "Locks requested" },
        { value: "{{Decline-IP}}", label: "IP check declined" }
      ]
    }
  ];
  var spiHelperPaginationThreshold = 25;
  var spiHelperPaginationSizeOptions = [{ value: 25 }, { value: 50 }, { value: 100 }];
  // src/utils.ts
  var spiHelperXWikiPrefixes = ["m", "meta"];
  function spiHelperGetXWikiPrefix(title) {
    const colonIndex = title.indexOf(":");
    if (colonIndex === -1) {
      return null;
    }
    const prefix = title.slice(0, colonIndex);
    return spiHelperXWikiPrefixes.includes(prefix) ? prefix : null;
  }
  function spiHelperStripXWikiPrefix(title) {
    const prefix = spiHelperGetXWikiPrefix(title);
    return prefix === null ? title : title.slice(prefix.length + 1);
  }
  function spiHelperGetMaxPostExpandSize() {
    return mw.config.get("wgPageParseReport")?.limitreport.postexpandincludesize.limit ?? 2097152;
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
      try {
        username = new mw.Title(username).getMainText();
      } catch (e) {
        console.error(`Failed to parse username: ${username}.`, e);
      }
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
  var RELATIVE_EXPIRY_REGEX = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${RELATIVE_UNITS.join("|")})$`, "i");
  function isRelativeExpiry(value) {
    return RELATIVE_EXPIRY_REGEX.test(value);
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
  function addAdminSectionNote(note, sourceText) {
    const closingRule = spiHelperClosingRuleRegex.exec(sourceText);
    if (closingRule) {
      const startIndex = closingRule.index;
      const startText = sourceText.slice(0, startIndex);
      const endText = sourceText.slice(startIndex + closingRule[0].length);
      return `${startText}
${note}
----${endText}`;
    }
    const trailingWhitespace = /\s*$/.exec(sourceText)?.[0] ?? "";
    const body = sourceText.slice(0, sourceText.length - trailingWhitespace.length).replace(spiHelperCommentMarkerRegex, "");
    return `${body}
${note}
----<!-- All comments go ABOVE this line, please. -->${trailingWhitespace}`;
  }
  function buildTitleLinkHtml(title, text) {
    text ??= title;
    const $link = $("<a>").attr("href", mw.util.getUrl(title)).attr("title", title).text(text);
    return $link.prop("outerHTML");
  }
  function buildURLLinkHtml(url, text, title) {
    title ??= url;
    const $link = $("<a>").attr("href", url).attr("title", title).text(text);
    return $link.prop("outerHTML");
  }
  function pluralise(count, singular, plural = `${singular}s`) {
    return count === 1 ? singular : plural;
  }
  function countOf(count, singular, plural) {
    return `${count} ${pluralise(count, singular, plural)}`;
  }
  function buildUserActionLogMessage(opts) {
    const { blockedUsers, taggedUsers, lockedUsers, globalBlockedUsers } = opts;
    let logMessage = "";
    const filteredBlocked = blockedUsers.filter(Boolean);
    if (filteredBlocked.length > 0) {
      logMessage += `
** blocked ` + filteredBlocked.join(", ");
    }
    const filteredTagged = taggedUsers.filter(Boolean);
    if (filteredTagged.length > 0) {
      logMessage += `
** tagged ` + filteredTagged.join(", ");
    }
    if (lockedUsers.length > 0) {
      logMessage += `
** requested locks for ` + lockedUsers.map((user) => `{{noping|1=${user}}}`).join(", ");
    }
    if (globalBlockedUsers.length > 0) {
      logMessage += `
** requested global blocks for ` + globalBlockedUsers.map((user) => `{{noping|1=${user}}}`).join(", ");
    }
    return logMessage;
  }
  function createSectionTitleRegex(sectionTitle) {
    const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^(={3}|={5})\\s*(<big>)?${escapedTitle}(</big>)?\\s*(={3}|={5})\\s*$`, "m");
  }
  function getSectionText(text, startIndex = 0, nextSectionTitle) {
    let endIndex = text.length;
    if (nextSectionTitle) {
      const nextHeaderPattern = createSectionTitleRegex(nextSectionTitle);
      const nextMatch = text.slice(startIndex + 1).match(nextHeaderPattern);
      if (nextMatch?.index !== undefined) {
        endIndex = startIndex + nextMatch.index;
      }
    }
    return text.slice(startIndex, endIndex).trim();
  }
  function rebuildArchiveText(originalText, sections) {
    sections.sort((a, b) => a.header.getTime() - b.header.getTime());
    const headerText = originalText.slice(0, getContentStartIndex(originalText)).trimEnd();
    const body = sections.map((section) => section.fullText).join(`

`);
    return headerText ? `${headerText}

${body}` : body;
  }
  function getContentStartIndex(archiveText) {
    const firstSectionMatch = spiHelperSectionRegex.exec(archiveText);
    return firstSectionMatch?.index ?? archiveText.length;
  }
  function parseArchiveSections(archiveText, sectionEntries) {
    const sectionsResult = [];
    if (sectionEntries.length === 0) {
      return sectionsResult;
    }
    const contentStartIndex = getContentStartIndex(archiveText);
    let contentText = archiveText.slice(contentStartIndex);
    for (let i = 0;i < sectionEntries.length; i++) {
      const sectionEntry = sectionEntries[i];
      if (!sectionEntry) {
        continue;
      }
      const sectionName = sectionEntry.name;
      const headerPattern = createSectionTitleRegex(sectionName);
      const headerMatch = contentText.match(headerPattern);
      if (!headerMatch) {
        continue;
      }
      const sectionStartIndex = headerMatch.index;
      if (sectionStartIndex === undefined) {
        continue;
      }
      const fullText = getSectionText(contentText, sectionStartIndex, sectionEntries[i + 1]?.name);
      if (fullText) {
        const sectionDate = parseSectionDate(sectionName);
        if (sectionDate === null) {
          console.error(`Failed to parse date from section header "${sectionName}" in archive`);
          return null;
        }
        sectionsResult.push({ header: sectionDate, fullText });
      }
      contentText = contentText.slice(sectionStartIndex + fullText.length);
    }
    return sectionsResult;
  }
  function parseSectionDate(sectionTitle) {
    const parsedDate = new Date(sectionTitle);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    return null;
  }
  function setupDefaultBlockRowData() {
    return {
      block: false,
      duration: "",
      acb: true,
      abao: true,
      ntp: false,
      nem: false,
      tags: [],
      lock: false
    };
  }
  function setupBlockActionData(masterName = "") {
    return {
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
      userLocks: new Map,
      userGlobalBlocks: new Map,
      userBlocks: new Map,
      fetchedUsers: new Map,
      master: masterName,
      lockcomment: "",
      skipCUVerifyUsers: new Set
    };
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
  // src/types/spi.ts
  class ParsedArchiveNotice {
    username;
    crosswiki;
    deny;
    notalk;
    moot;
    constructor(opts) {
      this.username = opts.username;
      this.crosswiki = opts.crosswiki ?? false;
      this.deny = opts.deny ?? false;
      this.notalk = opts.notalk ?? false;
      this.moot = opts.moot ?? false;
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
  var CASE_ACTION_NAMES = [
    "sections",
    "management",
    "block",
    "status",
    "link",
    "comment",
    "move",
    "archive"
  ];
  // node_modules/@wikimedia/codex-icons/dist/codex-icons.js
  var p = '<path d="M11 9h7v2h-7v7H9v-7H2V9h7V2h2z"/>';
  var u = '<path d="M11 1v13.876l4-4 1.414 1.414-5.707 5.707H9.293L3.586 12.29 5 10.876l4 4V1z"/>';
  var P = '<path d="M10 1a9 9 0 110 18 9 9 0 010-18M5 9v2h10V9z"/>';
  var v1 = '<path d="M10 1a9 9 0 110 18 9 9 0 010-18M4.394 5.806A6.97 6.97 0 003 10a7 7 0 0011.193 5.605l-9.8-9.8ZM10 3a6.97 6.97 0 00-4.191 1.392l9.797 9.798A7 7 0 0010 3"/>';
  var V1 = '<path d="M18.154 3.837 8 16.8H6.65l-4.8-3.6 1.2-1.6 4.02 3.015 9.517-12.02z"/>';
  var M1 = '<path d="M14 17h-4v-2h4zm2.404-13.163L6.22 16.8H4.9L.1 13.2l1.2-1.6 4.02 3.015 9.517-12.02zM17 13h-4v-2h4zm3-4h-4V7h4z"/>';
  var i1 = '<path d="M10 1a9 9 0 110 18 9 9 0 010-18m0 2a7 7 0 100 14 7 7 0 000-14m1 7h3v2H9V5h2z"/>';
  var m1 = '<path d="M16.707 4.707 11.414 10l5.293 5.293-1.414 1.414L10 11.414l-5.293 5.293-1.414-1.414L8.586 10 3.293 4.707l1.414-1.414L10 8.586l5.293-5.293z"/>';
  var g1 = '<path d="M8.5 3H6a1 1 0 00-1 1v2.488c0 1.19-.525 2.273-1.371 3.012A4 4 0 015 12.512V16a1 1 0 001 1h2.5v2H6a3 3 0 01-3-3v-3.488a2 2 0 00-1.648-1.969L1 10.484V8.516l.352-.059A2 2 0 003 6.488V4a3 3 0 013-3h2.5zM14 1a3 3 0 013 3v2.488a2 2 0 001.648 1.969l.352.059v1.968l-.352.059A2 2 0 0017 12.512V16a3 3 0 01-3 3h-2.5v-2H14a1 1 0 001-1v-3.488c0-1.19.525-2.273 1.371-3.012A4 4 0 0115 6.488V4a1 1 0 00-1-1h-2.5V1z"/>';
  var L1 = '<path d="m10 8.1-5.3 5.3L3.3 12l6-6h1.4l6 6-1.4 1.4z"/>';
  var u1 = '<path d="M13 19H1V7h6V1h12v12h-6zm-6-6V9H3v8h8v-4zm2-2h8V3H9z"/>';
  var S1 = '<path d="M19 19H1v-2h18zm-8-7.104 3.5-3.5 1.414 1.414-5.207 5.208H9.293L4.086 9.81 5.5 8.396l3.5 3.5V1h2z"/>';
  var O1 = '<path d="m16.7 8-6 6H9.3l-6-6 1.4-1.4 5.3 5.3 5.3-5.3z"/>';
  var Q1 = '<path d="M17 1v6.174c1.165.412 2 1.52 2 2.826a3 3 0 01-2 2.825V19h-2.563l-4.8-4H8v4H6v-4H3v-2H1V7h2V5h6.637l4.8-4zm-6.36 5.769L10.363 7H7v6h3.362l.279.231L15 16.864V3.136z"/>';
  var n0 = '<path d="M11 18H9v-2h2zM10 2c1.497 0 2.76.433 3.66 1.268.905.84 1.34 1.994 1.34 3.232 0 1.182-.443 2.007-1.094 2.638a6.7 6.7 0 01-.95.742c-.363.241-.587.373-.923.602C11.351 10.948 11 11.86 11 13v1H9v-1c0-1.455.443-3.17 1.905-4.169.3-.204.71-.461.94-.615.281-.187.498-.349.67-.515.297-.287.485-.607.485-1.201 0-.762-.258-1.357-.7-1.768C11.853 4.317 11.117 4 10 4 7.98 4 7 5.636 7 6.5v1H5v-1C5 4.614 6.794 2 10 2"/>';
  var P0 = '<path d="M12 10H9V8h3zm2-4H9V4h5z"/><path d="M18 20H2V0h16zM7 18h9V2H7z"/>';
  var K0 = '<path d="M9 18H2V2h7zm-5-2h3V4H4zm14 2h-7v-7h7zm-5-2h3v-3h-3zm5-7h-7V2h7zm-5-2h3V4h-3z"/>';
  var l4 = '<path d="M1.456 7.172a9 9 0 0117.259 5.079l-.968.75L11.75 13a.75.75 0 00-.75.75v4.21l-1.06 1c-.648-.04-1.938-.142-2.768-.416A9 9 0 011.456 7.172M12.2 3.354a7 7 0 00-4.4 13.291c.3.1.745.17 1.2.224v-3.12A2.75 2.75 0 0111.75 11h5.178A7 7 0 0012.2 3.355Z"/><circle cx="6.5" cy="10.5" r="1.5"/><circle cx="9.5" cy="6.5" r="1.5"/><circle cx="13.5" cy="8.5" r="1.5"/>';
  var s4 = '<path d="M11 3H9v8h8V9h2v4h-6v6H1V7h6V1h4zM3 17h8v-4H7V9H3z"/><path d="M16.5 3.5H19v2h-2.5V8h-2V5.5H12v-2h2.5V1h2z"/>';
  var H4 = '<path d="M16 2h-2v4.764l3 5.936V14h-6v6H9v-6H3v-1.3l3-5.936V2H4V0h12zM8 7.236 5.618 12h8.764L12 7.236V2H8z"/>';
  var I4 = '<path d="M10 1a8.98 8.98 0 016.999 3.343L17 2h2v5l-1 1h-5l-.001-2h2.746a7 7 0 101.184 5h2.016A9 9 0 1110 1"/>';
  var I3 = '<path d="M10 0a3 3 0 013 3v1h5v2h-2v14H4V6H2V4h5V3a3 3 0 013-3M6 18h8V6H6zm4-16a1 1 0 00-1 1v1h2V3a1 1 0 00-1-1"/>';
  var T3 = '<path d="m12.009 13.695.002 1.388-4.694 4.88-1.441-1.385 3.065-3.188H0v-2h8.933l-3.057-3.164 1.438-1.39zm2.115-12.219L11.067 4.64H20v2h-8.941l3.065 3.188-1.441 1.386-4.694-4.881.002-1.388 4.694-4.86 1.439 1.39Z"/>';
  var R3 = '<path d="M12 11a6 6 0 016 6v2H2v-2a6 6 0 016-6z"/><circle cx="10" cy="5" r="4"/>';
  var P3 = '<path d="M12 11a6 6 0 016 6v2H2v-2a6 6 0 016-6zm-4 2a4 4 0 00-4 4h12a4 4 0 00-4-4zm2-12a4 4 0 110 8 4 4 0 010-8m0 2a2 2 0 100 4 2 2 0 000-4"/>';
  var l5 = '<path d="M1 3h18v2H1zm0 6h7v2H1zm0 6h8v2H1zm15-4.75h3v1l-2.2 1.5L18 16.5h-1.2l-2.3-1.9-2.3 1.9H11l1.2-3.75-2.2-1.5v-1h3L14 7h1z"/>';
  var z5 = p;
  var i5 = u;
  var U5 = P;
  var Q5 = v1;
  var _5 = V1;
  var $5 = M1;
  var h6 = i1;
  var t6 = m1;
  var a6 = g1;
  var o6 = L1;
  var s6 = {
    ltr: u1,
    shouldFlip: true
  };
  var V6 = S1;
  var y6 = O1;
  var k6 = {
    ltr: Q1,
    shouldFlip: true
  };
  var O6 = {
    ltr: n0,
    shouldFlip: true,
    shouldFlipExceptions: ["he", "yi"]
  };
  var H7 = {
    ltr: P0,
    shouldFlip: true
  };
  var g7 = {
    ltr: K0,
    shouldFlip: true
  };
  var f8 = {
    ltr: l4,
    shouldFlip: true
  };
  var S8 = {
    ltr: s4,
    shouldFlip: true
  };
  var W8 = H4;
  var K8 = I4;
  var Q9 = I3;
  var tc = {
    ltr: T3,
    shouldFlip: true
  };
  var vc = R3;
  var dc = P3;
  var Cc = {
    ltr: l5,
    shouldFlip: true
  };

  // src/types/vue.ts
  var WatchOptionsSelect = [
    { label: "Follow preferences", value: "preferences" },
    { label: "No change", value: "nochange" },
    { label: "Watch", value: "watch" },
    { label: "Unwatch", value: "unwatch" }
  ];
  var WatchOptions = ["preferences", "watch", "nochange", "unwatch"];
  var DefaultLinkRowData = {
    analyser: false,
    timeline: false,
    timecard: false,
    pages: false,
    summary: false,
    cuwiki: false,
    interleaved: false
  };
  var SockpuppetTagStatuses = {
    blocked: { label: "Suspected", icon: O6 },
    proven: { label: "Proven", icon: _5 },
    confirmed: { label: "Confirmed", icon: $5 }
  };
  var SockmasterTagStatuses = {
    blocked: { label: "Blocked", icon: U5 },
    confirmed: { label: "Confirmed", icon: $5 },
    banned: { label: "3X Banned", icon: Q5 }
  };
  var AltmasterTagStatuses = {
    suspected: { label: "Suspected", icon: O6 },
    proven: { label: "Proven", icon: _5 }
  };
  // src/ui/messages.ts
  var DISMISS_FADE_MS = 250;
  var nextMessageId = 0;

  class VueMessage {
    type;
    content;
    isHtml;
    id = nextMessageId++;
    _shown = false;
    constructor(opts) {
      this.type = opts.type;
      this.content = opts.content;
      this.isHtml = opts.isHtml;
    }
    show() {
      this._shown = true;
      messages.push(this);
      return this;
    }
    showOnce() {
      const alreadyShown = messages.some((message) => message.type === this.type && message.content === this.content && message.isHtml === this.isHtml);
      return alreadyShown ? this : this.show();
    }
    update(opts) {
      if (!this._shown) {
        Object.assign(this, opts);
        this.show();
        return this;
      }
      const current = messages.find((message) => message.id === this.id);
      if (current) {
        Object.assign(current, opts);
      }
      Object.assign(this, opts);
      return this;
    }
  }
  function dismissMessage(id) {
    setTimeout(() => {
      const index = messages.findIndex((message) => message.id === id);
      if (index !== -1) {
        messages.splice(index, 1);
      }
    }, DISMISS_FADE_MS);
  }
  var messages = [];
  function setMessagesReactive(reactive) {
    messages = reactive(messages);
  }

  // src/api.ts
  async function spiHelperGetBulkPageText(titles) {
    if (titles.length === 0) {
      return new Map;
    }
    const resultMap = new Map;
    await fetchInChunks({
      targets: titles,
      fetchName: "spiHelperGetBulkPageText",
      buildRequest: (chunk) => ({
        action: "query",
        prop: "revisions",
        rvprop: "content",
        rvslots: "main",
        titles: chunk,
        formatversion: "2"
      }),
      onResponse: (response) => {
        const setNormalisedMap = keyByRequestedTitle(resultMap, response.query.normalized);
        for (const page of response.query.pages) {
          if (page.missing) {
            continue;
          }
          const latestRevision = page.revisions?.[0];
          if (!latestRevision) {
            continue;
          }
          setNormalisedMap(page.title, latestRevision.slots.main.content);
        }
      }
    });
    return resultMap;
  }
  async function spiHelperGetBulkUserBlockSettings(usernames) {
    if (usernames.size === 0) {
      return new Map;
    }
    const resultMap = new Map;
    await fetchInChunks({
      targets: [...usernames],
      fetchName: "spiHelperGetBulkUserBlockSettings",
      buildRequest: (chunk) => ({
        action: "query",
        list: "blocks",
        bklimit: "max",
        bkusers: chunk,
        bkprop: ["user", "reason", "flags", "expiry"],
        formatversion: "2"
      }),
      onResponse: (response) => {
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
      }
    });
    return resultMap;
  }
  async function spiHelperGetBulkGlobalUsers(usernames) {
    if (usernames.size === 0) {
      return new Map;
    }
    const resultMap = new Map;
    await fetchInChunks({
      targets: [...usernames],
      fetchName: "spiHelperGetBulkGlobalUsers",
      buildRequest: (chunk) => ({
        action: "query",
        list: "globalusers",
        gususers: chunk,
        gusprop: ["locked", "localinfo"],
        formatversion: "2"
      }),
      onResponse: (response) => {
        for (const globalUser of response.query.globalusers) {
          if (globalUser.missing || globalUser.invalid) {
            continue;
          }
          resultMap.set(globalUser.name, {
            name: globalUser.name,
            existsLocally: globalUser.localinfo?.attached ?? false,
            locked: globalUser.locked ?? false
          });
        }
      }
    });
    return resultMap;
  }
  async function spiHelperGetBulkGlobalBlocks(targets) {
    if (targets.size === 0) {
      return new Map;
    }
    const resultMap = new Map;
    await fetchInChunks({
      targets: [...targets],
      fetchName: "spiHelperGetBulkGlobalBlocks",
      buildRequest: (chunk) => ({
        action: "query",
        list: "globalblocks",
        bgtargets: chunk,
        bglimit: "max",
        bgprop: ["id", "target", "by", "expiry", "reason"],
        formatversion: "2"
      }),
      onResponse: (response) => {
        for (const globalBlock of response.query.globalblocks) {
          if (!globalBlock.target) {
            continue;
          }
          resultMap.set(globalBlock.target, {
            target: globalBlock.target,
            expiry: globalBlock.expiry,
            by: globalBlock.by,
            reason: globalBlock.reason
          });
        }
      }
    });
    return resultMap;
  }
  async function spiHelperGetUsers(opts) {
    const { from, limit, signal } = opts;
    const api2 = spiHelperGetAPI();
    const request = {
      action: "query",
      list: "allusers",
      aulimit: limit,
      auprefix: from,
      auprop: ["blockinfo"],
      formatversion: "2"
    };
    try {
      const response = await api2.get(request, { signal });
      return response.query.allusers;
    } catch (error) {
      if (signal?.aborted) {
        return [];
      }
      console.error("spiHelperGetUsers fetch error:", error);
      return [];
    }
  }
  async function spiHelperGetPages(opts) {
    const { from, namespace, limit, signal } = opts;
    const api2 = spiHelperGetAPI();
    const request = {
      action: "query",
      list: "allpages",
      aplimit: limit,
      apprefix: from,
      apnamespace: namespace,
      formatversion: "2"
    };
    try {
      const response = await api2.get(request, { signal });
      return response.query.allpages;
    } catch (error) {
      if (signal?.aborted) {
        return null;
      }
      console.error("spiHelperGetPages fetch error:", error);
      return null;
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
    const api2 = spiHelperGetAPI(title);
    const request = {
      action: "delete",
      title,
      reason
    };
    try {
      await api2.postWithToken("csrf", request);
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
    const api2 = spiHelperGetAPI(title);
    const request = {
      action: "undelete",
      title,
      reason
    };
    try {
      await api2.postWithToken("csrf", request);
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
      const response = await spiHelperGetAPI(title).post(request);
      return response.parse?.text["*"] ?? "";
    } catch (error) {
      console.error("Error rendering text:", error);
      return "";
    }
  }
  async function spiHelperGetInvestigationSections(opts) {
    const { pageName, content } = opts;
    const request = {
      action: "parse",
      prop: "tocdata",
      formatversion: "2"
    };
    if (pageName !== undefined) {
      request.page = pageName;
    } else if (content !== undefined) {
      request.text = content;
      request.contentmodel = "wikitext";
    } else {
      console.error("spiHelperGetInvestigationSections: No page name or content provided");
      return [];
    }
    const api2 = spiHelperGetAPI();
    try {
      const response = await api2.post(request);
      if (!response.parse) {
        console.error("spiHelperGetInvestigationSections: Could not parse sections");
        return [];
      }
      const dateSections = [];
      for (const section of response.parse.tocdata.sections) {
        if (section.tocLevel === 2 || section.hLevel === 3) {
          dateSections.push(new SectionEntry(parseInt(section.index), section.line));
        }
      }
      return dateSections;
    } catch (error) {
      console.warn("spiHelperGetInvestigationSections API error:", error);
      return [];
    }
  }
  async function spiHelperGetSPIBacklinks(casePageName) {
    const api2 = spiHelperGetAPI();
    const request = {
      action: "query",
      format: "json",
      list: "backlinks",
      bltitle: casePageName,
      blnamespace: 4,
      bldir: "ascending",
      blfilterredir: "nonredirects",
      bllimit: "max"
    };
    try {
      const response = await api2.get(request);
      return response.query.backlinks.filter((dictEntry) => {
        return dictEntry.title.startsWith("Wikipedia:Sockpuppet investigations/") && !dictEntry.title.startsWith("Wikipedia:Sockpuppet investigations/SPI/") && !/Wikipedia:Sockpuppet investigations\/.*\/Archive.*/.exec(dictEntry.title);
      });
    } catch {
      return [];
    }
  }
  async function spiHelperGetBulkPageRestrictions(titles) {
    const resultMap = new Map;
    if (titles.length === 0) {
      return resultMap;
    }
    await fetchInChunks({
      targets: titles,
      fetchName: "spiHelperGetBulkPageRestrictions",
      buildRequest: (chunk) => ({
        action: "query",
        prop: ["info", "flagged"],
        titles: chunk,
        inprop: "protection",
        formatversion: "2"
      }),
      onResponse: (response) => {
        const setNormalisedMap = keyByRequestedTitle(resultMap, response.query.normalized);
        for (const page of response.query.pages) {
          setNormalisedMap(page.title, {
            protection: page.protection ?? [],
            pendingChanges: page.flagged ?? null
          });
        }
      }
    });
    return resultMap;
  }
  async function spiHelperProtectPage(pageName, protections) {
    const activeOpKey = "protect_" + pageName;
    startOp(activeOpKey);
    const linkHtml = buildTitleLinkHtml(pageName);
    const message = new VueMessage({ type: "notice", content: `Protecting ${linkHtml}`, isHtml: true });
    const api2 = spiHelperGetAPI();
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
      await api2.postWithToken("csrf", request);
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
    const api2 = spiHelperGetAPI();
    const request = {
      action: "stabilize",
      format: "json",
      titles: casePageName,
      protectlevel: protection.level,
      expiry: protection.expiry,
      reason: "Restoring pending changes protection after history merge"
    };
    try {
      await api2.postWithToken("csrf", request);
      finishOp(activeOpKey, "success" /* Success */);
    } catch {
      finishOp(activeOpKey, "failed" /* Failed */);
    }
  }
  async function spiHelperGetSiteRestrictionInformation() {
    const api2 = spiHelperGetAPI();
    const request = {
      action: "query",
      format: "json",
      meta: "siteinfo",
      siprop: "restrictions"
    };
    try {
      const response = await api2.get(request);
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
    const userLinkHtml = buildTitleLinkHtml(userPage);
    const message = new VueMessage({
      type: "notice",
      content: `Blocking ${userLinkHtml}`,
      isHtml: true
    }).show();
    const api2 = spiHelperGetAPI();
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
      user,
      formatversion: "2"
    };
    try {
      const response = await api2.postWithToken("csrf", request);
      const blockLinkHtml = buildURLLinkHtml(mw.util.getUrl("Special:BlockList", { wpTarget: `#${response.block.id}` }), "Blocked", "Special:BlockList");
      message.update({ type: "success", content: `${blockLinkHtml} ${userLinkHtml}` });
      finishOp(activeOpKey, "success" /* Success */);
      return true;
    } catch (error) {
      message.update({
        type: "error",
        content: `Failed to block ${userLinkHtml}: ${mw.html.escape(JSON.stringify(error))}`
      });
      finishOp(activeOpKey, "failed" /* Failed */);
      return false;
    }
  }
  async function spiHelperMovePage(opts) {
    const {
      sourcePage,
      destPage,
      summary,
      ignoreWarnings,
      suppressRedirect = false,
      moveSubpages = true
    } = opts;
    const activeOpKey = "move_" + sourcePage + "_" + destPage;
    startOp(activeOpKey);
    const api2 = spiHelperGetAPI();
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
      reason: summary + spiHelperAdvert(false),
      noredirect: suppressRedirect,
      movesubpages: moveSubpages,
      ignoreWarnings
    };
    try {
      await api2.postWithToken("csrf", request);
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
    const pageLinkHtml = buildTitleLinkHtml(title);
    const message = new VueMessage({
      type: "notice",
      content: "Editing " + pageLinkHtml,
      isHtml: true
    }).show();
    const api2 = spiHelperGetAPI(title);
    const xwikiPrefix = spiHelperGetXWikiPrefix(title);
    const finalTitle = spiHelperStripXWikiPrefix(title);
    const request = {
      action: "edit",
      watchlist: watch,
      summary: summary + spiHelperAdvert(xwikiPrefix !== null),
      text: newText,
      title: finalTitle,
      createonly,
      formatversion: "2"
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
      const response = await api2.postWithToken("csrf", request);
      const diffId = response.edit.newrevid;
      if (!diffId) {
        message.update({
          type: "error",
          content: `Edit failed on ${pageLinkHtml}: ${mw.html.escape(JSON.stringify(response))}`
        });
        console.error(response);
        finishOp(activeOpKey, "failed" /* Failed */);
        return null;
      }
      const diffUrl = xwikiPrefix === null ? mw.util.getUrl("", { diff: diffId }) : mw.util.getUrl(`${xwikiPrefix}:Special:Diff/${diffId}`);
      const diffLinkHtml = buildURLLinkHtml(diffUrl, "Saved", `View diff ${diffId}`);
      message.update({ type: "success", content: `${diffLinkHtml} page ${pageLinkHtml}`, isHtml: true });
      finishOp(activeOpKey, "success" /* Success */);
      return response.edit.newrevid ?? null;
    } catch (error) {
      message.update({
        type: "error",
        content: `Edit failed on ${pageLinkHtml}: ${mw.html.escape(JSON.stringify(error))}`,
        isHtml: true
      });
      console.error(error);
      finishOp(activeOpKey, "failed" /* Failed */);
      return null;
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
    const api2 = spiHelperGetAPI(title);
    try {
      const response = await api2.get(request);
      return Number(response.parse?.limitreportdata.find((item) => item.name === "limitreport-postexpandincludesize")?.["0"] ?? 0);
    } catch {}
    return 0;
  }
  async function spiHelperGetPostExpandSizeFromText(text) {
    const api2 = spiHelperGetAPI();
    const request = {
      action: "parse",
      prop: "limitreportdata",
      text,
      contentmodel: "wikitext"
    };
    try {
      const response = await api2.post(request);
      return Number(response.parse?.limitreportdata.find((item) => item.name === "limitreport-postexpandincludesize")?.["0"] ?? 0);
    } catch {}
    return 0;
  }
  async function spiHelperParseWikitext(wikitext) {
    const api2 = spiHelperGetAPI();
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
      const response = await api2.post(request);
      return response.parse?.text["*"] ?? "";
    } catch {
      return "";
    }
  }
  async function spiHelperGetCategoryMembers(category) {
    const api2 = spiHelperGetAPI();
    const request = {
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "max",
      cmnamespace: 2,
      formatversion: "2"
    };
    const members = [];
    try {
      for await (const response of queryWithContinuation(api2, request, "spiHelperGetCategoryMembers", [category], "get")) {
        members.push(...response.query.categorymembers.map((member) => member.title));
      }
    } catch {
      return [];
    }
    return members;
  }
  var MAX_CONTINUATION_ROUNDS = 10;
  function keyByRequestedTitle(resultMap, normalized) {
    const asRequested = new Map((normalized ?? []).map(({ from, to }) => [to, from]));
    return (title, value) => {
      resultMap.set(title, value);
      const requestedTitle = asRequested.get(title);
      if (requestedTitle !== undefined) {
        resultMap.set(requestedTitle, value);
      }
    };
  }
  function bulkFetchError(fetchName, targets, cause) {
    return new Error(`${fetchName} failed fetching ${targets.length} item(s), ` + `starting with ${targets[0] ?? "(none)"}`, { cause });
  }
  async function* queryWithContinuation(api2, request, fetchName, targets, method = "post") {
    let continuation = {};
    for (let round = 0;round < MAX_CONTINUATION_ROUNDS; round++) {
      let response;
      try {
        response = await api2[method]({ ...request, ...continuation });
      } catch (error) {
        throw bulkFetchError(fetchName, targets, error);
      }
      const { continue: nextContinuation } = response;
      yield response;
      if (!nextContinuation) {
        return;
      }
      continuation = nextContinuation;
    }
    throw bulkFetchError(fetchName, targets, new Error(`still continuing after ${MAX_CONTINUATION_ROUNDS} rounds, ` + "giving up rather than returning a partial result"));
  }
  async function fetchInChunks(opts) {
    const { targets, fetchName, buildRequest, onResponse, method } = opts;
    const api2 = spiHelperGetAPI();
    const chunkSize = targets.length <= API_LIMIT ? API_LIMIT : await getApiChunkSize();
    await Promise.all(chunkArray(targets, chunkSize).map(async (chunk) => {
      for await (const response of queryWithContinuation(api2, buildRequest(chunk), fetchName, chunk, method)) {
        await onResponse(response);
      }
    }));
  }
  function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0;i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
  var API_LIMIT = 50;
  var API_HIGH_LIMIT = 500;
  async function getApiChunkSize() {
    const rights = await mw.user.getRights();
    return rights.includes("apihighlimits") ? API_HIGH_LIMIT : API_LIMIT;
  }
  function getUserAgent() {
    return `MediaWiki-JS/${mw.config.get("wgVersion")} spihelper/${VERSION}`;
  }
  var localAPI = null;
  var metaAPI = null;
  function getLocalAPI() {
    localAPI ??= new mw.Api({ userAgent: getUserAgent() });
    return localAPI;
  }
  function getMetaAPI() {
    metaAPI ??= new mw.ForeignApi("https://meta.wikimedia.org/w/api.php", { userAgent: getUserAgent() });
    return metaAPI;
  }
  function spiHelperGetAPI(title) {
    if (title && spiHelperGetXWikiPrefix(title) !== null) {
      return getMetaAPI();
    } else {
      return getLocalAPI();
    }
  }
  function spiHelperGetEnwikiAPI() {
    if (mw.config.get("wgWikiID") === "enwiki") {
      return getLocalAPI();
    }
    return new mw.ForeignApi("https://en.wikipedia.org/w/api.php", { userAgent: getUserAgent() });
  }

  // src/context.ts
  class SpiPageContext {
    pageName;
    prefixedName;
    caseName;
    userName;
    archiveName;
    casePageName;
    isArchive;
    valid;
    startingRevId;
    source;
    constructor(pageName, currentPage = false, source = "spi") {
      this.pageName = pageName;
      this.prefixedName = spiHelperGetInterwikiPrefix() + pageName;
      this.source = source;
      this.isArchive = /Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(pageName);
      this.caseName = extractCaseName(pageName, this.isArchive);
      this.userName = spiHelperNormalizeUsername(this.caseName);
      this.casePageName = "Wikipedia:Sockpuppet investigations/" + this.caseName;
      this.archiveName = pageName + "/Archive";
      this.valid = !!this.caseName.trim();
      if (currentPage) {
        this.startingRevId = mw.config.get("wgCurRevisionId");
      } else {
        this.startingRevId = 0;
      }
    }
    async refreshRevId() {
      this.startingRevId = await spiHelperGetPageRev(this.pageName);
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
  var context;
  function setContext(pageName, source = "spi") {
    context = new SpiPageContext(cleanPageName(pageName), pageName === mw.config.get("wgPageName"), source);
  }
  function buildContextSummary(baseText) {
    return context.source === "spi" && context.valid ? baseText + ` per [[${context.pageName}]]` : baseText;
  }

  // src/state.ts
  function getSelectedSections(selection) {
    if (selection?.type === "single") {
      return [selection.section];
    }
    if (selection?.type === "multiple") {
      return selection.sections;
    }
    return [];
  }

  class CaseState {
    sections;
    selectedSection;
    archiveNotice;
    _text = null;
    _loadingPromise = null;
    constructor(sections = [], selectedSection = null, archiveNotice = null) {
      this.sections = sections;
      if (selectedSection) {
        this.selectedSection = { type: "single", section: selectedSection };
      } else {
        this.selectedSection = null;
      }
      this.archiveNotice = archiveNotice;
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
    state.sections = await spiHelperGetInvestigationSections({ pageName: context.pageName });
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
  async function migrateSettings(oldSettings, target) {
    const tasks = migrationMap.map(async ({ oldPath, newPath, type }) => {
      const value = oldSettings[oldPath];
      if (value === undefined) {
        return;
      }
      const isValid = await validateSetting(value, type);
      if (isValid) {
        setNestedValue(target, newPath, value);
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
  function setGlobalSettings(settings2) {
    spiHelperSettings = structuredClone(settings2);
  }
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
      const optionsPage = `User:${mw.config.get("wgUserName")}/spihelper-options.js`;
      await mw.loader.getScript(mw.util.getUrl(optionsPage, { action: "raw", ctype: "text/javascript" }));
      if (spiHelperCustomOpts !== undefined) {
        await migrateSettings(spiHelperCustomOpts, spiHelperSettings);
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
  function spiHelperCanSuppressRedirect() {
    return spiHelperIsAdmin() || (mw.config.get("wgUserGroups")?.includes("extendedmover") ?? false);
  }

  // node_modules/vue/dist/vue.runtime.esm-bundler.js
  var defineComponent = (c) => c;

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
        if (newValue === "" || parseExpiry(newValue) !== null) {
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
  // src/template.ts
  function findTemplateSpans(templateName, text) {
    const namePattern = templateName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[\s_]+/g, "[\\s_]+");
    const spans = [];
    for (const match of text.matchAll(new RegExp(`\\{\\{\\s*${namePattern}\\s*(?=[|}])`, "gi"))) {
      if (spans.some((span) => match.index < span.end)) {
        continue;
      }
      let depth = 0;
      for (let i = match.index;i < text.length - 1; i++) {
        if (text.startsWith("{{", i)) {
          depth++;
          i++;
        } else if (text.startsWith("}}", i)) {
          depth--;
          i++;
          if (depth === 0) {
            spans.push({ text: text.slice(match.index, i + 1), start: match.index, end: i + 1 });
            break;
          }
        }
      }
    }
    return spans;
  }
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
  function splitTemplateParts(text) {
    const parts = [];
    let depth = 0;
    let segmentStart = 0;
    for (let i = 0;i < text.length; i++) {
      if (text.startsWith("[[", i) || text.startsWith("{{", i)) {
        depth++;
        i++;
      } else if (text.startsWith("]]", i) || text.startsWith("}}", i)) {
        depth--;
        i++;
      } else if (text[i] === "|" && depth === 0) {
        parts.push(text.slice(segmentStart, i));
        segmentStart = i + 1;
      }
    }
    parts.push(text.slice(segmentStart));
    return parts;
  }
  function parseTemplate(templateText) {
    const parts = splitTemplateParts(templateText).map((p2) => p2.trim());
    const name = parts.shift()?.toLowerCase() ?? "unknown";
    const params = {};
    const positional = [];
    for (const part of parts) {
      const eq = part.indexOf("=");
      if (eq !== -1) {
        const key = part.slice(0, eq).trim().toLowerCase();
        const value = part.slice(eq + 1).trim();
        if (value === "") {
          params[key] = value;
          continue;
        }
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue)) {
          params[key] = numberValue;
          continue;
        }
        const boolResult = convertParamToBoolean(value);
        if (boolResult === null) {
          params[key] = value;
          continue;
        }
        params[key] = boolResult;
      } else if (part) {
        positional.push(part);
      }
    }
    return { name, params, positional };
  }
  var TRUTHY_PARAM_VALUES = new Set(["y", "yes", "true", "on"]);
  var FALSY_PARAM_VALUES = new Set(["n", "no", "false", "off"]);
  function convertParamToBoolean(value) {
    const normalised = value.toLowerCase();
    if (TRUTHY_PARAM_VALUES.has(normalised)) {
      return true;
    }
    if (FALSY_PARAM_VALUES.has(normalised)) {
      return false;
    }
    return null;
  }
  function fetchTemplateArguments(template) {
    const result = [];
    for (const positional of template.positional) {
      result.push(positional);
    }
    for (const [key, value] of Object.entries(template.params)) {
      if (!Number.isNaN(Number(key))) {
        result.push(value.toString());
      }
    }
    return result;
  }

  // src/tags.ts
  class SockpuppetTag {
    master;
    status;
    locked;
    evidence;
    altmaster;
    altmasterStatus;
    constructor(opts) {
      this.master = spiHelperNormalizeUsername(opts.master);
      this.status = opts.status;
      this.locked = opts.locked ?? false;
      this.evidence = opts.evidence ?? "";
      this.altmaster = spiHelperNormalizeUsername(opts.altmaster ?? "");
      this.altmasterStatus = opts.altmasterStatus ?? "suspected";
    }
    generateWikitext(blocked) {
      let tag = "{{sockpuppet";
      tag += `
| 1 = ${this.master}`;
      tag += `
| 2 = ${this.status}`;
      if (this.locked) {
        tag += `
| locked = yes`;
      }
      if (blocked === false) {
        tag += `
| notblocked = yes`;
      }
      if (this.evidence) {
        tag += `
| evidence = ${this.evidence}`;
      }
      if (this.altmaster) {
        tag += `
| altmaster = ${this.altmaster}`;
        tag += `
| altmaster-status = ${this.altmasterStatus}`;
      }
      tag += `
}}`;
      return tag;
    }
    clone() {
      return new SockpuppetTag({
        master: this.master,
        status: this.status,
        evidence: this.evidence,
        altmaster: this.altmaster,
        altmasterStatus: this.altmasterStatus
      });
    }
    equals(other) {
      if (!(other instanceof SockpuppetTag))
        return false;
      return this.master === other.master && this.status === other.status && this.locked === other.locked && this.evidence === other.evidence && this.altmaster === other.altmaster && (!this.altmaster || this.altmasterStatus === other.altmasterStatus);
    }
  }

  class SockmasterTag {
    status;
    checked;
    locked;
    ltapage;
    spipage;
    evidence;
    constructor(opts) {
      this.status = opts.status;
      this.checked = opts.checked ?? false;
      this.locked = opts.locked ?? false;
      this.ltapage = opts.ltapage ?? "";
      this.spipage = opts.spipage ?? "";
      this.evidence = opts.evidence ?? "";
    }
    generateWikitext() {
      let tag = "{{sockpuppeteer";
      const outputStatus = this.status === "banned" ? "banned" : "blocked";
      const isChecked = this.status !== "blocked";
      tag += `
| 1 = ${outputStatus}`;
      if (isChecked) {
        tag += `
| checked = yes`;
      }
      if (this.locked) {
        tag += `
| locked = yes`;
      }
      if (this.ltapage) {
        tag += `
| ltapage = ${this.ltapage}`;
      }
      if (this.spipage) {
        tag += `
| spipage = ${this.spipage}`;
      }
      if (this.evidence) {
        tag += `
| evidence = ${this.evidence}`;
      }
      tag += `
}}`;
      return tag;
    }
    clone() {
      return new SockmasterTag({
        status: this.status,
        checked: this.checked,
        ltapage: this.ltapage,
        spipage: this.spipage,
        evidence: this.evidence
      });
    }
    equals(other) {
      if (!(other instanceof SockmasterTag))
        return false;
      return this.status === other.status && this.checked === other.checked && this.locked === other.locked && this.ltapage === other.ltapage && this.spipage === other.spipage && this.evidence === other.evidence;
    }
  }
  function parseUserTags(userPage, username) {
    const on = username ? ` on ${username}` : "";
    const tags = [];
    const templates = parseTemplates(userPage);
    for (const template of templates) {
      if (["sockpuppeteer", "sockmaster"].includes(template.name)) {
        const firstParam = (template.params["1"] ?? template.positional[0])?.toString();
        const paramConfirmed = firstParam === "cu" || (firstParam?.includes("confirmed") ?? false);
        const sockChecked = template.params.checked === true || paramConfirmed;
        let tagStatus;
        if (paramConfirmed) {
          tagStatus = "confirmed";
        } else if (firstParam === "banned") {
          tagStatus = "banned";
        } else if (firstParam?.includes("blocked")) {
          tagStatus = sockChecked ? "confirmed" : "blocked";
        } else {
          console.warn("Unrecognised master status", firstParam);
          new VueMessage({
            type: "warning",
            content: `Ignoring {{${template.name}}} tag${on} with unrecognised status ` + `"${firstParam ?? ""}". Tagging will overwrite it`
          }).showOnce();
          continue;
        }
        const newTag = new SockmasterTag({ status: tagStatus, checked: sockChecked });
        if (template.params.locked === true) {
          newTag.locked = true;
        }
        if (template.params.ltapage) {
          newTag.ltapage = template.params.ltapage;
        }
        if (template.params.spipage) {
          newTag.spipage = template.params.spipage;
        }
        if (template.params.evidence) {
          newTag.evidence = template.params.evidence;
        }
        tags.push(newTag);
      } else if (["sockpuppet", "sock"].includes(template.name)) {
        const masterParam = template.params["1"] ?? template.positional[0];
        if (!masterParam) {
          console.warn("Master parameter not found");
          continue;
        }
        const statusParam = template.params["2"] ?? template.positional[1];
        let tagStatus;
        switch (statusParam) {
          case "blocked":
            tagStatus = "blocked";
            break;
          case "proven":
            tagStatus = "proven";
            break;
          case "confirmed":
          case "nbconfirmed":
          case "cuconfirmed":
            tagStatus = "confirmed";
            break;
          default:
            console.warn("Unrecognised sock status", statusParam);
            new VueMessage({
              type: "warning",
              content: `Ignoring {{${template.name}}} tag${on} with unrecognised status ` + `"${statusParam?.toString() ?? ""}". Tagging will overwrite it`
            }).showOnce();
            continue;
        }
        const newTag = new SockpuppetTag({
          master: masterParam,
          status: tagStatus
        });
        const altmaster = template.params.altmaster;
        if (altmaster) {
          const altmasterStatusParam = template.params["altmaster-status"];
          let altmasterStatus;
          switch (altmasterStatusParam) {
            case "suspect":
            case "suspected":
              altmasterStatus = "suspected";
              break;
            case "proven":
              altmasterStatus = "proven";
              break;
            default:
              console.warn("Unrecognised altmaster status", altmasterStatusParam);
              new VueMessage({
                type: "warning",
                content: `Dropping altmaster "${altmaster.toString()}"${on}: unrecognised ` + `altmaster-status "${altmasterStatusParam?.toString() ?? ""}"`
              }).showOnce();
              break;
          }
          if (altmasterStatus) {
            newTag.altmaster = altmaster;
            newTag.altmasterStatus = altmasterStatus;
          }
        }
        if (template.params.evidence) {
          newTag.evidence = template.params.evidence;
        }
        if (template.params.locked) {
          newTag.locked = true;
        }
        tags.push(newTag);
      }
    }
    return tags;
  }
  function isSockpuppetTag(tag) {
    return tag instanceof SockpuppetTag;
  }
  function isSockmasterTag(tag) {
    return tag instanceof SockmasterTag;
  }

  // src/ui/runtime.ts
  var tableRowIdentifier = null;
  function setTableRowIdentifier(identifier) {
    tableRowIdentifier = identifier;
  }
  var vueToRaw = null;
  function setToRaw(toRawArg) {
    vueToRaw = toRawArg;
  }
  function toRaw(observed) {
    return vueToRaw ? vueToRaw(observed) : observed;
  }
  var vueMarkRaw = null;
  function setMarkRaw(markRawArg) {
    vueMarkRaw = markRawArg;
  }
  function markRaw(value) {
    return vueMarkRaw ? vueMarkRaw(value) : value;
  }

  // src/ui/utils.ts
  function generateUserRow(username, state) {
    if (mw.util.isIPAddress(username, true)) {
      if (spiHelperSettings.interface.displayIPv6As64 && mw.util.isIPv6Address(username, false)) {
        return {
          ...getDefaultUserRow(state.archiveNotice),
          username: buildIPBlock(username)
        };
      } else {
        return { ...getDefaultUserRow(state.archiveNotice), username };
      }
    } else {
      return { ...getDefaultUserRow(state.archiveNotice), username };
    }
  }
  function buildIPBlock(fullIP) {
    if (!mw.util.isIPv6Address(fullIP, false)) {
      return fullIP;
    }
    return fullIP.split(":").slice(0, 4).concat("0", "0", "0", "0").join(":") + "/64";
  }
  function getDefaultUserRow(archiveNotice) {
    const id = crypto.randomUUID();
    const newRow = {
      id,
      username: "",
      block: setupDefaultBlockRowData(),
      link: { ...DefaultLinkRowData }
    };
    if (tableRowIdentifier) {
      newRow[tableRowIdentifier] = id;
    }
    if (archiveNotice) {
      if (archiveNotice.crosswiki) {
        newRow.block.lock = true;
      }
      if (archiveNotice.notalk) {
        newRow.block.nem = true;
        newRow.block.ntp = true;
      }
    }
    newRow.block.duration = spiHelperSettings.interface.defaultBlockDuration;
    return newRow;
  }
  function updateUserBlockDataSettings(opts) {
    const { userRow, currentBlock, userPage, defaultBlock } = opts;
    if (currentBlock) {
      userRow.block.block = true;
      userRow.block.acb = currentBlock.acb;
      userRow.block.abao = currentBlock.abao;
      userRow.block.ntp = currentBlock.ntp;
      userRow.block.nem = currentBlock.nem;
      userRow.block.duration = currentBlock.duration;
    } else {
      userRow.block.block = defaultBlock;
      if (mw.util.isIPAddress(userRow.username, true)) {
        userRow.block.duration = "1 week";
      }
    }
    if (userPage) {
      userRow.block.tags = parseUserTags(userPage, userRow.username);
    }
    return userRow;
  }
  var isMenuGroupData = (item) => ("items" in item);
  function setUserRowData(opts) {
    const { fetchedUser, defaultBlock, state } = opts;
    const userRow = updateUserBlockDataSettings({
      userRow: opts.userRow,
      defaultBlock,
      currentBlock: fetchedUser?.block,
      userPage: fetchedUser?.userPage
    });
    const crosswiki = state.archiveNotice?.crosswiki ?? false;
    if (fetchedUser?.globalUser) {
      userRow.block.lock = fetchedUser.globalUser.locked || crosswiki;
      return { userRow, globalStatus: { kind: "locked", locked: fetchedUser.globalUser.locked } };
    }
    if (isNonRegisteredAccount(userRow.username)) {
      const globallyBlocked = fetchedUser?.globalBlock !== undefined;
      userRow.block.lock = globallyBlocked || crosswiki;
      return { userRow, globalStatus: { kind: "gblocked", blocked: globallyBlocked } };
    }
    return { userRow, globalStatus: { kind: "none" } };
  }
  function pruneMenuData(nodes) {
    return nodes.map((node) => {
      if (isMenuGroupData(node)) {
        const cleanedItems = pruneMenuData(node.items);
        if (cleanedItems.length === 0)
          return null;
        return {
          ...node,
          items: cleanedItems
        };
      }
      if (!node.value)
        return null;
      return node;
    }).filter((node) => node !== null);
  }
  function isInputDisabled(row, column, blockOptions, userBlocks, userLocks, userGlobalBlocks, targetRows) {
    if (column === "lock") {
      if (row === null)
        return false;
      return isNonRegisteredAccount(row.username) ? userGlobalBlocks.get(row.username) === true : userLocks.get(row.username) === true;
    }
    if (column === "block") {
      if (row === null)
        return blockOptions.noBlock;
      return blockOptions.noBlock || !blockOptions.override && userBlocks.get(row.username) !== undefined;
    }
    if (blockOptions.noBlock)
      return true;
    if (row === null) {
      return !targetRows.some((r) => r.block.block);
    }
    if (!row.block.block)
      return true;
    return !blockOptions.override && userBlocks.get(row.username) !== undefined;
  }
  function abortableDelay(ms, signal) {
    return new Promise((resolve) => {
      if (signal.aborted) {
        resolve();
        return;
      }
      const timer = setTimeout(resolve, ms);
      signal.addEventListener("abort", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
    });
  }
  function isAborted(signal) {
    return signal.aborted;
  }

  // src/ui/views/options/modal.ts
  var OptionsComponent = defineComponent({
    props: {
      feedbackDialog: { type: Object, required: true },
      openButton: { type: Object, required: true },
      toaster: { type: Object, required: true }
    },
    data: function() {
      const username = mw.config.get("wgUserName") ?? "";
      const logPrefix = `User:${username}/`;
      const caseActionMenuItems = CASE_ACTION_NAMES.reduce((acc, actionName) => {
        if (actionName !== "sections") {
          acc.push({
            value: actionName,
            label: actionName.charAt(0).toUpperCase() + actionName.slice(1)
          });
        }
        return acc;
      }, []);
      return {
        open: false,
        openHandler: null,
        showExtra: spiHelperSettings.debug.enabled,
        showExtraMessage: false,
        showExtraHandler: null,
        logPrefix,
        caseActionMenuItems,
        selectedChipItems: spiHelperSettings.defaultActions,
        icons: {
          cdxIconAdd: z5,
          cdxIconArrowDown: i5,
          cdxIconClock: h6,
          cdxIconClose: t6,
          cdxIconCode: a6,
          cdxIconFeedback: k6,
          cdxIconJournal: H7,
          cdxIconLayout: g7,
          cdxIconPalette: f8,
          cdxIconReload: K8,
          cdxIconTrash: Q9,
          cdxIconWatchlist: Cc
        },
        instanceSettings: structuredClone(spiHelperSettings),
        oldSettings: structuredClone(spiHelperSettings),
        resetTrigger: 0
      };
    },
    computed: {
      logPage() {
        return `${mw.config.get("wgServer")}/wiki/${getFullLogPage(spiHelperSettings.log.page)}`;
      },
      isCheckUser() {
        const { debug } = this.instanceSettings;
        const isCU = mw.config.get("wgUserGroups")?.includes("checkuser") ?? false;
        return isCU || debug.enabled && debug.forceCheckuser;
      },
      inputChipItems: {
        get() {
          return this.instanceSettings.defaultActions.map((actionName) => ({
            value: actionName,
            label: actionName.charAt(0).toUpperCase() + actionName.slice(1)
          }));
        },
        set(value) {
          this.instanceSettings.defaultActions = value.map((item) => item.value);
        }
      }
    },
    watch: {
      open(newVal) {
        if (newVal) {
          if (!this.showExtra && this.showExtraHandler) {
            window.addEventListener("keydown", this.showExtraHandler);
          }
        } else {
          const currentSettingsJson = JSON.stringify(this.instanceSettings);
          const settingsDiffer = JSON.stringify(this.oldSettings) !== currentSettingsJson;
          if (settingsDiffer) {
            setGlobalSettings(toRaw(this.instanceSettings));
            const savingId = this.toaster.info("Saving settings...", { autoDismiss: false });
            saveOptions().then((_) => {
              this.toaster.success("Settings saved! Reload to apply them", { autoDismiss: true });
            }).catch((error) => {
              const message = error instanceof Error ? error.message : String(error);
              this.toaster.error(`Failed to save settings: ${message}`, { autoDismiss: true });
            }).always(() => {
              this.oldSettings = JSON.parse(currentSettingsJson);
              setTimeout(() => {
                this.toaster.dismiss(savingId);
              }, 3000);
            });
          }
          if (this.showExtraHandler) {
            window.removeEventListener("keydown", this.showExtraHandler);
          }
        }
      }
    },
    mounted() {
      this.openHandler = () => {
        this.open = true;
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "options" });
      };
      this.openButton.addEventListener("click", this.openHandler);
      //! Use the Konami code to unlock debug menu
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
      this.showExtraHandler = (e) => {
        if (e.key === konami[i]) {
          i++;
          if (i === konami.length) {
            this.showExtra = true;
            this.showExtraMessage = true;
            if (this.showExtraHandler) {
              window.removeEventListener("keydown", this.showExtraHandler);
            }
            i = 0;
          }
        } else {
          i = 0;
        }
      };
    },
    beforeUnmount() {
      if (this.openHandler) {
        this.openButton.removeEventListener("click", this.openHandler);
      }
    },
    methods: {
      isMenuGroupData,
      loadDefaults() {
        this.instanceSettings = JSON.parse(JSON.stringify(spiHelperDefaultSettings));
        Object.assign(spiHelperSettings, spiHelperDefaultSettings);
        this.resetTrigger++;
      },
      launchFeedback() {
        this.open = false;
        this.feedbackDialog.launch({
          subject: `Feedback from ${mw.config.get("wgUserName")}`,
          message: `Options form v${VERSION}-${MODE}`
        });
      },
      removeTemplateEntry(index) {
        this.instanceSettings.custom.commentTemplates.splice(index, 1);
      },
      addTemplateEntry(type) {
        if (type === "item") {
          this.instanceSettings.custom.commentTemplates.push({ label: "", value: "" });
        } else {
          this.instanceSettings.custom.commentTemplates.push({ label: "", items: [] });
        }
      },
      moveDown(arr, index) {
        if (index < 0 || index >= arr.length - 1)
          return arr;
        const temp = arr[index + 1];
        arr[index + 1] = arr[index];
        arr[index] = temp;
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
          <cdx-button weight="quiet" type="button" aria-label="Give feedback" @click="launchFeedback">
            <cdx-icon :icon="icons.cdxIconFeedback" />
          </cdx-button>
          <cdx-button
              class="cdx-dialog__header__close-button"
              weight="quiet"
              type="button"
              aria-label="Close"
              @click="open = false"
          >
            <cdx-icon :icon="icons.cdxIconClose" />
          </cdx-button>
        </div>
      </template>
      <p>Configure your spiHelper options</p>
      <cdx-message v-if="showExtraMessage" type="success" :fade-in="true" :auto-dismiss="true" :display-time="3000">
        Debug menu enabled
      </cdx-message>
      <cdx-accordion :action-icon="icons.cdxIconWatchlist" :action-always-visible="true">
        <template #title>Watch</template>
        <watch-setting label="Cases" v-model="instanceSettings.watch.case" :reset-trigger="resetTrigger" />
        <watch-setting label="Archives" v-model="instanceSettings.watch.archive" :reset-trigger="resetTrigger" />
        <watch-setting label="Tagged Users" v-model="instanceSettings.watch.tagged" :reset-trigger="resetTrigger" />
        <watch-setting label="Categories" v-model="instanceSettings.watch.categories" :reset-trigger="resetTrigger" />
        <cdx-field>
          <template #label>Blocked Users</template>
          <cdx-toggle-switch v-model="instanceSettings.watch.blocked" />
          <template #help-text>Due to API limitations, only a toggle is available</template>
        </cdx-field>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconClock" :action-always-visible="true">
        <template #title>Expiry</template>
        <p>
          Expiry values may be relative (e.g. 5 months or 2 weeks) or absolute (e.g. 2014-09-18T12:34:56Z). For no
          expiry, use infinite, indefinite, infinity or never.
        </p>
        <expiry-setting label="Cases" v-model="instanceSettings.expiry.case" :reset-trigger="resetTrigger" />
        <expiry-setting label="Archives" v-model="instanceSettings.expiry.archive" :reset-trigger="resetTrigger" />
        <expiry-setting label="Tagged Users" v-model="instanceSettings.expiry.tagged" :reset-trigger="resetTrigger" />
        <expiry-setting label="Categories" v-model="instanceSettings.expiry.categories"
                        :reset-trigger="resetTrigger" />
        <expiry-setting label="Blocked Users" v-model="instanceSettings.expiry.blocked"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconJournal" :action-always-visible="true">
        <template #title>Log</template>
        <cdx-toggle-switch v-model="instanceSettings.log.enabled">
          Enabled
          <template #description>Log all actions to your userspace</template>
        </cdx-toggle-switch>
        <div v-if="instanceSettings.log.enabled">
          <log-page-setting v-model="instanceSettings.log.page" :prefix="logPrefix" />
          <br>
          <cdx-toggle-switch v-model="instanceSettings.log.reversed">
            Reverse log
            <template #description>Reverse said log, so that the newest actions are at the top</template>
          </cdx-toggle-switch>
          <p style="word-wrap: anywhere">
            Logging to [[<a :href="logPage">{{ logPrefix + instanceSettings.log.page }}</a>]]
          </p>
        </div>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconLayout" :action-always-visible="true">
        <template #title>Interface</template>
        <cdx-toggle-switch v-model="instanceSettings.interface.displayIPv6As64" :align-switch="true">
          Display IPv6 as /64
          <template #description>Default IPv6 listings to /64 in the block/tag socks menu</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.interface.fullPreview" :align-switch="true">
          Full preview
          <template #description>Include the entire section's text when previewing comments</template>
        </cdx-toggle-switch>
        <expiry-setting label="Default block duration" v-model="instanceSettings.interface.defaultBlockDuration"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconPalette" :action-always-visible="true">
        <template #title>Customisation</template>
        <div>
          <h3 style="padding-top: 0;">Comment templates</h3>
          <div class="spiHelper-template-container">
            <div v-for="(entry, i) in instanceSettings.custom.commentTemplates" :key="i" class="spiHelper-template">
              <div v-if="isMenuGroupData(entry)">
                <div class="spiHelper-template-input">
                  <cdx-text-input v-model="entry.label" placeholder="Group label" />
                  <cdx-button @click="moveDown(instanceSettings.custom.commentTemplates, i)"
                              aria-label="Move group down"
                              :disabled="instanceSettings.custom.commentTemplates.length <= i + 1">
                    <cdx-icon :icon="icons.cdxIconArrowDown" />
                  </cdx-button>
                  <cdx-button @click="entry.items.push({ label: '', value: '' })" action="progressive"
                              aria-label="Add item to group">
                    <cdx-icon :icon="icons.cdxIconAdd" />
                  </cdx-button>
                  <cdx-button @click="removeTemplateEntry(i)" action="destructive" aria-label="Delete group">
                    <cdx-icon :icon="icons.cdxIconTrash" />
                  </cdx-button>
                </div>
                <div v-for="(item, j) in entry.items" :key="j"
                     class="spiHelper-template-group-item spiHelper-template-input">
                  <cdx-text-input v-model="item.label" placeholder="Label" />
                  <page-lookup v-model="item.value" placeholder="Template (no brackets)" :namespace="10"
                               :validate-message="false" />
                  <cdx-button @click="moveDown(entry.items, j)" aria-label="Move item down"
                              :disabled="entry.items.length <= j + 1">
                    <cdx-icon :icon="icons.cdxIconArrowDown" />
                  </cdx-button>
                  <cdx-button @click="entry.items.splice(j, 1)" action="destructive" aria-label="Delete item">
                    <cdx-icon :icon="icons.cdxIconTrash" />
                  </cdx-button>
                </div>
              </div>
              <div v-else class="spiHelper-template-input">
                <cdx-text-input v-model="entry.label" placeholder="Label" />
                <page-lookup v-model="entry.value" placeholder="Template (no brackets)" :namespace="10"
                             :validate-message="false" />
                <cdx-button @click="moveDown(instanceSettings.custom.commentTemplates, i)" aria-label="Move item down"
                            :disabled="instanceSettings.custom.commentTemplates.length <= i + 1">
                  <cdx-icon :icon="icons.cdxIconArrowDown" />
                </cdx-button>
                <cdx-button @click="removeTemplateEntry(i)" action="destructive" aria-label="Delete item">
                  <cdx-icon :icon="icons.cdxIconTrash" />
                </cdx-button>
              </div>
            </div>
          </div>
        </div>

        <cdx-button @click="addTemplateEntry('item')" action="progressive">
          <cdx-icon :icon="icons.cdxIconAdd" />
          Add item
        </cdx-button>
        <cdx-button @click="addTemplateEntry('group')" action="progressive">
          <cdx-icon :icon="icons.cdxIconAdd" />
          Add group
        </cdx-button>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconCode" :action-always-visible="true" v-if="showExtra">
        <template #title>Debug</template>
        <cdx-toggle-switch v-model="instanceSettings.debug.enabled" :align-switch="true">
          Enabled
        </cdx-toggle-switch>
        <cdx-field v-if="instanceSettings.debug.enabled">
          <template #description>These will override your roles. For example, if you are an administrator and force
            admin is unchecked, spiHelper will not consider you as an admninistrator.
          </template>
          <cdx-toggle-switch v-model="instanceSettings.debug.forceCheckuser" :align-switch="true">
            Force CheckUser state
          </cdx-toggle-switch>
          <cdx-toggle-switch v-model="instanceSettings.debug.forceAdmin" :align-switch="true">
            Force Admin state
          </cdx-toggle-switch>
        </cdx-field>
      </cdx-accordion>
      <div class="spiHelper-setting">
        <cdx-toggle-switch v-model="instanceSettings.clerk" :align-switch="true">Clerk</cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.tickArchiveWhenCaseClosed" :align-switch="true">
          Archive closed by default
          <template #description>If the case is closed, enable archival by default</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-if="isCheckUser" v-model="instanceSettings.useCheckuserblockAccount" :align-switch="true">
          Use &#123;&#123;<a href="//en.wikipedia.org/wiki/Template:Checkuserblock-account">checkuserblock-account</a>&#125;&#125;
          when CU blocking
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.useLookup" :align-switch="true">
          Use lookups
          <template #description>Use the API to suggest autocompletions</template>
        </cdx-toggle-switch>
        <cdx-field>
          <cdx-multiselect-lookup
              v-model:input-chips="inputChipItems" v-model:selected="selectedChipItems"
              :menu-items="caseActionMenuItems">
            <template #no-results>
              No actions found
            </template>
          </cdx-multiselect-lookup>
          <template #label>
            Default actions
          </template>
          <template #description>
            Actions to have enabled by default when opening the form
          </template>
        </cdx-field>
        <cdx-toggle-switch v-model="instanceSettings.highlightSection" :align-switch="true">
          Highlight section
          <template #description>
            Highlight the selected SPI section to prevent editing the wrong one
          </template>
        </cdx-toggle-switch>
        <br>
        <cdx-button @click="loadDefaults">
          Load defaults
          <cdx-icon :icon="icons.cdxIconReload" />
        </cdx-button>
      </div>
    </cdx-dialog>
  `
  });
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
      },
      management: {
        label: "SPI Management",
        selectionType: "case"
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
          text: "* ",
          bySection: new Map
        }
      },
      status: {
        enabled: false,
        data: {
          old: "new",
          new: "nochange",
          bySection: new Map
        }
      },
      block: {
        enabled: false,
        data: setupBlockActionData(context.userName)
      },
      link: {
        enabled: false
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
          target: "",
          suppress: false,
          addNote: false
        }
      },
      archive: {
        enabled: false
      }
    };
  }
  var NonArchiveActions = new Set(["status", "management", "comment", "move", "archive"]);
  var ClerkOnlyActions = new Set(["move", "archive", "management"]);
  var AlwaysAvailableActions = new Set(["sections", "move", "archive", "block", "link"]);
  var SpecificSectionActions = new Set(["status", "comment"]);

  // src/ui/views/top/utils/actionVisibility.ts
  function shouldShowAction(opts) {
    const { name, selection, selectionType } = opts;
    if (context.isArchive) {
      return !NonArchiveActions.has(name);
    }
    if (!spiHelperIsClerk() && ClerkOnlyActions.has(name)) {
      return false;
    }
    if (name === "sections")
      return true;
    if (selection === null)
      return false;
    if (selectionType === "both")
      return true;
    if (Array.isArray(selection))
      return true;
    return selectionType === "case" === (selection === "all");
  }
  function actionLabelText(opts) {
    const { label, selectionType, allSelected } = opts;
    if (typeof label === "string") {
      return label;
    }
    if (selectionType === "both") {
      return allSelected ? label.case : label.section;
    }
    return "Unexpected configuration";
  }
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
  // src/ui/views/top/utils/block.ts
  var MS_PER_SECOND = 1000;
  var MS_PER_DAY = 24 * 60 * 60 * MS_PER_SECOND;
  var MS_PER_FIXED_UNIT = {
    second: MS_PER_SECOND,
    minute: 60 * MS_PER_SECOND,
    hour: 60 * 60 * MS_PER_SECOND,
    day: MS_PER_DAY,
    week: 7 * MS_PER_DAY
  };
  function addRelativeExpiry(from, amount, unit) {
    const fixedUnit = MS_PER_FIXED_UNIT[unit];
    if (fixedUnit !== undefined) {
      return from.getTime() + amount * fixedUnit;
    }
    const whole = Math.floor(amount);
    const fraction = amount - whole;
    const end = new Date(from.getTime());
    if (unit === "month") {
      end.setUTCMonth(end.getUTCMonth() + whole);
      return end.getTime() + fraction * 30.44 * MS_PER_DAY;
    }
    end.setUTCFullYear(end.getUTCFullYear() + whole);
    return end.getTime() + fraction * 365.25 * MS_PER_DAY;
  }
  function expiryToTimestamp(expiry, from = new Date) {
    if (isNoExpiry(expiry))
      return Infinity;
    if (isAbsoluteExpiry(expiry)) {
      const parsed = Date.parse(expiry);
      return isNaN(parsed) ? null : parsed;
    }
    const relativeMatch = RELATIVE_EXPIRY_REGEX.exec(expiry);
    if (!relativeMatch)
      return null;
    const [, rawAmount = "", rawUnit = ""] = relativeMatch;
    const amount = Number(rawAmount);
    if (isNaN(amount))
      return null;
    return addRelativeExpiry(from, amount, rawUnit.toLowerCase().replace(/s$/, ""));
  }
  function findBlockLeniency(opts) {
    const { username, existing, intended, now = new Date } = opts;
    const reasons = [];
    const existingEnd = expiryToTimestamp(existing.duration, now);
    const intendedEnd = expiryToTimestamp(intended.duration, now);
    if (existingEnd !== null && intendedEnd !== null && intendedEnd < existingEnd) {
      reasons.push("it expires sooner");
    }
    if (existing.acb && !intended.acb) {
      reasons.push("account creation is re-enabled");
    }
    if (mw.util.isIPAddress(username, true)) {
      if (!existing.abao && intended.abao) {
        reasons.push("it becomes anon-only");
      }
    } else if (existing.abao && !intended.abao) {
      reasons.push("autoblock is disabled");
    }
    if (existing.ntp && !intended.ntp) {
      reasons.push("talk page access is restored");
    }
    if (existing.nem && !intended.nem) {
      reasons.push("email access is restored");
    }
    return reasons;
  }
  // src/ui/views/top/utils/status.ts
  function resolveStatusChoice(choice) {
    switch (choice) {
      case "reopen":
        return "open";
      case "selfendorse":
        return "endorse";
      default:
        return choice;
    }
  }
  function resolveEffectiveStatus(change) {
    if (!change.enabled || change.new === "nochange") {
      return change.old;
    }
    return resolveStatusChoice(change.new);
  }
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
      case "new":
      case "open":
      case "nochange":
        return null;
      default: {
        console.warn("New case status", status, "is unexpected");
        return null;
      }
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
    if (/^(?:checked|completed)$/i.test(caseStatus))
      return "checked";
    if (/^declined?$/i.test(caseStatus))
      return "decline";
    if (/^cudeclined?$/i.test(caseStatus))
      return "cudecline";
    if (/^endorsed?$/i.test(caseStatus))
      return "endorse";
    if (/^cuendorsed?$/i.test(caseStatus))
      return "cuendorse";
    if (/^(?:CU|checkuser|CUrequest|request)$/i.test(caseStatus))
      return "CUrequest";
    if (/^cumoreinfo$/i.test(caseStatus))
      return "cumoreinfo";
    if (/^moreinfo$/i.test(caseStatus))
      return "moreinfo";
    if (/^hold$/i.test(caseStatus))
      return "hold";
    if (/^cuhold$/i.test(caseStatus))
      return "cuhold";
    if (/^clerk$/i.test(caseStatus))
      return "clerk";
    if (/^admin(?:istrator)?$/i.test(caseStatus))
      return "admin";
    return "new";
  }

  // src/ui/views/top/utils/commentClaims.ts
  function templateMatcher(...names) {
    return ({ templateNames }) => {
      const claimed = names.find((name) => templateNames.has(name.toLowerCase()));
      return claimed ? `{{${claimed}}}` : null;
    };
  }
  function textMatcher(word) {
    const pattern = new RegExp(String.raw`\b${word}\b`, "i");
    return ({ wikitext }) => {
      const match = pattern.exec(wikitext);
      return match ? `the word "${match[0]}"` : null;
    };
  }
  var choicesWithTemplates = [
    "CUrequest",
    "admin",
    "clerk",
    "selfendorse",
    "inprogress",
    "decline",
    "cudecline",
    "endorse",
    "cuendorse",
    "moreinfo",
    "cumoreinfo",
    "relist",
    "hold",
    "cuhold",
    "reopen"
  ];
  var statusesByTemplate = choicesWithTemplates.reduce((byTemplate, choice) => {
    const template = getStatusTemplate(choice);
    if (template) {
      const name = template.slice("{{".length, -"}}".length);
      const status = resolveStatusChoice(choice);
      byTemplate.set(name, (byTemplate.get(name) ?? new Set).add(status));
    }
    return byTemplate;
  }, new Map);
  function statusChecks(effectiveStatus) {
    const unfulfilledText = `the case status is set to ${effectiveStatus}`;
    return [
      {
        matchers: [
          templateMatcher("btc", "Action and close", "Closing without action", "cwa"),
          textMatcher("closing")
        ],
        fulfilled: effectiveStatus === "closed",
        unfulfilledText
      },
      ...[...statusesByTemplate].map(([name, statuses]) => ({
        matchers: [templateMatcher(name)],
        fulfilled: statuses.has(effectiveStatus),
        unfulfilledText
      }))
    ];
  }
  function actionChecks(facts) {
    return [
      {
        matchers: [templateMatcher("bnt", "btc", "bwt", "sblock", "IPblock")],
        fulfilled: facts.blockPlanned,
        unfulfilledText: "no block is set to be applied"
      },
      {
        matchers: [templateMatcher("GlobalLocksRequested", "glr")],
        fulfilled: facts.globalRequestPlanned,
        unfulfilledText: "no lock or global block is set to be requested"
      }
    ];
  }
  function findCommentClaims(commentText, facts) {
    const comment = {
      wikitext: commentText,
      templateNames: new Set(parseTemplates(commentText).map((t) => t.name))
    };
    const checks = [...statusChecks(facts.effectiveStatus), ...actionChecks(facts)];
    return checks.flatMap(({ matchers, fulfilled, unfulfilledText }) => {
      if (fulfilled) {
        return [];
      }
      const quoted = matchers.map((match) => match(comment)).find((result) => result !== null);
      return quoted ? [{ quoted, reason: unfulfilledText }] : [];
    });
  }
  // src/ui/views/top/utils/section.ts
  var SockListTemplateRegex = /sock ?list/;
  var UserTemplateNameParts = ["ip", "vandal", "user", "noping", "np"];
  function isRelevantTemplate(templateName) {
    return SockListTemplateRegex.test(templateName) || UserTemplateNameParts.some((part) => templateName.includes(part));
  }
  function getSockEntries(opts) {
    const { text, fullSearch, state } = opts;
    const likelySocks = fullSearch ? [generateUserRow(context.userName, state)] : [];
    const possibleSocks = [];
    const allUsernames = fullSearch ? new Set([context.userName]) : new Set;
    if (fullSearch) {
      let $searchOrigin = $(document);
      if (state.selectedSection?.type === "single") {
        $searchOrigin = $(`a[href$="section=${state.selectedSection.section.id}"]`).parentsUntil(":has(hr)").last().nextUntil("hr");
      }
      const sockList = $searchOrigin.find(".cuEntry").toArray().map((entry) => entry.querySelector("a")).filter((link) => link !== null);
      for (const entryElement of sockList) {
        const filteredUsername = Array.from(entryElement.childNodes).find((n) => n.nodeType === Node.TEXT_NODE)?.textContent ?? "";
        if (!filteredUsername) {
          continue;
        }
        const username = spiHelperNormalizeUsername(filteredUsername);
        if (allUsernames.has(username)) {
          continue;
        }
        likelySocks.push(generateUserRow(username, state));
        allUsernames.add(username);
      }
    }
    const allTemplates = parseTemplates(text);
    for (const template of allTemplates) {
      if (isRelevantTemplate(template.name)) {
        const templateUsernames = fetchTemplateArguments(template);
        for (const templateUsername of templateUsernames) {
          const username = spiHelperNormalizeUsername(templateUsername);
          if (!allUsernames.has(username)) {
            possibleSocks.push(generateUserRow(username, state));
            allUsernames.add(username);
          }
        }
      }
    }
    return [likelySocks, possibleSocks];
  }
  async function ensureUsersFetched(usernames, fetchedUsers) {
    const newUsernames = new Set([...usernames].filter((name) => !fetchedUsers.has(name)));
    const registeredUsernames = new Set;
    const unregisteredUsernames = new Set;
    for (const name of newUsernames) {
      (isNonRegisteredAccount(name) ? unregisteredUsernames : registeredUsernames).add(name);
    }
    const validUserPages = [...registeredUsernames].map((name) => `User:${name}`);
    const lookups = await Promise.all([
      spiHelperGetBulkUserBlockSettings(newUsernames),
      spiHelperGetBulkPageText(validUserPages),
      spiHelperGetBulkGlobalUsers(registeredUsernames),
      spiHelperGetBulkGlobalBlocks(unregisteredUsernames)
    ]).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      new VueMessage({
        type: "warning",
        content: `Could not look up blocks and tags for these accounts: ${message}`
      }).show();
      return null;
    });
    if (!lookups) {
      return;
    }
    const [blockSettings, userPages, globalUsers, globalBlocks] = lookups;
    for (const name of newUsernames) {
      const fetched = {
        block: blockSettings.get(name),
        userPage: userPages.get(`User:${name}`),
        globalUser: globalUsers.get(name),
        globalBlock: globalBlocks.get(name)
      };
      fetchedUsers.set(name, markRaw(fetched));
    }
  }
  function applyFetchedUser(opts) {
    const { userRow, defaultBlock, blockData, state } = opts;
    const fetched = blockData.fetchedUsers.get(userRow.username);
    const { userRow: newRow, globalStatus } = setUserRowData({
      userRow,
      fetchedUser: fetched,
      defaultBlock,
      state
    });
    if (fetched?.block) {
      blockData.userBlocks.set(newRow.username, fetched.block);
    }
    switch (globalStatus.kind) {
      case "locked":
        blockData.userLocks.set(newRow.username, globalStatus.locked);
        break;
      case "gblocked":
        blockData.userGlobalBlocks.set(newRow.username, globalStatus.blocked);
        break;
      case "none":
        break;
    }
    return newRow;
  }
  function applyFetchedUsers(opts) {
    const { accounts, usernames, blockData, state } = opts;
    for (const userRow of accounts) {
      if (!usernames.has(userRow.username)) {
        continue;
      }
      applyFetchedUser({
        userRow,
        defaultBlock: userRow.block.block,
        blockData,
        state
      });
    }
  }
  async function prefetchSockRows(opts) {
    const { likelySocks, possibleSocks, blockData, state } = opts;
    const allRows = [...likelySocks, ...possibleSocks];
    const likelyIds = new Set(likelySocks.map((sock) => sock.id));
    await ensureUsersFetched(new Set(allRows.map((row) => row.username)), blockData.fetchedUsers);
    return allRows.map((userRow) => applyFetchedUser({
      userRow,
      defaultBlock: likelyIds.has(userRow.id),
      blockData,
      state
    }));
  }
  // src/ui/views/top/actionAccordion.ts
  var ActionAccordionComponent = defineComponent({
    props: {
      selection: {
        type: [Number, Array, String, null],
        required: true
      },
      name: { type: String, required: true },
      label: { type: [String, Object], required: true },
      selectionType: { type: String, required: true },
      displayedForms: { type: Set, required: true },
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
        return shouldShowAction({
          name: this.name,
          selection: this.selection,
          selectionType: this.selectionType
        });
      },
      text() {
        return actionLabelText({
          label: this.label,
          selectionType: this.selectionType,
          allSelected: this.allSelected
        });
      },
      showEnabledClass() {
        return this.name !== "sections" && this.actionEnabled;
      }
    },
    template: `
    <cdx-accordion
        v-if="showAccordion"
        :name="name"
        :model-value="displayedForms.has(name)"
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
      selection: {
        type: [Number, Array, String, null],
        required: true
      },
      name: { type: String, required: true },
      label: { type: [String, Object], required: true },
      selectionType: { type: String, required: true },
      displayedForms: { type: Set, required: true },
      actionEnabled: { type: Boolean, required: true }
    },
    computed: {
      buttonEnabled() {
        return this.displayedForms.has(this.name) || this.actionEnabled;
      },
      allSelected() {
        return this.selection === "all";
      },
      showButton() {
        return shouldShowAction({
          name: this.name,
          selection: this.selection,
          selectionType: this.selectionType
        });
      },
      buttonAction() {
        return this.buttonEnabled ? "progressive" : "normal";
      },
      buttonStyle() {
        return {
          opacity: this.buttonEnabled ? 1 : 0.7,
          color: this.displayedForms.has(this.name) ? "var(--color-base)" : ""
        };
      },
      text() {
        return actionLabelText({
          label: this.label,
          selectionType: this.selectionType,
          allSelected: this.allSelected
        });
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
    data() {
      return { built: this.enabled };
    },
    watch: {
      enabled(newValue) {
        if (!newValue || this.built) {
          return;
        }
        requestAnimationFrame(() => {
          this.built = this.enabled;
        });
      }
    },
    template: `
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="!empty && built" v-show="enabled">
      <slot />
    </div>
  `
  });
  // src/ui/views/top/actionContent.ts
  var ActionContentComponent = defineComponent({
    props: {
      name: { type: String, required: true },
      caseActions: { type: Object, required: true },
      accounts: { type: Array, required: true },
      state: { type: Object, required: true },
      multiSelectMode: { type: Boolean, required: true },
      selectedSections: { type: Array, required: true }
    },
    emits: [
      "update:multiSelectMode",
      "update-multi-select-sections",
      "update-section-selection",
      "update-status",
      "update-section-status",
      "user-selected",
      "remove-rows",
      "add-row",
      "fetch-rows",
      "move-entire-case"
    ],
    computed: {
      caseName() {
        return context.caseName;
      },
      isMultiSelect() {
        return this.state.selectedSection?.type === "multiple";
      }
    },
    methods: {
      handleUpdateSectionSelection(selection) {
        this.$emit("update-section-selection", selection);
      },
      handleUpdateStatus(newStatus) {
        this.$emit("update-status", newStatus);
      },
      handleUpdateSectionStatus(sectionId, newStatus) {
        this.$emit("update-section-status", sectionId, newStatus);
      },
      handleUserSelected(data, rowId) {
        this.$emit("user-selected", data, rowId);
      },
      handleRemoveRows(rowIds) {
        this.$emit("remove-rows", rowIds);
      },
      handleAddRow(row) {
        this.$emit("add-row", row);
      },
      handleFetchRows() {
        this.$emit("fetch-rows");
      },
      handleMoveEntireCase() {
        this.$emit("move-entire-case");
      }
    },
    template: `
    <!-- Sections special case -->
    <section-action v-if="name === 'sections'"
                    :selected-section="caseActions.sections.data.section" :all-sections="state.sections"
                    :multi-select-mode="multiSelectMode" :selected-sections="selectedSections"
                    @update-section-selection="handleUpdateSectionSelection"
                    @update:multi-select-mode="$emit('update:multiSelectMode', $event)"
                    @update-multi-select-sections="$emit('update-multi-select-sections', $event)" />
    <!-- Other actions -->
    <multi-section-comment-action v-else-if="name === 'comment' && isMultiSelect"
                                  :sections="selectedSections" :by-section="caseActions.comment.data.bySection" />
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" :selected-section="state.selectedSection" />
    <multi-section-status-action v-else-if="name === 'status' && isMultiSelect"
                                 :sections="selectedSections" :by-section="caseActions.status.data.bySection"
                                 @update-section-status="handleUpdateSectionStatus" />
    <change-status-action v-else-if="name === 'status'" v-model:enabled="caseActions.status.enabled"
                          :old-status="caseActions.status.data.old" v-model:new-status="caseActions.status.data.new"
                          @update:new-status="handleUpdateStatus" />
    <block-action v-else-if="name === 'block'" v-model:enabled="caseActions.block.enabled" fetch-type="comment"
                  v-model:block-options="caseActions.block.data.options" :accounts="accounts"
                  :default-master="caseActions.block.data.master"
                  :user-locks="caseActions.block.data.userLocks"
                  :user-global-blocks="caseActions.block.data.userGlobalBlocks"
                  :user-blocks="caseActions.block.data.userBlocks"
                  @user-selected="handleUserSelected"
                  @remove-rows="handleRemoveRows" @add-row="handleAddRow"
                  @fetch-rows="handleFetchRows" />
    <link-action v-else-if="name === 'link'" v-model:enabled="caseActions.link.enabled"
                 :accounts="accounts" :case-name="caseName"
                 @user-selected="handleUserSelected"
                 @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target" v-model:suppress="caseActions.move.data.suppress"
                 v-model:addNote="caseActions.move.data.addNote"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled"
                 @move-entire-case="handleMoveEntireCase" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="state.selectedSection"
                    :status-action="caseActions.status" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
  `
  });
  // src/ui/views/userLookup.ts
  var ITEM_LIMIT = 10;
  var SEARCH_DEBOUNCE_MS = 250;
  function toMenuItem(user) {
    return {
      label: user.name,
      value: user.userid.toString(),
      customData: user
    };
  }
  function UpdateUserAllUserData(data, row) {
    if (data.blockid !== undefined) {
      row.block.block = true;
    }
    if (data.blocknocreate !== undefined) {
      row.block.acb = data.blocknocreate;
    }
    if (data.blockemail !== undefined) {
      row.block.nem = data.blockemail;
    }
    if (mw.util.isIPAddress(data.name)) {
      if (data.blockanononly !== undefined) {
        row.block.abao = data.blockanononly;
      }
    } else {
      if (data.blockautoblocking !== undefined) {
        row.block.abao = data.blockautoblocking;
      }
    }
    if (data.blockowntalk !== undefined) {
      row.block.ntp = data.blockowntalk;
    }
    if (data.blockexpiry) {
      row.block.duration = data.blockexpiry;
    }
  }
  var UserLookupComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      label: { type: String, required: false, default: "" },
      allowEmpty: { type: Boolean, default: true }
    },
    emits: ["update:modelValue", "user-selected"],
    data() {
      const menuConfig = {
        visibleItemLimit: 6,
        searchQuery: ""
      };
      const messages2 = {
        success: "Valid user",
        warning: "User not found",
        error: "Field must not be empty"
      };
      return {
        lookupStatus: "default",
        messages: messages2,
        selection: null,
        userSuggestions: [],
        menuConfig,
        useLookup: spiHelperSettings.useLookup,
        searchController: null
      };
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
    },
    beforeUnmount() {
      this.cancelPendingSearch();
    },
    methods: {
      cancelPendingSearch() {
        this.searchController?.abort();
        this.searchController = null;
      },
      startSearch() {
        this.cancelPendingSearch();
        const controller = new AbortController;
        this.searchController = controller;
        return controller.signal;
      },
      async onUpdateInputValue(value) {
        const trimmedValue = value.trim();
        this.menuConfig.searchQuery = trimmedValue;
        const signal = this.startSearch();
        if (!trimmedValue) {
          this.userSuggestions = [];
          return;
        }
        await abortableDelay(SEARCH_DEBOUNCE_MS, signal);
        if (isAborted(signal)) {
          return;
        }
        const users = await spiHelperGetUsers({ from: trimmedValue, limit: ITEM_LIMIT, signal });
        if (isAborted(signal)) {
          return;
        }
        this.userSuggestions = users.map(toMenuItem);
      },
      onFocus() {
        if (this.userSuggestions.length === 0) {
          this.onLoadMore();
        }
      },
      async onLoadMore() {
        if (!this.username) {
          return;
        }
        const signal = this.startSearch();
        const users = await spiHelperGetUsers({
          from: this.username.trim(),
          limit: this.userSuggestions.length + ITEM_LIMIT,
          signal
        });
        if (isAborted(signal) || users.length === 0) {
          return;
        }
        this.userSuggestions = users.map(toMenuItem);
      },
      async validateInstantly() {
        await this.$nextTick();
        if (this.username.length === 0) {
          this.lookupStatus = this.allowEmpty ? "default" : "error";
          return;
        }
        if (mw.util.isIPAddress(this.username)) {
          this.lookupStatus = "default";
          return;
        }
        const selection = this.userSuggestions.find((item) => item.label === this.username || item.label?.trim() === this.username.trim()) ?? null;
        if (selection !== null) {
          this.$emit("user-selected", selection.customData);
          this.selection = selection.value;
        }
        this.lookupStatus = this.selection === null ? "warning" : "success";
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
          @focus="onFocus"
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
  `
  });

  // src/archivenotice.ts
  async function spiHelperParseArchiveNotice(opts) {
    const { page, state } = opts;
    let pageText;
    if (page === context.pageName && state) {
      pageText = await loadCaseText(state);
    } else {
      pageText = await spiHelperGetPageText(page, false);
    }
    return spiHelperParseArchiveNoticeText(pageText);
  }
  function spiHelperParseArchiveNoticeText(pageText) {
    if (pageText === "") {
      return null;
    }
    const templates = parseTemplates(pageText);
    const archiveNoticeTemplate = templates.find((tl) => spiHelperArchiveNoticeNameRegex.test(tl.name));
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
      if (val !== true) {
        console.warn("Malformed archivenotice parameter", key, "=", val);
        continue;
      }
      if (key in flags) {
        flags[key] = true;
      } else {
        console.warn("Unrecognised archivenotice parameter", key, "=", val);
        new VueMessage({
          type: "warning",
          content: `Ignoring unrecognised archive notice parameter |${key}`
        }).showOnce();
      }
    }
    return new ParsedArchiveNotice({ username, ...flags });
  }

  // src/actions/archive.ts
  var MAX_SUB_ARCHIVES = 30;
  async function spiHelperArchiveCase(state, explicitSections) {
    const sectionFetchMessage = new VueMessage({
      type: "notice",
      content: "Loading all sections"
    }).show();
    const pageTextPromise = loadCaseText(state);
    const candidateSections = explicitSections ?? state.sections;
    const sectionsToArchive = (await Promise.all(candidateSections.map(async (section) => {
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
      return [];
    }
    let newArchiveText = await spiHelperGetPageText(context.archiveName, true);
    const overflowResult = await spiHelperMoveArchiveIfOverflowing(context.pageName, context.archiveName);
    if (overflowResult === "abort")
      return [];
    if (overflowResult === "moved")
      newArchiveText = "";
    const archiveExists = newArchiveText !== "";
    if (archiveExists) {
      newArchiveText = newArchiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, `
{{SPIpriorcases}}`);
    } else {
      newArchiveText = `__TOC__
{{SPI archive notice|1=${context.caseName}}}
{{SPIpriorcases}}
`;
    }
    const archiveSectionEntries = archiveExists ? await spiHelperGetInvestigationSections({ pageName: context.archiveName }) : [];
    const parsedArchiveSections = archiveExists && archiveSectionEntries.length === 0 ? null : parseArchiveSections(newArchiveText, archiveSectionEntries);
    if (!parsedArchiveSections) {
      new VueMessage({ type: "notice", content: "Failed to parse existing archive sections, aborting archival" }).show();
      return [];
    }
    const archivedSections = [];
    for (const section of sectionsToArchive) {
      const sectionText = await loadSectionText(section);
      newText = newText.replace(sectionText + `
`, "").replace(sectionText, "");
      const headerIndex = sectionText.search(spiHelperSectionRegex);
      const cleanSectionText = (headerIndex === -1 ? sectionText : sectionText.slice(headerIndex)).replace(spiHelperCaseStatusRegex, "").trim();
      if (newArchiveText.includes(cleanSectionText)) {
        new VueMessage({ type: "warning", content: `Section ${section.name} already exists in the archive` }).show();
        continue;
      }
      const parsedDate = parseSectionDate(section.name);
      if (!parsedDate) {
        new VueMessage({
          type: "error",
          content: `Failed to parse date from section header "${section.name}", aborting archival`
        }).show();
        return [];
      }
      parsedArchiveSections.push({ header: parsedDate, fullText: cleanSectionText });
      archivedSections.push(section);
    }
    if (archivedSections.length === 0) {
      new VueMessage({ type: "warning", content: "Nothing to archive" }).show();
      return [];
    }
    newArchiveText = rebuildArchiveText(newArchiveText, parsedArchiveSections);
    const summaryPrefix = `Archiving ${countOf(archivedSections.length, "section")}`;
    const archiveSuccess = await spiHelperEditPage({
      title: context.archiveName,
      newText: newArchiveText,
      summary: `${summaryPrefix} from [[${context.pageName}]]`,
      watch: spiHelperSettings.watch.archive,
      watchExpiry: spiHelperSettings.expiry.archive
    }) !== null;
    if (!archiveSuccess) {
      new VueMessage({ type: "error", content: "Failed to update archive, not removing sections from case page" }).show();
      return [];
    }
    await context.edit({
      newText,
      summary: `${summaryPrefix} to [[${context.archiveName}]]`,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId
    });
    return archivedSections;
  }
  async function spiHelperArchiveCaseSection(section) {
    let sectionText = await loadSectionText(section);
    sectionText = sectionText.replace(spiHelperCaseStatusRegex, "").trim();
    let archiveText = await spiHelperGetPageText(context.archiveName, true);
    const message = new VueMessage({ type: "error", content: "" });
    if (archiveText.includes(sectionText)) {
      message.type = "warning";
      message.content = "Looks like the page has been archived already";
      message.show();
      return;
    }
    const archiveExists = archiveText !== "";
    if (!archiveExists) {
      archiveText = `__TOC__
{{SPI archive notice|1=` + context.caseName + `}}
{{SPIpriorcases}}
`;
    } else {
      archiveText = archiveText.replace(/<br\s*\/>\s*{{SPIpriorcases}}/gi, `
{{SPIpriorcases}}`);
    }
    const investigationMessage = archiveExists ? new VueMessage({ type: "notice", content: "Loading archive sections" }).show() : null;
    const archiveSectionEntries = archiveExists ? await spiHelperGetInvestigationSections({ pageName: context.archiveName }) : [];
    const parsedArchiveSections = archiveExists && archiveSectionEntries.length === 0 ? null : parseArchiveSections(archiveText, archiveSectionEntries);
    if (parsedArchiveSections) {
      investigationMessage?.update({ type: "success", content: "Archive sections loaded" });
      const sectionDate = parseSectionDate(section.name);
      if (!sectionDate) {
        new VueMessage({ type: "error", content: `Failed to parse date from section header '${section.name}'` }).show();
        return;
      }
      parsedArchiveSections.push({ header: sectionDate, fullText: sectionText });
    } else {
      investigationMessage?.update({
        type: "error",
        content: "Failed to parse existing archive sections, aborting archival"
      });
      return;
    }
    archiveText = rebuildArchiveText(archiveText, parsedArchiveSections);
    const archiveSuccess = await spiHelperEditPage({
      title: context.archiveName,
      newText: archiveText,
      summary: `Archiving case section from [[${context.pageName}]]`,
      createonly: false,
      watch: spiHelperSettings.watch.archive,
      watchExpiry: spiHelperSettings.expiry.archive
    }) !== null;
    if (!archiveSuccess) {
      message.content = "Failed to update archive, not removing section from case page";
      message.show();
      return;
    }
    await context.edit({
      newText: "",
      summary: `Archiving case section to [[${context.archiveName}]]`,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId,
      sectionId: section.id
    });
  }
  async function spiHelperMoveArchiveIfOverflowing(sourcePage, archiveName) {
    const [sourceSize, archiveSize] = await Promise.all([
      spiHelperGetPostExpandSize(sourcePage),
      spiHelperGetPostExpandSize(archiveName)
    ]);
    const postExpandPercent = (sourceSize + archiveSize) / spiHelperGetMaxPostExpandSize();
    if (postExpandPercent < 1) {
      return "ok";
    }
    const subArchiveId = await findFirstEmptySubArchive(archiveName);
    if (subArchiveId === null) {
      return "abort";
    }
    await spiHelperMovePage({
      sourcePage: archiveName,
      destPage: `${archiveName}/${subArchiveId}`,
      summary: "Moving archive to avoid exceeding post expand size limit",
      ignoreWarnings: false,
      moveSubpages: false
    });
    return "moved";
  }
  async function findFirstEmptySubArchive(archiveName) {
    const subArchives = await spiHelperGetPages({
      from: `${archiveName.replace(/^Wikipedia:/, "")}/`,
      namespace: 4,
      limit: "max"
    });
    if (subArchives === null) {
      new VueMessage({
        type: "error",
        content: "Failed to find the existing sub-archives, aborting move"
      }).show();
      return null;
    }
    const existing = new Set(subArchives.map((page) => page.title));
    for (let archiveId = 1;archiveId <= MAX_SUB_ARCHIVES; archiveId++) {
      if (!existing.has(`${archiveName}/${archiveId}`)) {
        return archiveId;
      }
    }
    new VueMessage({
      type: "error",
      content: "Reached upper bound on possible archives, something probably went catastrophically wrong"
    }).show();
    return null;
  }
  async function findArchiveSplitPoint(sections, archiveText) {
    const maxSize = spiHelperGetMaxPostExpandSize();
    let lo = 0;
    let hi = sections.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      const candidateText = rebuildArchiveText(archiveText, sections.slice(mid));
      if (await spiHelperGetPostExpandSizeFromText(candidateText) < maxSize) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return lo;
  }
  // src/actions/block.ts
  function buildTalkNotice(opts) {
    const { sock, noticeType, sockmaster, cuBlock } = opts;
    let newText;
    let isSock = noticeType === "sock";
    if (isSock && sockmaster && sock.username === sockmaster) {
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
    if (context.source === "spi" && context.valid) {
      newText += "|spi=" + context.caseName;
    }
    if (isNoExpiry(sock.block.duration)) {
      newText += "|indef=yes";
    } else {
      newText += "|time=" + sock.block.duration;
      if (cuBlock) {
        newText += "|indef=no";
      }
    }
    if (sock.block.ntp) {
      newText += "|notalk=yes";
    }
    if (isSock && sockmaster) {
      newText += "|master=" + sockmaster;
    }
    newText += "}}";
    return newText;
  }
  function buildBlockSummary(blockOptions, isIP, isIPRange, acb) {
    let blockSummary = "Abusing [[WP:SOCK|multiple accounts]]";
    if (context.source === "spi" && context.valid) {
      blockSummary += `: Please see: [[${context.pageName}]]`;
    }
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
    const { sock, blockOptions } = opts;
    const isIP = mw.util.isIPAddress(sock.username, true);
    const isIPRange = isIP && !mw.util.isIPAddress(sock.username, false);
    const blockSummary = buildBlockSummary(blockOptions, isIP, isIPRange, sock.block.acb);
    return await spiHelperBlockUser({
      user: sock.username,
      duration: sock.block.duration,
      reason: blockSummary,
      reblock: blockOptions.override,
      anononly: isIP ? sock.block.abao : false,
      accountcreation: sock.block.acb,
      autoblock: isIP ? false : sock.block.abao,
      notalkpage: sock.block.ntp,
      noemail: sock.block.nem,
      watchBlockedUser: spiHelperSettings.watch.blocked,
      watchExpiry: spiHelperSettings.expiry.blocked
    });
  }
  async function spiHelperAddTalkBlockNotice(opts) {
    const { sock, blockOptions, userTalkContent, talkNotices } = opts;
    if (talkNotices.length === 0) {
      return;
    }
    const sockmaster = sock.block.tags.find((tag) => isSockpuppetTag(tag))?.master;
    const cuBlock = blockOptions.cuBlock && spiHelperIsCheckuser() && spiHelperSettings.useCheckuserblockAccount;
    const userTalkPage = `User talk:${sock.username}`;
    let newText = blockOptions.blankTalk ? "" : userTalkContent ?? "";
    for (const talkNotice of talkNotices) {
      newText += `
` + buildTalkNotice({ sock, noticeType: talkNotice, sockmaster, cuBlock });
    }
    await spiHelperEditPage({
      title: userTalkPage,
      newText,
      summary: buildContextSummary("Adding sockpuppetry block notice"),
      createonly: false,
      watch: "nochange"
    });
  }
  // src/actions/lock.ts
  var SRG_PAGE = "meta:Steward requests/Global";
  var SRG_SECTION_ANCHORS = {
    block: /\n+(== Requests for global \(un\)lock and \(un\)hiding == *\n)/,
    lock: /\n+(== See also == *\n)/
  };
  function buildTargetLink(target) {
    const special = isNonRegisteredAccount(target) ? "Special:Contributions" : "Special:CentralAuth";
    return `[[${special}/${target}|${target}]]`;
  }
  function buildRequestHeading(opts) {
    const { targets, master, hideNames } = opts;
    if (hideNames || !master) {
      const heading = targets.length > 1 ? `${targets.length} sockpuppets` : "a sockpuppet";
      return { heading, headingText: heading };
    }
    const masterLink = buildTargetLink(master);
    const sockCount = targets.filter((target) => target !== master).length;
    if (sockCount === 0) {
      return { heading: masterLink, headingText: master };
    }
    const usePlural = sockCount > 1;
    if (sockCount < targets.length) {
      if (usePlural) {
        return {
          heading: `${masterLink} and ${sockCount} socks`,
          headingText: `${master} and ${sockCount} socks`
        };
      }
      return { heading: `${masterLink} and their sock`, headingText: `${master} and their sock` };
    }
    if (usePlural) {
      return {
        heading: `${sockCount} ${masterLink} socks`,
        headingText: `${sockCount} ${master} socks`
      };
    }
    return { heading: `${masterLink} sock`, headingText: `${master} sock` };
  }
  function buildContextSentence(usePlural) {
    const subject = usePlural ? "Sockpuppets" : "Sockpuppet";
    if (context.source === "spi" && context.valid) {
      return `${subject} found in enwiki sockpuppet investigation, see [[${context.prefixedName}]].`;
    }
    if (context.source === "spi") {
      return `${subject} found in enwiki sockpuppet investigation.`;
    }
    return `${subject} found in enwiki.`;
  }
  function buildLockTemplate(targets, hideNames = false) {
    const [onlyTarget] = targets;
    if (targets.length === 1 && onlyTarget) {
      return `* {{LockHide|1=${onlyTarget}${hideNames ? "|hidename=1" : ""}}}`;
    }
    let template = "{{MultiLock";
    targets.forEach((user, i) => {
      template += `|${i + 1}=${user}`;
    });
    if (hideNames) {
      template += "|hidename=1";
    }
    return `${template}}}`;
  }
  function buildRequestTail(opts) {
    const comment = opts.comment.trim().replace(/\.+$/, "");
    let tail = `
${buildContextSentence(opts.usePlural)}`;
    if (comment !== "") {
      tail += ` ${comment}.`;
    }
    return `${tail} ~~~~`;
  }
  function buildLockRequest(opts) {
    const { targets, master, hideNames } = opts;
    if (targets.length === 0) {
      return null;
    }
    const { heading, headingText } = buildRequestHeading({ targets, master, hideNames });
    let body = `=== Global lock for ${heading} ===`;
    body += `
{{status}}`;
    body += `
${buildLockTemplate(targets, hideNames)}`;
    body += buildRequestTail({ usePlural: targets.length > 1, comment: opts.comment });
    return { kind: "lock", targets, body, headingText: `Global lock for ${headingText}` };
  }
  function buildGlobalBlockRequest(opts) {
    const { targets, master } = opts;
    if (targets.length === 0) {
      return null;
    }
    const tempAccounts = targets.filter((target) => mw.util.isTemporaryUser(target));
    const ips = targets.filter((target) => !mw.util.isTemporaryUser(target));
    const { heading, headingText } = buildRequestHeading({ targets, master, hideNames: false });
    let body = `=== Global block for ${heading} ===`;
    body += `
{{status}}`;
    if (tempAccounts.length > 0) {
      body += `
${buildLockTemplate(tempAccounts)}`;
    }
    for (const ip of ips) {
      body += `
* {{Luxotool|${ip}}}`;
    }
    body += buildRequestTail({ usePlural: targets.length > 1, comment: opts.comment });
    return { kind: "block", targets, body, headingText: `Global block for ${headingText}` };
  }
  function buildRequestLabel(requests) {
    const [first] = requests;
    if (requests.length === 1 && first) {
      return `Global ${first.kind} request`;
    }
    return "Global lock and block requests";
  }
  async function spiHelperRequestGlobalActions(opts) {
    const { lockTargets, blockTargets, master, hideNames, comment } = opts;
    const nothingFiled = { lockedUsers: [], globalBlockedUsers: [] };
    const lockRequest = buildLockRequest({ targets: lockTargets, master, hideNames, comment });
    const blockRequest = buildGlobalBlockRequest({ targets: blockTargets, master, comment });
    const requests = [blockRequest, lockRequest].filter((request) => request !== null);
    if (requests.length === 0) {
      return nothingFiled;
    }
    const actionLabel = buildRequestLabel(requests);
    let newText = await spiHelperGetPageText(SRG_PAGE, false);
    for (const request of requests) {
      const splicedText = newText.replace(SRG_SECTION_ANCHORS[request.kind], (_match, heading) => `

${request.body}

${heading}`);
      if (splicedText === newText) {
        new VueMessage({
          type: "error",
          content: `${actionLabel} failed: could not find the global ${request.kind} section on ${SRG_PAGE}.`
        }).show();
        return nothingFiled;
      }
      newText = splicedText;
    }
    new VueMessage({ type: "notice", content: `Filing ${actionLabel.toLowerCase()}` }).show();
    const editId = await spiHelperEditPage({
      title: SRG_PAGE,
      newText,
      summary: `${actionLabel} for ${buildRequestHeading({
        targets: [...blockTargets, ...lockTargets],
        master,
        hideNames
      }).heading}`,
      createonly: false,
      watch: "nochange"
    });
    if (!editId) {
      new VueMessage({ type: "warning", content: `${actionLabel} failed.` }).show();
      return nothingFiled;
    }
    for (const request of requests) {
      const linkHtml = buildTitleLinkHtml(`meta:Special:Diff/${editId}#${request.headingText}`, "filed");
      new VueMessage({
        type: "success",
        content: `Global ${request.kind} request ${linkHtml} successfully!`,
        isHtml: true
      }).show();
    }
    return {
      lockedUsers: lockRequest?.targets ?? [],
      globalBlockedUsers: blockRequest?.targets ?? []
    };
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
  function getNewProtection(oldPageNameProtection, newPageNameProtection, siteRestrictions) {
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
        } else {
          level = newPageNameEntry.level;
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
  function getNewPendingChanges(oldPageStabilisation, newPageStabilisation, siteRestrictions) {
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
  async function mergeArchives(oldContext, newContext, addNote) {
    const sourceArchiveText = await spiHelperGetPageText(oldContext.archiveName, false);
    let targetArchiveText = await spiHelperGetPageText(newContext.archiveName, false);
    if (!sourceArchiveText || !targetArchiveText) {
      return "skipped";
    }
    new VueMessage({
      type: "notice",
      content: "Archives detected on both source and target cases, copying it manually"
    }).show();
    const sourceArchiveEntries = await spiHelperGetInvestigationSections({ pageName: oldContext.archiveName });
    const targetArchiveEntries = await spiHelperGetInvestigationSections({ pageName: newContext.archiveName });
    const sourceArchiveSections = sourceArchiveEntries.length ? parseArchiveSections(sourceArchiveText, sourceArchiveEntries) : null;
    const targetArchiveSections = targetArchiveEntries.length ? parseArchiveSections(targetArchiveText, targetArchiveEntries) : null;
    if (!sourceArchiveSections || !targetArchiveSections) {
      new VueMessage({
        type: "error",
        content: "Could not parse the archive. Please merge the archives manually"
      }).show();
      return "skipped";
    }
    if (addNote) {
      for (const section of sourceArchiveSections) {
        section.fullText = addAdminSectionNote(`* {{clerknote}} originally filed under [[${oldContext.pageName}]]. ~~~~`, section.fullText);
      }
    }
    const parsedSections = [...targetArchiveSections, ...sourceArchiveSections];
    targetArchiveText = rebuildArchiveText(targetArchiveText, parsedSections);
    const maxSize = spiHelperGetMaxPostExpandSize();
    if (await spiHelperGetPostExpandSizeFromText(targetArchiveText) >= maxSize) {
      new VueMessage({
        type: "notice",
        content: "Running binary search to find cutoff point for post-expand include size"
      }).show();
      const splitPoint = await findArchiveSplitPoint(parsedSections, targetArchiveText);
      if (splitPoint >= parsedSections.length) {
        new VueMessage({
          type: "error",
          content: "Archives are too large to merge without hitting post-expand size limit. Please merge manually"
        }).show();
        return "abort";
      }
      const subArchiveId = await findFirstEmptySubArchive(newContext.archiveName);
      if (subArchiveId === null)
        return "abort";
      const subArchiveHeader = `__TOC__
{{SPI archive notice|1=${newContext.caseName}}}
{{SPIpriorcases}}
`;
      await spiHelperEditPage({
        title: `${newContext.archiveName}/${subArchiveId}`,
        newText: rebuildArchiveText(subArchiveHeader, parsedSections.slice(0, splitPoint)),
        summary: `Splitting archive due to post-expand size limit`,
        createonly: false,
        watch: spiHelperSettings.watch.archive,
        watchExpiry: spiHelperSettings.expiry.archive
      });
      targetArchiveText = rebuildArchiveText(targetArchiveText, parsedSections.slice(splitPoint));
    }
    await spiHelperEditPage({
      title: newContext.archiveName,
      newText: targetArchiveText,
      summary: `Merging archives from [[${oldContext.pageName}]], see page history for attribution`,
      createonly: false,
      watch: spiHelperSettings.watch.archive,
      watchExpiry: spiHelperSettings.expiry.archive
    });
    return "copied";
  }
  async function spiHelperMoveCase(opts) {
    const { target, suppress, addNote, archiveNotice } = opts;
    const oldContext = context;
    const newContext = new SpiPageContext(context.pageName.replace(context.caseName, () => target));
    const targetPageText = await spiHelperGetPageText(newContext.pageName, false);
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
          content: "Target page exists and you are unable to histmerge, aborting merge"
        }).show();
        return;
      }
    }
    if (newContext.pageName === oldContext.pageName) {
      new VueMessage({ type: "error", content: "Target page is the current page, aborting merge" }).show();
      return;
    }
    if (targetPageText) {
      const mergeResult = await mergeArchives(oldContext, newContext, addNote);
      if (mergeResult === "abort")
        return;
      const [siteRestrictions, restrictions] = await Promise.all([
        spiHelperGetSiteRestrictionInformation(),
        spiHelperGetBulkPageRestrictions([oldContext.pageName, newContext.pageName])
      ]);
      const oldRestrictions = restrictions.get(oldContext.pageName);
      const newRestrictions = restrictions.get(newContext.pageName);
      const newProtection = getNewProtection(oldRestrictions?.protection ?? [], newRestrictions?.protection ?? [], siteRestrictions);
      const newPendingChanges = getNewPendingChanges(oldRestrictions?.pendingChanges ?? null, newRestrictions?.pendingChanges ?? null, siteRestrictions);
      await spiHelperDeletePage(newContext.pageName, "Deleting as part of case merge");
      await spiHelperMovePage({
        sourcePage: oldContext.pageName,
        destPage: newContext.pageName,
        summary: `Merging case to [[${newContext.pageName}]]`,
        ignoreWarnings: true,
        suppressRedirect: suppress
      });
      await spiHelperUndeletePage(newContext.pageName, "Restoring page history after merge");
      if (mergeResult === "copied") {
        if (suppress) {
          await spiHelperDeletePage(oldContext.archiveName, `Archives moved to [[${newContext.archiveName}]]`);
        } else {
          await spiHelperEditPage({
            title: oldContext.archiveName,
            newText: `#REDIRECT [[${newContext.archiveName}]]`,
            summary: "Redirecting old archive to new archive",
            createonly: false,
            watch: spiHelperSettings.watch.archive,
            watchExpiry: spiHelperSettings.expiry.archive
          });
        }
      }
      if (newProtection.length !== 0) {
        await spiHelperProtectPage(newContext.pageName, newProtection);
        if (!suppress) {
          await spiHelperProtectPage(oldContext.pageName, newProtection);
        }
      }
      if (newPendingChanges.level !== "") {
        await spiHelperConfigurePendingChanges(newContext.pageName, newPendingChanges);
        if (!suppress) {
          await spiHelperConfigurePendingChanges(oldContext.pageName, newPendingChanges);
        }
      }
    } else {
      await spiHelperMovePage({
        sourcePage: oldContext.pageName,
        destPage: newContext.pageName,
        summary: `Moving case to [[${newContext.pageName}]]`,
        suppressRedirect: suppress && spiHelperCanSuppressRedirect(),
        ignoreWarnings: false
      });
    }
    await spiHelperPostRenameCleanup({
      oldContext,
      newContext,
      oldNotice: archiveNotice,
      deleteOld: suppress,
      preMergeText: targetPageText
    });
  }
  async function spiHelperMoveCaseSection(mergeTarget, section) {
    const newContext = new SpiPageContext(context.pageName.replace(context.caseName, () => mergeTarget));
    let targetPageText = await spiHelperGetPageText(newContext.pageName, false);
    let sectionText = await loadSectionText(section);
    sectionText = addAdminSectionNote(`* {{clerknote}} originally filed under [[${context.pageName}]]. ~~~~`, sectionText);
    if (targetPageText === "") {
      targetPageText = `<noinclude>__TOC__</noinclude>
{{SPI archive notice|` + mergeTarget + `}}
{{SPIpriorcases}}`;
    }
    targetPageText += `
` + sectionText;
    newContext.edit({
      newText: targetPageText,
      summary: `Moving case section from [[${context.pageName}]], see page history for attribution`,
      createonly: false,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
    await context.edit({
      newText: "",
      summary: `Moving case section to [[${newContext.pageName}]]`,
      createonly: false,
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case,
      baseRevId: context.startingRevId,
      sectionId: section.id
    });
  }
  function addOldMasterToSockList(pageText, oldMasterName) {
    const sockListSpan = findTemplateSpans("sock list", pageText)[0];
    if (!sockListSpan) {
      return pageText.replace(spiHelperSockSectionWithNewlineRegex, () => `====Suspected sockpuppets====
* {{checkuser|1=` + oldMasterName + `}} ({{clerknote}} original case name)
`);
    }
    const sockListMatch = sockListSpan.text;
    const sockListTemplate = parseTemplate(sockListMatch.slice(2, -2));
    const isMultiLine = sockListMatch.includes(`
`);
    const sep = isMultiLine ? `
` : "";
    const escapedName = oldMasterName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const normalizedMaster = oldMasterName.toLowerCase();
    const positionalIndex = sockListTemplate.positional.findIndex((u2) => u2.toLowerCase() === normalizedMaster);
    let namedIndex = -1;
    for (const [key, val] of Object.entries(sockListTemplate.params)) {
      if (/^\d+$/.test(key) && val.toString().toLowerCase() === normalizedMaster) {
        namedIndex = parseInt(key);
        break;
      }
    }
    let newSockList;
    if (positionalIndex >= 0 || namedIndex >= 0) {
      const entryIndex = namedIndex >= 0 ? namedIndex : positionalIndex + 1;
      const noteKey = `note${entryIndex}`;
      if (noteKey in sockListTemplate.params) {
        newSockList = sockListMatch;
      } else {
        let entryStr;
        if (namedIndex >= 0) {
          const match = new RegExp(`\\|\\s*${namedIndex}\\s*=\\s*${escapedName}`, "i").exec(sockListMatch);
          entryStr = match ? match[0] : undefined;
        } else {
          const match = new RegExp(`\\|(?![^|}\\n]*=)\\s*${escapedName}\\s*(?=[|}\\n])`, "i").exec(sockListMatch);
          entryStr = match ? match[0] : undefined;
        }
        newSockList = entryStr ? sockListMatch.replace(entryStr, () => entryStr + `|note${entryIndex}=({{clerknote}} original case name)`) : sockListMatch;
      }
    } else {
      const namedKeys = Object.keys(sockListTemplate.params).filter((k) => /^\d+$/.test(k)).map(Number);
      const effectiveMax = Math.max(0, ...namedKeys, sockListTemplate.positional.length);
      const newIndex = effectiveMax + 1;
      const newEntry = `${sep}|${newIndex}=${oldMasterName}|note${newIndex}=({{clerknote}} original case name)`;
      const nonEntryKeys = Object.keys(sockListTemplate.params).filter((k) => !/^\d+$/.test(k) && !/^note\d+$/.test(k));
      let insertBefore = null;
      for (const key of nonEntryKeys) {
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = new RegExp(`(\\n?)\\|\\s*${escapedKey}\\s*=`).exec(sockListMatch);
        if (match && (insertBefore === null || match.index < insertBefore.index)) {
          insertBefore = { index: match.index, match };
        }
      }
      let insertPos;
      if (insertBefore) {
        insertPos = insertBefore.match.index;
      } else {
        const closingPos = sockListMatch.lastIndexOf("}}");
        insertPos = closingPos - (sockListMatch[closingPos - 1] === `
` ? 1 : 0);
      }
      newSockList = sockListMatch.slice(0, insertPos) + newEntry + sockListMatch.slice(insertPos);
    }
    return pageText.slice(0, sockListSpan.start) + newSockList + pageText.slice(sockListSpan.end);
  }
  function mergePreambles(destPreamble, sourcePreamble) {
    const destLines = new Set(destPreamble.split(`
`).map((line) => line.trim()));
    const extras = sourcePreamble.replace(spiHelperArchiveNoticeRegex, "").split(`
`).filter((line) => line.trim() && !destLines.has(line.trim()));
    return extras.length ? extras.join(`
`) + `
` + destPreamble : destPreamble;
  }
  function removeMasterFromSL(sockList, normalisedMaster) {
    const template = parseTemplate(sockList.slice(2, -2));
    if ("remove_master" in template.params) {
      return sockList;
    }
    if ("master" in template.params && String(template.params.master).toLowerCase() !== normalisedMaster) {
      return sockList;
    }
    const isListed = template.positional.some((sock) => sock.toLowerCase() === normalisedMaster) || Object.entries(template.params).some(([key, value]) => /^\d+$/.test(key) && value.toString().toLowerCase() === normalisedMaster);
    if (!isListed) {
      return sockList;
    }
    const closingPos = sockList.lastIndexOf("}}");
    const insertPos = closingPos - (sockList[closingPos - 1] === `
` ? 1 : 0);
    return sockList.slice(0, insertPos) + "|remove_master=yes" + sockList.slice(insertPos);
  }
  function removeNewMasterFromCases(pageText, newMasterName) {
    const normalisedMaster = newMasterName.toLowerCase();
    let newText = "";
    let cursor = 0;
    for (const span of findTemplateSpans("sock list", pageText)) {
      newText += pageText.slice(cursor, span.start) + removeMasterFromSL(span.text, normalisedMaster);
      cursor = span.end;
    }
    newText += pageText.slice(cursor);
    const sockSectionRegex = new RegExp(spiHelperSockSectionWithNewlineRegex.source + "[\\s\\S]*?(?=\\n====|$)", "gi");
    return newText.replace(sockSectionRegex, (sockSection) => sockSection.split(`
`).filter((line) => {
      if (!line.trim().startsWith("*")) {
        return true;
      }
      const template = parseTemplates(line)[0];
      if (template?.name !== "checkuser") {
        return true;
      }
      const sockName = template.positional[0] ?? template.params["1"];
      return String(sockName ?? "").toLowerCase() !== normalisedMaster;
    }).join(`
`));
  }
  function addNoteToCaseSections(note, pageText) {
    const sectionHeaderRegex = new RegExp(spiHelperSectionRegex.source, "gm");
    const sectionStarts = [...pageText.matchAll(sectionHeaderRegex)].map((match) => match.index);
    const firstSectionStart = sectionStarts[0];
    if (firstSectionStart === undefined) {
      return pageText;
    }
    let newText = pageText.slice(0, firstSectionStart);
    for (const [i, sectionStart] of sectionStarts.entries()) {
      const sectionEnd = sectionStarts[i + 1] ?? pageText.length;
      newText += addAdminSectionNote(note, pageText.slice(sectionStart, sectionEnd));
    }
    return newText;
  }
  async function spiHelperPostRenameCleanup(opts) {
    const { oldContext, newContext, oldNotice, deleteOld, preMergeText } = opts;
    const replacementArchiveNotice = new ParsedArchiveNotice({
      username: newContext.caseName
    }).generateWikitext();
    const targetNotice = preMergeText ? spiHelperParseArchiveNoticeText(preMergeText) : null;
    const newNotice = new ParsedArchiveNotice({
      username: newContext.caseName,
      crosswiki: oldNotice.crosswiki || targetNotice?.crosswiki,
      deny: oldNotice.deny || targetNotice?.deny,
      notalk: oldNotice.notalk || targetNotice?.notalk,
      moot: oldNotice.moot || targetNotice?.moot
    });
    const pagesChecked = [];
    const pagesToCheck = [oldContext.pageName];
    let currentPageToCheck = null;
    while (pagesToCheck.length !== 0) {
      currentPageToCheck = pagesToCheck.pop();
      if (!currentPageToCheck || currentPageToCheck === newContext.pageName) {
        continue;
      }
      pagesChecked.push(currentPageToCheck);
      const backlinks = (await spiHelperGetSPIBacklinks(currentPageToCheck)).filter((backlink) => backlink.title !== newContext.pageName);
      const backlinkTexts = await spiHelperGetBulkPageText(backlinks.map(({ title }) => title));
      for (const backlink of backlinks) {
        const archiveNotice = spiHelperParseArchiveNoticeText(backlinkTexts.get(backlink.title) ?? "");
        if (!archiveNotice) {
          continue;
        }
        if (archiveNotice.username === currentPageToCheck.replace(/Wikipedia:Sockpuppet investigations\//g, "")) {
          await spiHelperEditPage({
            title: backlink.title,
            newText: replacementArchiveNotice,
            summary: "Updating backlink following page move",
            watch: spiHelperSettings.watch.case,
            watchExpiry: spiHelperSettings.expiry.case
          });
          if (!pagesChecked.includes(backlink.title)) {
            pagesToCheck.push(backlink.title);
          }
        }
      }
    }
    if (deleteOld) {
      if (!spiHelperCanSuppressRedirect()) {
        await oldContext.edit({
          newText: `{{db-g6|rationale=Case moved to [[${newContext.pageName}]], requesting deletion as non-admin SPI clerk}}`,
          summary: "Requesting [[WP:G6|G6]] deletion after case move",
          createonly: false,
          watch: spiHelperSettings.watch.archive,
          watchExpiry: spiHelperSettings.expiry.archive
        });
      }
    } else {
      await oldContext.edit({
        newText: replacementArchiveNotice,
        summary: "Updating old case following page move",
        watch: spiHelperSettings.watch.case,
        watchExpiry: spiHelperSettings.expiry.case
      });
    }
    let newPageText = await spiHelperGetPageText(newContext.pageName, true);
    newPageText = addOldMasterToSockList(newPageText, oldContext.caseName);
    newPageText = addNoteToCaseSections(preMergeText ? `* {{cnmerged}} from [[${oldContext.pageName}]]. ~~~~` : `* {{clerknote}} originally filed under [[${oldContext.pageName}]]. ~~~~`, newPageText);
    if (preMergeText) {
      const sourceContentStart = getContentStartIndex(preMergeText);
      const destContentStart = getContentStartIndex(newPageText);
      const mergedPreambles = mergePreambles(newPageText.slice(0, destContentStart), preMergeText.slice(0, sourceContentStart));
      const sourceCaseContent = preMergeText.slice(sourceContentStart);
      const mergedCaseContent = newPageText.slice(destContentStart) + (sourceCaseContent ? `
` + sourceCaseContent : "");
      newPageText = mergedPreambles + mergedCaseContent;
    }
    newPageText = newPageText.replace(spiHelperArchiveNoticeRegex, () => newNotice.generateWikitext());
    newPageText = removeNewMasterFromCases(newPageText, newContext.caseName);
    await newContext.edit({
      newText: newPageText,
      summary: "Updating new case following page move",
      watch: spiHelperSettings.watch.case,
      watchExpiry: spiHelperSettings.expiry.case
    });
  }
  // src/actions/tag.ts
  function createCategoryPage(title) {
    return spiHelperEditPage({
      title,
      newText: "{{sockpuppet category}}",
      summary: buildContextSummary("Creating sockpuppet category"),
      createonly: true,
      watch: spiHelperSettings.watch.categories,
      watchExpiry: spiHelperSettings.expiry.categories
    });
  }
  function tagArraysEqual(tags1, tags2) {
    if (tags1.length !== tags2.length)
      return false;
    const used = new Array(tags2.length).fill(false);
    for (const tag1 of tags1) {
      let found = false;
      for (let i = 0;i < tags2.length; i++) {
        const tag2 = tags2[i];
        if (!tag2) {
          continue;
        }
        if (!used[i] && tag1.equals(tag2)) {
          used[i] = true;
          found = true;
          break;
        }
      }
      if (!found)
        return false;
    }
    return true;
  }
  function replaceSockTemplates(pageText, replacement) {
    const templateRegex = /\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi;
    const matches = [...pageText.matchAll(templateRegex)];
    if (matches.length === 0) {
      return replacement;
    }
    const firstMatch = matches[0];
    if (!firstMatch) {
      return replacement;
    }
    const matchText = firstMatch[0];
    pageText = pageText.replace(matchText, () => replacement);
    matches.slice(1).forEach((match) => {
      const matchText2 = match[0];
      pageText = pageText.replace(matchText2, "");
    });
    return pageText;
  }
  async function spiHelperTagUser(opts) {
    const { sock, pageText, blocked, globalUser: userInfo, tagNonLocalAccounts } = opts;
    if (isNonRegisteredAccount(sock.username)) {
      return false;
    }
    if (!userInfo) {
      new VueMessage({
        type: "warning",
        content: `The account ${sock.username} does not exist and so has not been tagged`
      }).show();
      return false;
    }
    if (!tagNonLocalAccounts && !userInfo.existsLocally) {
      new VueMessage({
        type: "warning",
        content: `The account ${sock.username} does not exist locally and so has not been tagged`
      }).show();
      return false;
    }
    sock.block.tags.forEach((tag) => {
      tag.locked = userInfo.locked;
    });
    const oldTags = parseUserTags(pageText, sock.username);
    const cleanedTags = sock.block.tags.reduce((acc, tag) => {
      const isOrphanSockpuppet = isSockpuppetTag(tag) && !tag.master;
      const alreadyAdded = acc.some((existing) => existing.equals(tag));
      if (!isOrphanSockpuppet && !alreadyAdded) {
        acc.push(tag);
      }
      return acc;
    }, []);
    if (tagArraysEqual(oldTags, cleanedTags)) {
      const userLinkHtml = buildTitleLinkHtml(`User:${sock.username}`);
      new VueMessage({
        type: "notice",
        content: `Tags are unmodified, skipping ${userLinkHtml}`,
        isHtml: true
      }).show();
      return false;
    }
    const tagText = cleanedTags.map((tag) => tag.generateWikitext(blocked)).join(`
`);
    const newText = replaceSockTemplates(pageText, tagText);
    const actionVerb = oldTags.length < cleanedTags.length ? "Adding" : "Updating";
    const tagSummary = cleanedTags.length > 1 ? countOf(cleanedTags.length, "sockpuppetry tag") : "sockpuppetry tag";
    return spiHelperEditPage({
      title: `User:${sock.username}`,
      newText,
      summary: buildContextSummary(`${actionVerb} ${tagSummary}`),
      createonly: false,
      watch: spiHelperSettings.watch.tagged,
      watchExpiry: spiHelperSettings.expiry.tagged
    }).then((result) => result !== null);
  }
  function collectCategoryNeeds(userRows) {
    const masterNeedsMap = new Map;
    function ensure(master) {
      if (!masterNeedsMap.has(master)) {
        masterNeedsMap.set(master, { confirmed: false, suspected: false });
      }
      return masterNeedsMap.get(master) ?? { confirmed: false, suspected: false };
    }
    for (const row of userRows) {
      for (const tag of row.block.tags) {
        if (isSockmasterTag(tag)) {
          continue;
        }
        const entry = ensure(tag.master);
        if (tag.status === "proven" || tag.status === "confirmed")
          entry.confirmed = true;
        if (tag.status === "blocked")
          entry.suspected = true;
        if (tag.altmaster) {
          const altEntry = ensure(tag.altmaster);
          if (tag.altmasterStatus === "proven")
            altEntry.confirmed = true;
          if (tag.altmasterStatus === "suspected")
            altEntry.suspected = true;
        }
      }
    }
    return masterNeedsMap;
  }
  async function createSockCategories(userRows) {
    const purgeMap = new Map;
    const categoryNeeds = collectCategoryNeeds(userRows);
    const wanted = [];
    for (const [master, { confirmed, suspected }] of categoryNeeds) {
      if (!master) {
        continue;
      }
      if (confirmed) {
        wanted.push({ master, title: `Category:Wikipedia sockpuppets of ${master}` });
      }
      if (suspected) {
        wanted.push({ master, title: `Category:Suspected Wikipedia sockpuppets of ${master}` });
      }
      purgeMap.set(master, false);
    }
    if (wanted.length === 0) {
      return purgeMap;
    }
    const existing = await spiHelperGetBulkPageText(wanted.map(({ title }) => title));
    const missing = wanted.filter(({ title }) => !existing.get(title));
    await Promise.all(missing.map(({ title }) => createCategoryPage(title)));
    for (const { master } of missing) {
      purgeMap.set(master, true);
    }
    return purgeMap;
  }
  // src/editSummary.ts
  function setupEditSummaryFacts(multiSection) {
    return {
      multiSection,
      status: "",
      closedCount: 0,
      statusChangedCount: 0,
      commentedCount: 0,
      archiveNoticeUpdated: false,
      blockedUsers: [],
      taggedUsers: [],
      lockedUsers: [],
      globalBlockedUsers: []
    };
  }
  function joinVerbs(verbs) {
    const last = verbs.at(-1);
    if (!last) {
      return "";
    }
    const rest = verbs.slice(0, -1);
    if (rest.length === 0) {
      return last;
    }
    return `${rest.join(", ")}${rest.length > 1 ? "," : ""} and ${last}`;
  }
  function countIfSeveral(count, singular) {
    return count === 1 ? singular : countOf(count, singular);
  }
  function groupByAccounts(facts) {
    const userActions = [
      { verb: () => "blocking", users: facts.blockedUsers },
      { verb: () => "tagging", users: facts.taggedUsers },
      {
        verb: (count) => `requesting ${pluralise(count, "lock")} for`,
        solo: (count) => `requesting ${countIfSeveral(count, "lock")}`,
        users: facts.lockedUsers
      },
      {
        verb: (count) => `requesting ${pluralise(count, "global block")} for`,
        solo: (count) => `requesting ${countIfSeveral(count, "global block")}`,
        users: facts.globalBlockedUsers
      }
    ];
    const groups = new Map;
    for (const userAction of userActions.filter(({ users }) => users.length > 0)) {
      const key = [...userAction.users].sort().join("|");
      groups.set(key, [...groups.get(key) ?? [], userAction]);
    }
    return [...groups.values()].flatMap((group) => {
      const [firstAction, ...rest] = group;
      if (!firstAction) {
        return [];
      }
      const count = firstAction.users.length;
      if (rest.length === 0 && firstAction.solo) {
        return firstAction.solo(count);
      }
      const verbs = joinVerbs(group.map(({ verb }) => verb(count)));
      return `${verbs} ${countIfSeveral(count, "account")}`;
    });
  }
  function buildEditSummaryActions(facts) {
    const editSummaryActions = [];
    if (facts.archiveNoticeUpdated) {
      editSummaryActions.push("updating archivenotice");
    }
    if (facts.commentedCount > 0) {
      editSummaryActions.push(facts.multiSection ? `commenting on ${countOf(facts.commentedCount, "section")}` : "commenting");
    }
    editSummaryActions.push(...groupByAccounts(facts));
    if (facts.multiSection) {
      if (facts.statusChangedCount > 0) {
        editSummaryActions.push(`changing status on ${countOf(facts.statusChangedCount, "section")}`);
      }
      if (facts.closedCount > 0) {
        editSummaryActions.push(`closing ${countOf(facts.closedCount, "section")}`);
      }
    } else if (facts.status) {
      editSummaryActions.push(facts.status);
    }
    if (editSummaryActions.length === 0) {
      editSummaryActions.push("saving page");
    }
    return editSummaryActions;
  }
  function formatEditSummary(editSummaryActions, sectionName) {
    const [firstAction, ...rest] = editSummaryActions;
    if (!firstAction) {
      return "";
    }
    const formattedStart = firstAction.charAt(0).toUpperCase() + firstAction.slice(1);
    const remainder = rest.length ? `, ${rest.join(", ")}` : "";
    const sectionPrefix = sectionName ? `/* ${sectionName} */ ` : "";
    return sectionPrefix + formattedStart + remainder;
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
    const logMessage = `* [[${context.pageName}]]: used one-click archiver ~~~~~`;
    if (spiHelperSettings.log.enabled) {
      await spiHelperLog(logMessage);
    }
    new VueMessage({ type: "notice", content: "Refreshing data" }).show();
    await context.refreshRevId();
    await refreshSections(state);
    new VueMessage({ type: "success", content: "Done!" }).show();
    finishOp("oneClickArchive", "success" /* Success */);
  }
  async function spiHelperPerformActions(opts) {
    const { actions, accounts, state } = opts;
    const anyTopLevelEnabled = Object.values(actions).some((action) => action.enabled);
    const anyBySectionEnabled = [
      ...actions.comment.data.bySection.values(),
      ...actions.status.data.bySection.values()
    ].some((entry) => entry.enabled);
    if (!anyTopLevelEnabled && !anyBySectionEnabled) {
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
    if (!actions.block.data.master) {
      console.error("spiHelperPerformActions: Could not get master");
      new VueMessage({ type: "error", content: "Could not get master" }).show();
      return;
    }
    const sectionType = state.selectedSection.type;
    new VueMessage({ type: "notice", content: "Running actions" }).show();
    const summaryFacts = setupEditSummaryFacts(sectionType === "multiple");
    let logMessage = `* [[${context.pageName}]]`;
    if (state.selectedSection.type === "single") {
      logMessage += ` (section ${state.selectedSection.section.name})`;
    } else if (state.selectedSection.type === "multiple") {
      logMessage += ` (multiple sections)`;
    } else {
      logMessage += " (full case)";
    }
    logMessage += " ~~~~~";
    let targetText = await (sectionType === "single" ? loadSectionText(state.selectedSection.section) : loadCaseText(state));
    if (!targetText) {
      new VueMessage({ type: "error", content: "Could not fetch text for the page" }).show();
      return;
    }
    const startText = targetText;
    let blockPromises = [];
    let tagPromises = [];
    let talkNoticePromises = [];
    let globalRequestPromise = Promise.resolve({ lockedUsers: [], globalBlockedUsers: [] });
    if (actions.block.enabled) {
      ({ blockPromises, tagPromises, talkNoticePromises, globalRequestPromise } = await spiHelperHandleBlocks({
        accounts,
        blockData: actions.block.data
      }));
    }
    const userActionsPromise = Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
      globalRequestPromise
    ]);
    const talkNoticePromise = Promise.all(talkNoticePromises);
    if (!context.isArchive) {
      if (sectionType === "single") {
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
            summaryFacts.status = statusResult.summaryItem;
            logMessage += `
** changed case status from ${actions.status.data.old} to ${statusResult.newStatus}`;
          }
        }
        if (actions.comment.enabled && actions.comment.data.text.trim() !== "*") {
          targetText = spiHelperHandleComment(targetText, actions.comment.data.text);
          summaryFacts.commentedCount++;
          logMessage += `
** commented`;
        }
      } else {
        if (sectionType === "multiple") {
          for (const section of state.selectedSection.sections) {
            const originalSectionText = await loadSectionText(section);
            let sectionText = originalSectionText;
            const sectionLogLines = [];
            const caseStatusResult = spiHelperCaseStatusRegex.exec(sectionText);
            if (caseStatusResult === null) {
              sectionText = sectionText.replace(/^(\s*===.*===[^\S\r\n]*)/, `$1
{{SPI case status|}}`);
            }
            const sectionStatus = actions.status.data.bySection.get(section.id);
            if (sectionStatus?.enabled && sectionStatus.new !== "nochange" && sectionStatus.new !== sectionStatus.old) {
              const statusResult = spiHelperHandleStatus(sectionStatus.new, sectionText);
              sectionText = statusResult.targetText;
              if (statusResult.newStatus === "closed") {
                summaryFacts.closedCount++;
              } else if (statusResult.newStatus !== "nochange") {
                summaryFacts.statusChangedCount++;
              }
              if (statusResult.newStatus !== "nochange") {
                sectionLogLines.push(`changed case status from ${sectionStatus.old} to ${statusResult.newStatus}`);
              }
            }
            const sectionComment = actions.comment.data.bySection.get(section.id);
            if (sectionComment?.enabled && sectionComment.text.trim() !== "*") {
              sectionText = spiHelperHandleComment(sectionText, sectionComment.text);
              summaryFacts.commentedCount++;
              sectionLogLines.push("commented");
            }
            if (sectionLogLines.length > 0) {
              logMessage += `
** ${section.name}`;
              for (const line of sectionLogLines) {
                logMessage += `
*** ${line}`;
              }
            }
            if (sectionText !== originalSectionText) {
              const updatedText = targetText.replace(originalSectionText, () => sectionText);
              if (updatedText === targetText) {
                new VueMessage({ type: "error", content: `Failed to update section ${section.name}` }).show();
              }
              targetText = updatedText;
            }
          }
        }
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
          targetText = targetText.replace(spiHelperArchiveNoticeRegex, () => archiveNoticeWikitext);
          summaryFacts.archiveNoticeUpdated = true;
          logMessage += `
** Updated archivenotice`;
        }
      }
    }
    const [blockedUsers, taggedUsers, globalRequests] = await userActionsPromise;
    summaryFacts.blockedUsers = blockedUsers.filter((user) => user !== null);
    summaryFacts.taggedUsers = taggedUsers.filter((user) => user !== null);
    summaryFacts.lockedUsers = globalRequests.lockedUsers;
    summaryFacts.globalBlockedUsers = globalRequests.globalBlockedUsers;
    const structureChanged = actions.move.enabled || actions.archive.enabled;
    if (!context.isArchive && targetText !== startText) {
      const sectionId = state.selectedSection.type === "single" ? state.selectedSection.section.id : null;
      const sectionName = state.selectedSection.type === "single" ? state.selectedSection.section.name : null;
      const editSummary = formatEditSummary(buildEditSummaryActions(summaryFacts), sectionName);
      const newRevId = await context.edit({
        newText: targetText,
        summary: editSummary,
        watch: spiHelperSettings.watch.case,
        watchExpiry: spiHelperSettings.expiry.case,
        baseRevId: context.startingRevId,
        sectionId
      });
      if (newRevId === null) {
        new VueMessage({ type: "error", content: "Failed to save edit" }).show();
        if (!structureChanged) {
          await context.refreshRevId();
        }
      } else {
        if (state.selectedSection.type === "single") {
          state.selectedSection.section._text = targetText;
          if (state._text) {
            state._text = state._text.replace(startText, () => targetText);
          }
        } else {
          state._text = targetText;
          if (state.selectedSection.type === "multiple") {
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
        case "all": {
          logMessage += `
** Archived case`;
          await spiHelperArchiveCase(state);
          break;
        }
        case "single": {
          logMessage += `
** Archived section`;
          await spiHelperArchiveCaseSection(state.selectedSection.section);
          break;
        }
        case "multiple": {
          const archivedSections = await spiHelperArchiveCase(state, state.selectedSection.sections);
          if (archivedSections.length > 0) {
            logMessage += `
** Archived ${countOf(archivedSections.length, "section")}`;
          }
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
            await spiHelperMoveCase({
              target: renameTarget,
              suppress: actions.move.data.suppress,
              addNote: actions.move.data.addNote,
              archiveNotice: state.archiveNotice
            });
            break;
          }
          case "single": {
            logMessage += `
** moved section to ` + renameTarget;
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
        globalBlockedUsers: globalRequests.globalBlockedUsers
      });
      await spiHelperLog(logMessage);
    }
    if (structureChanged) {
      const movedWholePage = actions.move.enabled && state.selectedSection.type === "all";
      if (movedWholePage) {
        await refreshSections(state);
      }
      if (state.selectedSection.type === "single" || state.selectedSection.type === "multiple") {
        state.selectedSection = null;
      }
      await context.refreshRevId();
    }
    new VueMessage({ type: "success", content: "Done!" }).show();
  }
  function spiHelperHandleComment(targetText, comment) {
    if (!targetText.includes(`
----`)) {
      targetText = targetText.replace(spiHelperCommentMarkerRegex, "");
      targetText += `
----<!-- All comments go ABOVE this line, please. -->`;
    }
    comment = addSignature(comment.trimEnd());
    if (spiHelperIsClerk() || spiHelperIsAdmin()) {
      return addAdminSectionNote(comment, targetText);
    } else {
      return targetText.replace(spiHelperAdminSectionWithPrecedingNewlinesRegex, () => `
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
        summaryItem = "reopening";
        break;
      case "open":
        summaryItem = "marking request as open";
        break;
      case "CUrequest":
        summaryItem = "adding checkuser request";
        break;
      case "admin":
        summaryItem = "requesting admin action";
        break;
      case "clerk":
        summaryItem = "requesting clerk action";
        break;
      case "selfendorse":
        newStatus = "endorse";
        summaryItem = "adding self-endorsed checkuser request";
        break;
      case "checked":
        summaryItem = "marking request as checked";
        break;
      case "inprogress":
        summaryItem = "marking request in progress";
        break;
      case "decline":
        summaryItem = "declining checkuser";
        break;
      case "cudecline":
        summaryItem = "CU declining checkuser";
        break;
      case "endorse":
        summaryItem = "endorsing for checkuser attention";
        break;
      case "cuendorse":
        summaryItem = "CU endorsing for checkuser attention";
        break;
      case "moreinfo":
      case "cumoreinfo":
        summaryItem = "requesting additional information";
        break;
      case "relist":
        summaryItem = "relisting case for another check";
        break;
      case "hold":
        summaryItem = "putting case on hold";
        break;
      case "cuhold":
        summaryItem = "placing checkuser request on hold";
        break;
      case "closed":
        summaryItem = "closing";
        break;
      case "new":
      case "nochange":
        break;
      default: {
        console.error("Unexpected case status value", newStatus);
      }
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
    const talkNoticePromises = [];
    let globalRequestPromise = Promise.resolve({ lockedUsers: [], globalBlockedUsers: [] });
    const {
      options: blockOptions,
      lockcomment: lockComment,
      master,
      skipCUVerifyUsers
    } = opts.blockData;
    for (const userRow of opts.accounts) {
      userRow.username = spiHelperNormalizeUsername(userRow.username);
    }
    const userRows = opts.accounts.filter((userRow) => userRow.username !== "");
    const globalTargetRows = [];
    const categoriesPromise = createSockCategories(userRows);
    const blockAvailable = spiHelperIsAdmin() && !blockOptions.noBlock;
    const addingTags = userRows.some((user) => user.block.tags.length > 0);
    const addingNotices = blockAvailable && !blockOptions.blankTalk && (blockOptions.addMasterNotice || blockOptions.addSockNotice);
    const { allUsernames, allUserPages, allUserTalkPages } = userRows.reduce((acc, user) => {
      acc.allUsernames.add(user.username);
      acc.allUserPages.push(`User:${user.username}`);
      acc.allUserTalkPages.push(`User talk:${user.username}`);
      return acc;
    }, { allUsernames: new Set, allUserPages: [], allUserTalkPages: [] });
    const pageTitles = [
      ...addingTags ? allUserPages : [],
      ...addingNotices ? allUserTalkPages : []
    ];
    const fetchMessage = new VueMessage({ type: "notice", content: "Fetching user blocks and tags" }).show();
    const [userBlocks, pageTexts, globalUsers, userGlobalBlocks] = await Promise.all([
      spiHelperGetBulkUserBlockSettings(allUsernames),
      spiHelperGetBulkPageText(pageTitles),
      spiHelperGetBulkGlobalUsers(new Set([...allUsernames].filter((username) => !isNonRegisteredAccount(username)))),
      spiHelperGetBulkGlobalBlocks(new Set([...allUsernames].filter((username) => isNonRegisteredAccount(username)))),
      categoriesPromise
    ]);
    fetchMessage.update({ type: "success", content: "Got previous blocks and tags" });
    const tagSock = async (userRow, blocked) => {
      const tagSuccess = await spiHelperTagUser({
        sock: userRow,
        pageText: pageTexts.get(`User:${userRow.username}`) ?? "",
        blocked,
        globalUser: globalUsers.get(userRow.username),
        tagNonLocalAccounts: blockOptions.tagUnattached
      });
      return tagSuccess ? userRow.username : null;
    };
    for (const userRow of userRows) {
      if (userRow.block.lock) {
        globalTargetRows.push(userRow);
      }
      if (blockAvailable && userRow.block.block) {
        const talkNotices = [];
        if (blockOptions.addMasterNotice && (userRow.block.tags.some((tag2) => isSockmasterTag(tag2)) || userRow.username === master)) {
          talkNotices.push("master");
        } else if (blockOptions.addSockNotice) {
          talkNotices.push("sock");
        }
        const maxJitter = Math.max(500, userRows.length * 100);
        const blockOutcome = (async () => {
          const userBlock = userBlocks.get(userRow.username);
          if (userBlock !== undefined && !blockOptions.override) {
            const alreadyBlockedWarning = new VueMessage({
              type: "warning",
              content: `Block target ${userRow.username} is already blocked. `
            });
            const shouldTag = userRow.block.tags.length > 0;
            if (shouldTag) {
              alreadyBlockedWarning.content += "Proceeding with tagging";
            } else {
              alreadyBlockedWarning.content += `Check the "override existing blocks" box to re-block them`;
            }
            alreadyBlockedWarning.show();
            return { blockedUsername: null, shouldTag };
          }
          const blockReason = userBlock?.reason;
          if (!spiHelperIsCheckuser() && !skipCUVerifyUsers.has(userRow.username) && blockOptions.override && blockReason && spiHelperCUBlockRegex.exec(blockReason)) {
            const prompt = "User " + userRow.username + ` is CheckUser-blocked, are you SURE you want to re-block them?
` + `Current block message:
` + blockReason;
            if (!confirm(prompt)) {
              return { blockedUsername: null, shouldTag: false };
            }
          }
          if (!userRow.block.duration) {
            new VueMessage({
              type: "error",
              content: `Block target ${userRow.username} does not have an intended duration`
            }).show();
            return { blockedUsername: null, shouldTag: false };
          }
          await new Promise((r) => setTimeout(r, Math.random() * maxJitter));
          const blockSuccess = await spiHelperProcessBlockRow({
            sock: userRow,
            blockOptions
          });
          return { blockedUsername: blockSuccess ? userRow.username : null, shouldTag: blockSuccess };
        })();
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
              talkNotices
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
      } else if (userRow.block.tags.length > 0) {
        tagPromises.push(tagSock(userRow, userBlocks.has(userRow.username)));
      }
    }
    const globalRows = globalTargetRows.filter((row) => !(isNonRegisteredAccount(row.username) ? userGlobalBlocks.has(row.username) : globalUsers.get(row.username)?.locked));
    if (globalRows.length > 0) {
      const hideNames = blockOptions.lockHideNames;
      const tagMasters = new Set(globalRows.flatMap((row) => row.block.tags.filter((tag2) => isSockpuppetTag(tag2))).map((tag2) => tag2.master).filter((tagMaster) => tagMaster !== ""));
      const [onlyTagMaster] = tagMasters;
      const globalMaster = tagMasters.size === 1 && onlyTagMaster ? onlyTagMaster : master;
      const [globalBlockTargets, lockTargets] = globalRows.reduce((acc, row) => {
        acc[isNonRegisteredAccount(row.username) ? 0 : 1].push(row.username);
        return acc;
      }, [[], []]);
      globalRequestPromise = spiHelperRequestGlobalActions({
        lockTargets,
        blockTargets: globalBlockTargets,
        hideNames,
        master: globalMaster,
        comment: lockComment
      });
    }
    return { blockPromises, tagPromises, talkNoticePromises, globalRequestPromise };
  }

  // src/ui/dom.ts
  function getSectionLink(sectionId) {
    const sectionLink = $(`a[href$="section=${sectionId}"]`).first();
    return sectionLink.length > 0 ? sectionLink : null;
  }
  function getSectionContainerFor(sectionLink) {
    const sectionContainer = sectionLink.parentsUntil(":has(hr)").last().nextUntil("hr");
    return sectionContainer.length > 0 ? sectionContainer : null;
  }
  function getSectionHeadingFor(sectionLink) {
    const heading = sectionLink.closest(".mw-heading");
    return heading.length > 0 ? heading.get(0) ?? null : null;
  }
  function getSectionHeading(sectionId) {
    const sectionLink = getSectionLink(sectionId);
    return sectionLink ? getSectionHeadingFor(sectionLink) : null;
  }
  function scrollToSection(sectionId) {
    const heading = getSectionHeading(sectionId);
    if (heading) {
      heading.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function getSectionHighlightRoot() {
    return document.querySelector("#mw-content-text .mw-parser-output");
  }
  function getSectionBounds(sectionId, root) {
    const sectionLink = getSectionLink(sectionId);
    const heading = sectionLink && getSectionHeadingFor(sectionLink);
    if (!root || !sectionLink || !heading) {
      return null;
    }
    const container = getSectionContainerFor(sectionLink);
    const lastElement = container?.last().get(0) ?? heading;
    const rootRect = root.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    const lastRect = lastElement.getBoundingClientRect();
    const top = Math.min(headingRect.top, lastRect.top) - rootRect.top + root.scrollTop;
    const bottom = Math.max(headingRect.bottom, lastRect.bottom) - rootRect.top + root.scrollTop;
    return { top, height: Math.max(1, bottom - top) };
  }
  function createSectionOverlay() {
    const root = getSectionHighlightRoot();
    if (!root) {
      return null;
    }
    const overlay = document.createElement("div");
    overlay.style.display = "none";
    overlay.className = "spiHelper-section-overlay";
    root.appendChild(overlay);
    return overlay;
  }
  function applySectionOverlay(overlay, sectionId, bounds, type) {
    overlay.style.top = `${Math.max(0, bounds.top)}px`;
    overlay.style.height = `${bounds.height + 8}px`;
    overlay.style.display = "block";
    overlay.dataset.sectionId = String(sectionId);
    overlay.classList.toggle("spiHelper-section-overlay--preview", type === "preview");
    overlay.classList.toggle("spiHelper-section-overlay--selected", type === "selected");
  }
  function renderSectionOverlay(overlay, sectionId, type) {
    const bounds = getSectionBounds(sectionId, getSectionHighlightRoot());
    if (!overlay || !bounds) {
      return;
    }
    applySectionOverlay(overlay, sectionId, bounds, type);
  }
  function getSectionIdByMenuItem(menuItem, menuItems) {
    const idResult = /v-\d+-(\d+)/.exec(menuItem.id);
    if (idResult === null || idResult.length < 2)
      return null;
    const optionIndex = Number(idResult[1]);
    const matchingMenuItem = menuItems[optionIndex - 1];
    if (!matchingMenuItem || matchingMenuItem.value === "all") {
      return null;
    }
    return typeof matchingMenuItem.value === "number" ? matchingMenuItem.value : null;
  }
  var previewOverlayEl = null;
  var selectedOverlayEls = new Map;
  function getOrCreatePreviewOverlay() {
    previewOverlayEl ??= createSectionOverlay();
    return previewOverlayEl;
  }
  function getOrCreateSelectedOverlay(sectionId) {
    let overlay = selectedOverlayEls.get(sectionId);
    if (!overlay) {
      const created = createSectionOverlay();
      if (!created) {
        return null;
      }
      overlay = created;
      selectedOverlayEls.set(sectionId, overlay);
    }
    return overlay;
  }
  function showSectionOverlay(sectionId, type) {
    const overlay = type === "preview" ? getOrCreatePreviewOverlay() : getOrCreateSelectedOverlay(sectionId);
    renderSectionOverlay(overlay, sectionId, type);
  }
  function hideSectionOverlay() {
    if (previewOverlayEl) {
      previewOverlayEl.style.display = "none";
    }
  }
  function setSelectedSectionOverlays(sectionIds) {
    const idSet = new Set(sectionIds);
    for (const [id, overlay] of selectedOverlayEls) {
      if (!idSet.has(id)) {
        overlay.remove();
        selectedOverlayEls.delete(id);
      }
    }
    const overlays = new Map;
    for (const id of sectionIds) {
      const overlay = getOrCreateSelectedOverlay(id);
      if (overlay) {
        overlays.set(id, overlay);
      }
    }
    const root = getSectionHighlightRoot();
    const bounds = new Map;
    for (const id of overlays.keys()) {
      const sectionBounds = getSectionBounds(id, root);
      if (sectionBounds) {
        bounds.set(id, sectionBounds);
      }
    }
    for (const [id, overlay] of overlays) {
      const sectionBounds = bounds.get(id);
      if (sectionBounds) {
        applySectionOverlay(overlay, id, sectionBounds, "selected");
      }
    }
  }
  function clearSelectedSectionOverlays() {
    setSelectedSectionOverlays([]);
  }
  var SECTION_BUTTON_LABEL = "open in spiHelper";
  function addSectionButtons(sectionIds, onClick) {
    const injected = [];
    for (const id of sectionIds) {
      const heading = getSectionHeading(id);
      if (!heading) {
        continue;
      }
      const editSection = heading.querySelector(".mw-editsection");
      if (editSection) {
        const closingBracket = editSection.querySelector(".mw-editsection-bracket:last-child");
        const divider = document.createElement("span");
        divider.className = "mw-editsection-divider";
        divider.textContent = " | ";
        const link = document.createElement("a");
        link.href = "#";
        link.className = "spiHelper-section-open";
        link.textContent = SECTION_BUTTON_LABEL;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          onClick(id);
        });
        if (closingBracket) {
          editSection.insertBefore(divider, closingBracket);
          editSection.insertBefore(link, closingBracket);
        } else {
          editSection.append(divider, link);
        }
        injected.push(divider, link);
      } else {
        const wrapper = document.createElement("span");
        wrapper.className = "mw-editsection-like spiHelper-section-open";
        const openBracket = document.createElement("span");
        openBracket.className = "mw-editsection-bracket";
        openBracket.textContent = "[";
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = SECTION_BUTTON_LABEL;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          onClick(id);
        });
        const closeBracket = document.createElement("span");
        closeBracket.className = "mw-editsection-bracket";
        closeBracket.textContent = "]";
        wrapper.append(openBracket, link, closeBracket);
        heading.appendChild(wrapper);
        injected.push(wrapper);
      }
    }
    return () => {
      for (const el of injected) {
        el.remove();
      }
    };
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
        handlers: {
          openHandler: null,
          beforeUnloadHandler: null
        },
        actionsRunning: false,
        displayedForms: new Set(["sections"]),
        unpinned: !spiHelperSettings.interface.pinned,
        buttonLayout: spiHelperSettings.interface.buttonLayout,
        actionButtons,
        actionButtonKeys,
        sectionAccountNames: new Set,
        sectionSelectionController: null,
        caseActions: getInitialCaseActions(),
        accounts: [],
        messages,
        sectionClickCleanup: null,
        multiSelectMode: false,
        icons: {
          cdxIconPushPin: W8,
          cdxIconCollapse: o6,
          cdxIconExpand: y6,
          cdxIconFeedback: k6
        }
      };
    },
    computed: {
      allDisabled() {
        for (const [name, action] of Object.entries(this.caseActions)) {
          if (name === "sections" || name === "link") {
            continue;
          }
          if (action.enabled) {
            return false;
          }
        }
        if (this.state.selectedSection?.type !== "multiple") {
          return true;
        }
        return [
          ...this.caseActions.comment.data.bySection.values(),
          ...this.caseActions.status.data.bySection.values()
        ].every((entry) => !entry.enabled);
      },
      selectedSection() {
        return this.state.selectedSection;
      },
      selectedSections() {
        return getSelectedSections(this.state.selectedSection);
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
      async open(newVal) {
        if (newVal) {
          await this.ensureArchiveNotice();
          this.syncSelectedSectionOverlay();
        } else {
          this.syncSelectedSectionOverlay();
          saveOptions();
        }
      },
      async stateSections(newValue) {
        this.setupSectionButtons();
        if (this.caseActions.sections.data.section === null) {
          const firstSection = newValue[0];
          if (firstSection) {
            this.caseActions.sections.data.section = firstSection.id;
            await this.ensureArchiveNotice();
            await this.loadNewSection(firstSection);
          } else {
            await this.onUpdateSectionSelection("all");
          }
        }
      },
      archiveNotice(newNotice) {
        this.caseActions.management.data.flags = getManagementFlagsFromArchiveNotice(newNotice);
      },
      "caseActions.sections.data.section"(newSection, oldSection) {
        if (newSection === oldSection) {
          return;
        }
        for (const [actionName, caseAction] of Object.entries(this.caseActions)) {
          const caseAN = actionName;
          if (caseAN === "sections") {
            continue;
          }
          const actionDefaultEnabled = spiHelperSettings.defaultActions.includes(caseAN);
          const available = shouldShowAction({
            name: caseAN,
            selection: newSection,
            selectionType: this.actionButtons[caseAN].selectionType
          });
          const perSectionDriven = Array.isArray(newSection) && SpecificSectionActions.has(caseAN);
          caseAction.enabled = actionDefaultEnabled && available && !perSectionDriven;
          if (actionDefaultEnabled && available) {
            this.displayedForms.add(caseAN);
          }
        }
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
      this.handlers.beforeUnloadHandler = (e) => {
        const opState = getOpState("mainActions");
        if (!this.allDisabled && opState !== "success" /* Success */) {
          e.preventDefault();
        }
      };
      this.handlers.openHandler = () => {
        this.open = !this.open;
        if (this.open) {
          mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "open", type: "top" });
          if (this.handlers.beforeUnloadHandler) {
            window.addEventListener("beforeunload", this.handlers.beforeUnloadHandler);
          }
        } else {
          if (this.handlers.beforeUnloadHandler) {
            window.removeEventListener("beforeunload", this.handlers.beforeUnloadHandler);
          }
        }
      };
      this.openButton.addEventListener("click", this.handlers.openHandler);
    },
    beforeUnmount() {
      if (this.handlers.openHandler) {
        this.openButton.removeEventListener("click", this.handlers.openHandler);
      }
      if (this.handlers.beforeUnloadHandler) {
        window.removeEventListener("beforeunload", this.handlers.beforeUnloadHandler);
      }
      this.sectionClickCleanup?.();
      this.sectionClickCleanup = null;
    },
    methods: {
      dismissMessage,
      setupSectionButtons() {
        this.sectionClickCleanup?.();
        this.sectionClickCleanup = null;
        const ids = this.state.sections.map((s) => s.id);
        if (ids.length === 0) {
          return;
        }
        this.sectionClickCleanup = addSectionButtons(ids, (sectionId) => {
          if (this.multiSelectMode) {
            this.toggleMultiSelectSection(sectionId);
          } else {
            this.onUpdateSectionSelection(sectionId);
          }
          if (!this.open) {
            this.open = true;
          }
        });
      },
      syncSelectedSectionOverlay() {
        if (!spiHelperSettings.highlightSection || !this.open) {
          clearSelectedSectionOverlays();
          return;
        }
        setSelectedSectionOverlays(this.selectedSections.map((s) => s.id));
      },
      toggleButtonLayout() {
        this.buttonLayout = !this.buttonLayout;
        spiHelperSettings.interface.buttonLayout = this.buttonLayout;
      },
      onActionClick(event, formNameString) {
        const formName = formNameString;
        if (event.ctrlKey || event.metaKey) {
          if (this.displayedForms.has(formName)) {
            this.displayedForms.delete(formName);
          } else {
            this.displayedForms.add(formName);
          }
        } else {
          this.displayedForms = new Set([formName]);
        }
      },
      onAccordionToggle(formNameString) {
        const formName = formNameString;
        if (this.displayedForms.has(formName)) {
          this.displayedForms.delete(formName);
        } else {
          this.displayedForms.add(formName);
        }
      },
      isVisible(name) {
        return this.displayedForms.has(name);
      },
      isActionEnabled(name) {
        if (this.state.selectedSection?.type === "multiple") {
          if (name === "comment") {
            return [...this.caseActions.comment.data.bySection.values()].some((e) => e.enabled);
          }
          if (name === "status") {
            return [...this.caseActions.status.data.bySection.values()].some((e) => e.enabled);
          }
        }
        return this.caseActions[name].enabled;
      },
      async onUpdateSectionSelection(newSelection) {
        if (newSelection === null) {
          return;
        }
        this.caseActions.sections.data.section = newSelection;
        const prevType = this.state.selectedSection?.type ?? null;
        const nextType = newSelection === "all" ? "all" : "single";
        if (prevType !== nextType) {
          this.displayedForms = new Set(Array.from(this.displayedForms).filter((formName) => AlwaysAvailableActions.has(formName)));
        }
        if (newSelection === "all") {
          this.state.selectedSection = { type: "all" };
          this.loadSectionAccounts(this.state.selectedSection, this.startSelectionLoad());
          this.syncSelectedSectionOverlay();
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
        const selection = { type: "single", section: targetSection };
        const signal = this.startSelectionLoad();
        this.state.selectedSection = selection;
        const newText = await loadSectionText(targetSection);
        if (isAborted(signal)) {
          return;
        }
        const result = spiHelperCaseStatusRegex.exec(newText);
        const normalisedStatus = normalizeCaseStatus(result?.[1] ?? "");
        this.caseActions.status.data.old = normalisedStatus;
        this.caseActions.status.data.new = normalisedStatus;
        if (normalisedStatus === "closed" && spiHelperSettings.tickArchiveWhenCaseClosed) {
          this.caseActions.archive.enabled = true;
        }
        this.syncSelectedSectionOverlay();
        this.loadSectionAccounts(selection, signal);
      },
      async toggleMultiSelectMode(newValue) {
        this.multiSelectMode = newValue;
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "multi", enabled: newValue });
        if (!newValue) {
          const current = this.selectedSections;
          if (current.length > 1) {
            const [first] = current;
            if (first) {
              await this.applySectionSelection([first]);
            }
          }
          return;
        }
        if (this.state.selectedSection?.type === "all") {
          await this.applySectionSelection([]);
        }
      },
      async toggleMultiSelectSection(sectionId) {
        const current = this.selectedSections;
        const isRemoving = current.some((section2) => section2.id === sectionId);
        if (isRemoving) {
          await this.applySectionSelection(current.filter((section2) => section2.id !== sectionId));
          return;
        }
        const section = this.state.sections.find((s) => s.id === sectionId);
        if (!section) {
          console.error("toggleMultiSelectSection: Could not find target section with ID", sectionId);
          return;
        }
        await this.applySectionSelection([...current, section]);
      },
      async handleUpdateMultiSelectSections(sectionIds) {
        const idSet = new Set(sectionIds);
        const sections = this.state.sections.filter((section) => idSet.has(section.id));
        await this.applySectionSelection(sections);
      },
      async applySectionSelection(sections) {
        this.pruneBySectionData(new Set(sections.map((s) => s.id)));
        if (sections.length === 0) {
          this.caseActions.sections.data.section = null;
          this.state.selectedSection = null;
          this.syncSelectedSectionOverlay();
          return;
        }
        if (sections.length === 1) {
          const [only] = sections;
          if (!only) {
            return;
          }
          this.caseActions.sections.data.section = only.id;
          await this.loadNewSection(only);
          return;
        }
        const signal = this.startSelectionLoad();
        this.caseActions.sections.data.section = sections.map((s) => s.id);
        const selection = { type: "multiple", sections };
        this.state.selectedSection = selection;
        await Promise.all(sections.map((section) => this.ensureBySectionEntry(section)));
        if (isAborted(signal)) {
          return;
        }
        this.syncSelectedSectionOverlay();
        this.loadSectionAccounts(selection, signal);
      },
      async ensureBySectionEntry(section) {
        if (!this.caseActions.comment.data.bySection.has(section.id)) {
          this.caseActions.comment.data.bySection.set(section.id, {
            text: "* ",
            enabled: spiHelperSettings.defaultActions.includes("comment")
          });
        }
        if (!this.caseActions.status.data.bySection.has(section.id)) {
          const text = await loadSectionText(section);
          const result = spiHelperCaseStatusRegex.exec(text);
          const normalisedStatus = normalizeCaseStatus(result?.[1] ?? "");
          this.caseActions.status.data.bySection.set(section.id, {
            old: normalisedStatus,
            new: normalisedStatus,
            enabled: spiHelperSettings.defaultActions.includes("status")
          });
        }
      },
      pruneBySectionData(keepIds) {
        for (const id of this.caseActions.comment.data.bySection.keys()) {
          if (!keepIds.has(id)) {
            this.caseActions.comment.data.bySection.delete(id);
          }
        }
        for (const id of this.caseActions.status.data.bySection.keys()) {
          if (!keepIds.has(id)) {
            this.caseActions.status.data.bySection.delete(id);
          }
        }
      },
      startSelectionLoad() {
        this.sectionSelectionController?.abort();
        const controller = new AbortController;
        this.sectionSelectionController = controller;
        return controller.signal;
      },
      async loadSectionAccounts(selection, signal) {
        this.accounts = this.accounts.filter((row) => !this.sectionAccountNames.has(row.username));
        const searchText = await (async () => {
          if (selection.type === "all") {
            return loadCaseText(this.state);
          }
          if (selection.type === "multiple") {
            const texts = await Promise.all(selection.sections.map((section) => loadSectionText(section)));
            return texts.join(`
`);
          }
          return loadSectionText(selection.section);
        })();
        if (isAborted(signal)) {
          return;
        }
        const [likelySocks, possibleSocks] = getSockEntries({
          text: searchText,
          fullSearch: true,
          state: this.state
        });
        const allRows = await prefetchSockRows({
          likelySocks,
          possibleSocks,
          blockData: this.caseActions.block.data,
          state: this.state
        });
        if (isAborted(signal)) {
          return;
        }
        this.sectionAccountNames = new Set(this.massAddUserRows(allRows).map((row) => row.username));
      },
      onUpdateNewStatus(newStatus) {
        this.caseActions.comment.data.text = updateCommentWithStatus(this.caseActions.comment.data.text, newStatus);
      },
      onUpdateSectionStatus(sectionId, newStatus) {
        const entry = this.caseActions.comment.data.bySection.get(sectionId);
        if (entry) {
          entry.text = updateCommentWithStatus(entry.text, newStatus);
        }
      },
      async onSubmitActions() {
        if (isOpRunning("mainActions")) {
          return;
        }
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, {
          action: "submit",
          type: "top",
          mode: this.state.selectedSection?.type ?? "none"
        });
        startOp("mainActions");
        this.actionsRunning = true;
        try {
          await spiHelperPerformActions({
            actions: this.caseActions,
            accounts: this.accounts,
            state: this.state
          });
          finishOp("mainActions", "success" /* Success */);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          new VueMessage({
            type: "error",
            content: `Actions stopped: ${message}. Reload and try again. If the issue persists, file a bug report`
          }).show();
          finishOp("mainActions", "failed" /* Failed */);
        } finally {
          this.caseActions.block.data.fetchedUsers.clear();
          this.actionsRunning = false;
        }
      },
      async handleFetchRows() {
        const [likelySocks, possibleSocks] = getSockEntries({
          text: this.caseActions.comment.data.text,
          fullSearch: false,
          state: this.state
        });
        const likelyUsers = new Set(likelySocks.map((sock) => sock.username));
        const newRows = [...likelySocks, ...possibleSocks].map((sock) => updateUserBlockDataSettings({
          userRow: sock,
          defaultBlock: likelyUsers.has(sock.username)
        }));
        const added = new Set(this.massAddUserRows(newRows).map((row) => row.username));
        await ensureUsersFetched(added, this.caseActions.block.data.fetchedUsers);
        applyFetchedUsers({
          accounts: this.accounts,
          usernames: added,
          blockData: this.caseActions.block.data,
          state: this.state
        });
      },
      handleUserSelected(data, rowId) {
        const userRow = this.accounts.find((r) => r.id === rowId);
        if (!userRow) {
          return;
        }
        if (data.blockid !== undefined && !this.caseActions.block.data.userBlocks.has(userRow.username)) {
          const ABAO = mw.util.isIPAddress(data.name) ? data.blockanononly : data.blockautoblocking;
          this.caseActions.block.data.userBlocks.set(userRow.username, {
            username: userRow.username,
            duration: data.blockexpiry ?? "",
            abao: ABAO ?? false,
            acb: data.blocknocreate ?? false,
            ntp: data.blockowntalk ?? false,
            nem: data.blockemail ?? false,
            reason: ""
          });
        }
        UpdateUserAllUserData(data, userRow);
      },
      handleAddRow(row) {
        row ??= getDefaultUserRow(this.state.archiveNotice);
        this.accounts.push(row);
      },
      handleRemoveRows(rowIds) {
        this.accounts = this.accounts.filter((row) => !rowIds.includes(row.id));
      },
      massAddUserRows(newRows) {
        const withDefault = this.accounts.at(-1)?.username === "";
        const existingUsernames = new Set(this.accounts.map((s) => s.username));
        const filteredRows = newRows.filter((newRow) => !existingUsernames.has(newRow.username));
        if (withDefault) {
          filteredRows.forEach((newRow) => {
            this.accounts.splice(this.accounts.length - 1, 0, newRow);
          });
        } else {
          this.accounts = this.accounts.concat(filteredRows);
        }
        return filteredRows;
      },
      async ensureArchiveNotice() {
        if (this.state.archiveNotice) {
          return;
        }
        const archiveNoticeResult = await spiHelperParseArchiveNotice({
          page: context.casePageName,
          state: this.state
        });
        if (archiveNoticeResult === null) {
          this.state.archiveNotice = new ParsedArchiveNotice({ username: context.caseName });
          new VueMessage({
            type: "warning",
            content: "Can't find archivenotice template! Automatically adding the archive notice to the page"
          }).show();
          mw.notify("Can't find archivenotice template! If this is incorrect, please contact DatGuy", { type: "warn" });
          console.warn("archivenoticeResult is null");
        } else {
          this.state.archiveNotice = archiveNoticeResult;
        }
      },
      launchFeedback() {
        this.feedbackDialog.launch({
          subject: `Feedback from ${mw.config.get("wgUserName")}`,
          message: `SPI form v${VERSION}-${MODE}`
        });
      },
      async handleMoveEntireCase() {
        await this.onUpdateSectionSelection("all");
        this.caseActions.move.enabled = true;
      }
    },
    template: `
    <div id="spiHelper-topView" class="spiHelper-mainCard" v-if="open" @keydown.ctrl.enter.capture.prevent="$refs.submitForm?.onSubmit?.()">
      <div id="spiHelper-topView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="launchFeedback">
            <cdx-icon :icon="icons.cdxIconFeedback" />
          </cdx-button>
          <cdx-button aria-label="Toggle layout" weight="quiet" @click="toggleButtonLayout">
            <cdx-icon :icon="buttonLayout ? icons.cdxIconExpand : icons.cdxIconCollapse" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="icons.cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-topView-Action" v-if="buttonLayout">
        <div class="spiHelper-buttonRow">
          <action-button
              v-for="[name, button] of Object.entries(actionButtons)"
              :key="name"
              :name="name"
              :label="button.label"
              :selection-type="button.selectionType"
              :selection="caseActions.sections.data.section"
              :displayedForms="displayedForms"
              :actionEnabled="isActionEnabled(name)"
              @click="onActionClick($event, name)"
          />
        </div>
        <div class="spiHelper-contentRow">
          <div v-for="name of actionButtonKeys"
               :key="name"
               :class="{ 'is-visible': isVisible(name) }">
            <action-content
                :name="name"
                :case-actions="caseActions"
                :accounts="accounts"
                :state="state"
                :multi-select-mode="multiSelectMode"
                :selected-sections="selectedSections"
                @update-section-selection="onUpdateSectionSelection"
                @update-status="onUpdateNewStatus"
                @update-section-status="onUpdateSectionStatus"
                @update:multi-select-mode="toggleMultiSelectMode"
                @update-multi-select-sections="handleUpdateMultiSelectSections"
                @user-selected="handleUserSelected"
                @remove-rows="handleRemoveRows"
                @add-row="handleAddRow"
                @fetch-rows="handleFetchRows"
                @move-entire-case="handleMoveEntireCase"
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
            :actionEnabled="isActionEnabled(name)"
            @action-toggled="onAccordionToggle(name)"
        >
          <action-content
              :name="name"
              :case-actions="caseActions"
              :accounts="accounts"
              :state="state"
              :multi-select-mode="multiSelectMode"
              :selected-sections="selectedSections"
              @update-section-selection="onUpdateSectionSelection"
              @update-status="onUpdateNewStatus"
              @update-section-status="onUpdateSectionStatus"
              @update:multi-select-mode="toggleMultiSelectMode"
              @update-multi-select-sections="handleUpdateMultiSelectSections"
              @user-selected="handleUserSelected"
              @remove-rows="handleRemoveRows"
              @add-row="handleAddRow"
              @fetch-rows="handleFetchRows"
              @move-entire-case="handleMoveEntireCase"
          />
        </action-accordion>
      </div>
      <submit-form v-if="caseActions.sections.data.section !== null" :accounts="accounts"
                   v-model:lock-comment="caseActions.block.data.lockcomment"
                   v-model:skipCUVerifyUsers="caseActions.block.data.skipCUVerifyUsers"
                   :case-actions="caseActions" :state="state"
                   :all-disabled="allDisabled" :action-name="'mainActions'" :check-conflict="true"
                   @on-submit="onSubmitActions" ref="submitForm" />
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div class="spiHelper-messageRow">
        <cdx-message v-for="message in messages" :key="message.id" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true" @user-dismissed="dismissMessage(message.id)">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `
  });
  // src/ui/views/top/actions/archiveAction.ts
  var ArchiveActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      selection: { type: [Object, null], required: true },
      statusAction: { type: Object, required: true }
    },
    emits: ["update:enabled"],
    computed: {
      isMultiSelectMode() {
        return this.selection?.type === "multiple";
      },
      skippedSections() {
        if (this.selection?.type !== "multiple") {
          return [];
        }
        return this.selection.sections.map((section) => ({ name: section.name, status: this.effectiveSectionStatus(section.id) })).filter((entry) => entry.status !== "closed");
      },
      badStatus() {
        if (!this.selection || this.selection.type === "all") {
          return false;
        }
        if (this.selection.type === "multiple") {
          return this.skippedSections.length === this.selection.sections.length;
        }
        return this.status !== "closed";
      },
      status() {
        const { enabled, data } = this.statusAction;
        return resolveEffectiveStatus({ enabled, old: data.old, new: data.new });
      }
    },
    methods: {
      effectiveSectionStatus(sectionId) {
        const entry = this.statusAction.data.bySection.get(sectionId);
        return entry ? resolveEffectiveStatus(entry) : "";
      }
    },
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus && !isMultiSelectMode" type="warning" :inline="true">
      The selected section's status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
    <cdx-message v-if="isMultiSelectMode && skippedSections.length > 0" type="warning">
      <p>These sections aren't set to 'closed' and will be skipped:</p>
      <ul>
        <li v-for="section in skippedSections" :key="section.name">
          {{ section.name }} is set to '{{ section.status }}'
        </li>
      </ul>
      <p>If you'd like to archive them, change their status to 'closed'.</p>
    </cdx-message>
  `
  });
  // src/ui/views/top/actions/blockAction.ts
  var InputColumns = ["block", "duration", "acb", "abao", "ntp", "nem", "lock"];
  var ToggleColumns = ["block", "acb", "abao", "ntp", "nem", "lock"];
  var BlockActionComponent = defineComponent({
    props: {
      accounts: { type: Array, required: true },
      blockOptions: { type: Object, required: true },
      userLocks: { type: Map, required: true },
      userGlobalBlocks: { type: Map, required: true },
      userBlocks: { type: Map, required: true },
      defaultMaster: { type: String, required: true },
      fetchType: { type: String, required: true },
      enabled: { type: Boolean, required: true }
    },
    emits: ["update:enabled", "update:modelValue", "update:blockOptions", "removeRows", "addRow", "userSelected", "usernameChanged", "fetchRows"],
    data() {
      const columns = [
        { id: "username", label: "Username" },
        { id: "tag", label: "Tag" },
        { id: "lock", label: "Request Global" }
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
      const selectedRows = [];
      const topButtonActions = { copied: false, fetched: false };
      const popovers = {
        all: {
          open: false
        },
        row: {
          anchor: null,
          open: false,
          tagIndex: 0,
          rowId: null,
          sourceTag: null
        },
        clipboardTag: null
      };
      return {
        columns,
        selectedRows,
        topButtonActions,
        isAdmin,
        isCheckuser,
        isClerk,
        popovers,
        cdxIconCopy: s6,
        cdxIconDownload: V6,
        cdxIconTrash: Q9,
        cdxIconUserAvatar: vc,
        cdxIconUserAvatarOutline: dc,
        spiHelperPaginationSizeOptions
      };
    },
    computed: {
      paginate() {
        return this.accounts.length > spiHelperPaginationThreshold;
      },
      selectAll() {
        return this.selectedRows.length === this.accounts.length;
      },
      selectAllIndeterminate() {
        if (this.selectedRows.length === this.accounts.length) {
          return false;
        } else
          return this.selectedRows.length !== 0;
      },
      allowLockOption() {
        return this.accounts.some((user) => user.block.lock && !isNonRegisteredAccount(user.username) && !this.userLocks.get(user.username));
      },
      targetRows() {
        if (this.selectedRows.length === 0) {
          return this.accounts;
        }
        const selected = new Set(this.selectedRows);
        return this.accounts.filter((row) => selected.has(row.id));
      },
      disabledCells() {
        const cells = new Map;
        for (const row of this.accounts) {
          const rowCells = {};
          for (const column of InputColumns) {
            rowCells[column] = isInputDisabled(row, column, this.blockOptions, this.userBlocks, this.userLocks, this.userGlobalBlocks, this.targetRows);
          }
          cells.set(row.id, rowCells);
        }
        return cells;
      },
      setAllState() {
        const state = {};
        for (const column of ToggleColumns) {
          let eligible = 0;
          let checked = 0;
          for (const row of this.targetRows) {
            if (this.disabledCells.get(row.id)?.[column]) {
              continue;
            }
            eligible++;
            if (row.block[column]) {
              checked++;
            }
          }
          state[column] = {
            value: eligible > 0 && checked === eligible,
            indeterminate: checked > 0 && checked < eligible
          };
        }
        return state;
      }
    },
    methods: {
      isNonRegisteredAccount,
      isSockmasterTag,
      isInputDisabled(row, column) {
        if (row === null) {
          return isInputDisabled(null, column, this.blockOptions, this.userBlocks, this.userLocks, this.userGlobalBlocks, this.targetRows);
        }
        return this.disabledCells.get(row.id)?.[column] ?? false;
      },
      async copySocks() {
        if (this.selectedRows.length === 0) {
          return;
        }
        let text = "{{sock list";
        let i = 0;
        for (const row of this.targetRows) {
          text += `|${++i}=${row.username}`;
        }
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
        this.$emit("removeRows", [...this.selectedRows]);
        this.selectedRows = [];
      },
      addDefaultRow() {
        this.$emit("addRow");
      },
      handleSelectAll(newValue) {
        if (newValue) {
          this.selectedRows = this.accounts.map((row) => row.id);
        } else {
          this.selectedRows = [];
        }
      },
      handleUserSelected(data, row) {
        this.$emit("userSelected", data, row.id);
      },
      setAllBlockFields(key, value) {
        const rows = this.targetRows.filter((row) => !this.isInputDisabled(row, key));
        for (const row of rows) {
          row.block[key] = value;
        }
      },
      setAllTags(tag2) {
        for (const row of this.targetRows) {
          if (isNonRegisteredAccount(row.username)) {
            continue;
          }
          row.block.tags = [tag2.clone()];
        }
      },
      fetchSocks() {
        this.topButtonActions.fetched = true;
        this.$emit("fetchRows");
      },
      isSameTagTarget(tag2, tagIndex, rowId) {
        const { row } = this.popovers;
        if (row.rowId !== rowId) {
          return false;
        }
        return tag2 === null ? row.sourceTag === null && row.tagIndex === tagIndex : row.sourceTag === tag2;
      },
      showTagPopover(tag2, tagIndex, rowId, $event) {
        const isSameTarget = this.isSameTagTarget(tag2, tagIndex, rowId);
        this.popovers.row.tagIndex = tagIndex;
        this.popovers.row.rowId = rowId;
        this.popovers.row.anchor = $event.currentTarget;
        if (isSameTarget) {
          this.popovers.row.open = !this.popovers.row.open;
        } else {
          this.popovers.row.sourceTag = tag2;
          this.popovers.row.open = true;
          const rowTagPopover = this.$refs.rowTagPopover;
          rowTagPopover.setTag(tag2);
        }
      },
      handleTagUpdate(updatedTag) {
        const targetRow = this.accounts.find((row) => row.id === this.popovers.row.rowId);
        if (!targetRow) {
          console.error("Could not find target row for tag update", this.popovers.row.rowId);
          return;
        }
        targetRow.block.tags.splice(this.popovers.row.tagIndex, 1, updatedTag.clone());
      },
      handleTagDelete() {
        const targetRow = this.accounts.find((row) => row.id === this.popovers.row.rowId);
        if (!targetRow) {
          console.error("Could not find target row for tag delete", this.popovers.row.rowId);
          return;
        }
        targetRow.block.tags.splice(this.popovers.row.tagIndex, 1);
      },
      handleTagAdd(rowId, currentDraft) {
        const targetRow = this.accounts.find((row) => row.id === rowId);
        if (!targetRow) {
          console.error("Could not find target row for tag add", rowId);
          return;
        }
        const newTag = currentDraft ? currentDraft.clone() : new SockpuppetTag({ master: this.defaultMaster, status: "blocked" });
        targetRow.block.tags.push(newTag);
        this.popovers.row.tagIndex = targetRow.block.tags.length - 1;
        this.popovers.row.sourceTag = newTag;
        const rowTagPopover = this.$refs.rowTagPopover;
        rowTagPopover.setTag(newTag);
      },
      getRowTagsWithDefault(tags) {
        if (tags.length === 0) {
          return [null];
        } else {
          return tags;
        }
      },
      handleTagAddAll() {
        for (const row of this.targetRows) {
          if (isNonRegisteredAccount(row.username)) {
            continue;
          }
          row.block.tags.push(new SockpuppetTag({ master: this.defaultMaster, status: "blocked" }));
        }
      },
      handleTagDeleteAll() {
        for (const row of this.targetRows) {
          row.block.tags.length = 0;
        }
      },
      validateTag(tag2) {
        return !(isSockpuppetTag(tag2) && !tag2.master);
      },
      tagStatusDisplay(tag2) {
        return isSockmasterTag(tag2) ? SockmasterTagStatuses[tag2.status] : SockpuppetTagStatuses[tag2.status];
      },
      tagLabel(tag2) {
        if (tag2 === null) {
          return "None";
        }
        return isSockmasterTag(tag2) ? SockmasterTagStatuses[tag2.status].label : tag2.master;
      }
    },
    template: `
    <!--suppress VueUnrecognizedDirective, VueUnrecognizedSlot -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <div role="group" aria-labelledby="spiHelper-blockoptions-group-label" class="spiHelper-blockoptions-group">
        <cdx-label id="spiHelper-blockoptions-group-label">
          {{ isAdmin ? 'Block Options' : 'Tag Options' }}
        </cdx-label>

        <cdx-checkbox v-model="blockOptions.noBlock" v-if="isAdmin">
          Do not make any blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.override" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Override any existing blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.tagUnattached" v-if="isClerk">
          Tag accounts without an attached local account
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.cuBlock" v-if="isCheckuser" :disabled="blockOptions.noBlock">
          Mark blocks as Checkuser blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.cuBlockOnly" v-if="isCheckuser" :disabled="!blockOptions.cuBlock">
          <span v-pre>
            Suppress the usual block summary and only use {{checkuserblock-account}} and {{checkuserblock}}
          </span>
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.addMasterNotice" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Add talk page notice when (re)blocking the sockmaster
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.addSockNotice" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Add talk page notice when blocking socks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.blankTalk" v-if="isAdmin"
                      :disabled="blockOptions.noBlock || (!blockOptions.addMasterNotice && !blockOptions.addSockNotice)">
          Blank the talk page when adding talk notices
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.lockHideNames" :disabled="!allowLockOption">
          Hide usernames when requesting global locks
        </cdx-checkbox>
      </div>
      <cdx-table caption="Socks" :show-vertical-borders="true" :use-row-selection="true"
                 :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
                 :paginate="paginate" :pagination-size-options="spiHelperPaginationSizeOptions"
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
              <cdx-button @click="fetchSocks" :aria-label="'Fetch socks from ' + fetchType">
                <cdx-icon :icon="cdxIconDownload" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.fetched" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('fetched')"
                           @auto-dismissed="onMessageDismissed('fetched')"
                           :inline="true">Fetched from {{ fetchType }}!</cdx-message>
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
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="tagHeader">Tag</th>
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
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllState.block.value" :indeterminate="setAllState.block.indeterminate"
                            @update:model-value="setAllBlockFields('block', $event)"
                            :disabled="isInputDisabled(null, 'block')">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAllBlockFields('duration', $event)"
                            :disabled="isInputDisabled(null, 'duration')" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllState.acb.value" :indeterminate="setAllState.acb.indeterminate"
                            @update:model-value="setAllBlockFields('acb', $event)"
                            :disabled="isInputDisabled(null, 'acb')">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllState.abao.value" :indeterminate="setAllState.abao.indeterminate"
                            @update:model-value="setAllBlockFields('abao', $event)"
                            :disabled="isInputDisabled(null, 'abao')">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllState.ntp.value" :indeterminate="setAllState.ntp.indeterminate"
                            @update:model-value="setAllBlockFields('ntp', $event)"
                            :disabled="isInputDisabled(null, 'ntp')">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllState.nem.value" :indeterminate="setAllState.nem.indeterminate"
                            @update:model-value="setAllBlockFields('nem', $event)"
                            :disabled="isInputDisabled(null, 'nem')">
                Set all no email
              </cdx-checkbox>
            </th>

            <th scope="col" class="selectTagOptions">
              <cdx-button ref="selectAllTagButton" @click="popovers.all.open = true">
                Set all tags
              </cdx-button>
              <tag-popover :anchor="$refs.selectAllTagButton" :default-master="defaultMaster"
                           v-model:open="popovers.all.open" :clipboard-tag="popovers.clipboardTag"
                           @saveTag="setAllTags" @deleteTag="handleTagDeleteAll"
                           @addTag="handleTagAddAll" @copyTag="popovers.clipboardTag = $event" />
            </th>

            <th scope="col"
                v-tooltip="'Locks for accounts, global blocks for temporary accounts and IPs'">
              <cdx-checkbox :hide-label="true"
                            :model-value="setAllState.lock.value" :indeterminate="setAllState.lock.indeterminate"
                            @update:model-value="setAllBlockFields('lock', $event)"
                            :disabled="isInputDisabled(null, 'lock')">
                Set all global requests
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)" />
        </template>

        <template #item-block="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.block"
                        :disabled="isInputDisabled(row, 'block')">
            Block
          </cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.block.duration" :shortened="true" :auto-dismiss="true" :touched="true"
                        :disabled="isInputDisabled(row, 'duration')"
                        placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.acb"
                        :disabled="isInputDisabled(row, 'acb')">
            Account creation blocked
          </cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.abao"
                        :disabled="isInputDisabled(row, 'abao')">
            Autoblock/Anon-only
          </cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.ntp"
                        :disabled="isInputDisabled(row, 'ntp')">
            No talk page
          </cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.nem"
                        :disabled="isInputDisabled(row, 'nem')">
            No email
          </cdx-checkbox>
        </template>

        <template #item-tag="{ item, row }">
          <cdx-button v-for="(tag, index) in getRowTagsWithDefault(row.block.tags)" class="userTag"
                      @click="showTagPopover(tag, index, row.id, $event)"
                      :action="validateTag(tag) ? 'default' : 'destructive'"
                      :disabled="isNonRegisteredAccount(row.username)">
            <cdx-icon v-if="tag !== null" class="userTag__kind"
                      :icon="isSockmasterTag(tag) ? cdxIconUserAvatar : cdxIconUserAvatarOutline"
                      :title="isSockmasterTag(tag) ? 'Master' : 'Sockpuppet'" />
            <span class="userTag__label">{{ tagLabel(tag) }}</span>
            <cdx-icon v-if="tag !== null" class="userTag__status"
                      :icon="tagStatusDisplay(tag).icon"
                      :title="tagStatusDisplay(tag).label" />
          </cdx-button>
        </template>

        <template #item-lock="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.lock"
                        :disabled="isInputDisabled(row, 'lock')">
            Request {{ isNonRegisteredAccount(row.username) ? 'global block' : 'lock' }}
          </cdx-checkbox>
        </template>

        <template #footer>
          <cdx-button @click="addDefaultRow">Add Row</cdx-button>
        </template>
      </cdx-table>
      <tag-popover ref="rowTagPopover" :anchor="popovers.row.anchor" v-model:open="popovers.row.open"
                   :default-master="defaultMaster" :clipboard-tag="popovers.clipboardTag"
                   @saveTag="handleTagUpdate" @addTag="handleTagAdd(popovers.row.rowId, $event)"
                   @deleteTag="handleTagDelete" @copyTag="popovers.clipboardTag = $event" />
    </action-container>
  `
  });
  // src/ui/views/top/actions/commentAction.ts
  var CommentActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      text: { type: String, required: true },
      selectedSection: { type: [Object, null], required: true }
    },
    emits: ["update:enabled", "update:text"],
    data() {
      const isClerk = spiHelperIsClerk();
      const isAdmin = spiHelperIsAdmin();
      const isCheckuser = spiHelperIsCheckuser();
      const noteTemplates = [
        { value: "takenote", label: "Note" }
      ];
      const clerkTemplates = [...spiHelperClerkTemplates];
      const cuTemplates = [...spiHelperCUTemplates];
      if (isCheckuser) {
        noteTemplates.unshift({ value: "cunote", label: "CheckUser note" });
      }
      if (isAdmin) {
        noteTemplates.unshift({ value: "adminnote", label: "Administrator note" });
      }
      if (isClerk) {
        noteTemplates.unshift({ value: "clerknote", label: "Clerk note" });
      }
      const customTemplates = pruneMenuData(spiHelperSettings.custom.commentTemplates);
      return {
        isClerk,
        isAdmin,
        isCheckuser,
        noteTemplates,
        clerkTemplates,
        cuTemplates,
        customTemplates,
        loadingPreview: false,
        htmlPreview: "",
        fullPreview: spiHelperSettings.interface.fullPreview,
        cdxIconReload: K8
      };
    },
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
        const userText = addSignature(this.text);
        try {
          if (this.fullPreview && this.selectedSection?.type === "single") {
            const sectionText = await loadSectionText(this.selectedSection.section);
            let startIndex;
            let endIndex;
            if (this.isClerk || this.isAdmin) {
              startIndex = spiHelperAdminSectionWithPrecedingNewlinesRegex.exec(sectionText)?.index;
              endIndex = spiHelperClosingRuleRegex.exec(sectionText)?.index;
            } else {
              startIndex = /\s*====\s*<big>Comments by other users<\/big>\s*====\s*/i.exec(sectionText)?.index;
              endIndex = spiHelperAdminSectionWithPrecedingNewlinesRegex.exec(sectionText)?.index;
            }
            const subsectionText = sectionText.slice(startIndex ?? 0, endIndex ?? 0).trim() + `
` + userText;
            this.htmlPreview = await spiHelperRenderText(context.pageName, subsectionText);
          } else {
            this.htmlPreview = await spiHelperRenderText(context.pageName, userText);
          }
        } finally {
          this.loadingPreview = false;
        }
      },
      insertNote(noteValue) {
        const newText = this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i, "* {{" + noteValue + "}} ");
        this.$emit("update:text", newText);
        this.commentBox.focus();
      },
      insertText(templateValue) {
        templateValue = `{{${templateValue.replace(/^{+|}+$/g, "")}}}`;
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
    },
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="onEnable">
      <div class="spiHelper-templateRow">
        <cdx-select :menu-items="noteTemplates" default-label="Comment templates" @update:selected="insertNote" />
        <cdx-select v-if="isClerk || isAdmin" :menu-items="clerkTemplates" default-label="Admin/clerk templates" @update:selected="insertText" />
        <cdx-select v-if="isCheckuser" :menu-items="cuTemplates" default-label="CheckUser templates" @update:selected="insertText" />
        <cdx-select v-if="customTemplates.length > 0" :menu-items="customTemplates" default-label="Custom templates"
                    @update:selected="insertText" />
      </div>
      <cdx-text-area ref="commentBox" :autosize="true" placeholder="Write your comment" :model-value="text"
                     @update:model-value="onTextUpdate" />
      <div class="cdx-card spiHelper-PreviewBox" style="min-height:26px">
        <cdx-button class="spiHelper-preview-reload" aria-label="Load preview" @click="updatePreview"
                    weight="primary" action="progressive" :disabled="loadingPreview">
          <cdx-progress-indicator v-if="loadingPreview">Loading preview</cdx-progress-indicator>
          <cdx-icon v-else :icon="cdxIconReload" />
        </cdx-button>
        <div v-html="htmlPreview" class="spiHelper-htmlPreview" />
      </div>
    </action-container>
  `
  });
  // src/ui/views/top/actions/changeStatusAction.ts
  var ChangeStatusActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      oldStatus: { type: String, required: true },
      newStatus: { type: String, required: true }
    },
    emits: ["update:enabled", "update:newStatus"],
    computed: {
      selected: {
        get() {
          const menuGroupData = this.caseStatusItems.flatMap((item) => isMenuGroupData(item) ? item.items : [item]);
          if (this.newStatus === "nochange") {
            const hasOldStatus = menuGroupData.some((item) => item.value === this.oldStatus);
            return hasOldStatus ? this.oldStatus : "nochange";
          }
          const hasNewStatus = menuGroupData.some((item) => item.value === this.newStatus);
          return hasNewStatus ? this.newStatus : "nochange";
        },
        set(value) {
          if (value === null) {
            return;
          }
          this.$emit("update:newStatus", String(value));
        }
      },
      caseStatusItems() {
        const mainItems = [];
        const clerkItems = [];
        const cuItems = [];
        const deferItems = [];
        const isCheckuser = spiHelperIsCheckuser();
        const isClerk = spiHelperIsClerk();
        const cuRequested = /^(?:CU|checkuser|CUrequest|request|cumoreinfo)$/i.test(this.oldStatus);
        const cuEndorsed = /^(?:cu)?endorsed?$/i.test(this.oldStatus);
        const cuCompleted = /^(?:inprogress|checking|relist(ed)?|checked|completed|declined?|cudeclined?)$/i.test(this.oldStatus);
        const noChangeLabel = `No change (${this.oldStatus})`;
        mainItems.push({ label: noChangeLabel, value: "nochange" });
        if (spiHelperCaseClosedRegex.test(this.oldStatus)) {
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
        }
        clerkItems.push({ label: "Place case on hold", value: "hold" });
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
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-select v-model:selected="selected" :menu-items="caseStatusItems" default-label="New case status" />
    </action-container>
  `
  });
  // src/ui/views/top/actions/linkAction.ts
  var LinkActionComponent = defineComponent({
    props: {
      accounts: { type: Array, required: true },
      caseName: { type: String, required: true },
      enabled: { type: Boolean, required: true }
    },
    emits: ["update:enabled", "update:modelValue", "removeRows", "addRow", "userSelected", "usernameChanged"],
    data() {
      const columns = [
        { id: "username", label: "Username" },
        { id: "analyser", label: "Interaction Analyser" },
        { id: "timeline", label: "Timeline" },
        { id: "timecard", label: "Timecard" },
        { id: "pages", label: "Pages" },
        { id: "summary", label: "Summaries" },
        { id: "cuwiki", label: "CU wiki" },
        { id: "interleaved", label: "Interleaved" }
      ];
      const optionColumns = columns.slice(1);
      const selectedRows = [];
      return {
        columns,
        optionColumns,
        selectedRows,
        cdxIconAdd: z5,
        cdxIconTrash: Q9,
        spiHelperPaginationSizeOptions
      };
    },
    computed: {
      paginate() {
        return this.accounts.length > spiHelperPaginationThreshold;
      },
      columnState() {
        const rows = this.accounts;
        const state = {};
        for (const column of this.optionColumns) {
          if (rows.length === 0) {
            state[column.id] = {
              checked: false,
              indeterminate: false
            };
            continue;
          }
          const values = rows.map((r) => r.link[column.id]);
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
        return this.accounts.length > 0 && this.optionColumns.every((k) => this.columnState[k.id].checked);
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
          const resultUrl = linkFormat.baseUrl(this.caseName);
          if (linkFormat.startingParams) {
            for (const [key, value] of linkFormat.startingParams) {
              resultUrl.searchParams.set(key, value);
            }
          }
          const includedUsers = this.accounts.reduce((accumulator, row) => {
            if (row.link[linkColumn.id]) {
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
        return this.accounts.length > 0 && this.selectedRows.length === this.accounts.length;
      },
      selectAllIndeterminate() {
        if (this.selectedRows.length === this.accounts.length) {
          return false;
        } else
          return this.selectedRows.length !== 0;
      }
    },
    watch: {
      selectedRows(newValue, oldValue) {
        const oldSet = new Set(oldValue);
        const newSet = new Set(newValue);
        const rowsById = new Map(this.accounts.map((row) => [row.id, row]));
        const toggle = (id, enabled) => {
          const row = rowsById.get(id);
          if (row)
            this.toggleRow(row, enabled);
        };
        for (const id of newSet) {
          if (!oldSet.has(id))
            toggle(id, true);
        }
        for (const id of oldSet) {
          if (!newSet.has(id))
            toggle(id, false);
        }
      }
    },
    methods: {
      handleSelectAll(newValue) {
        if (newValue) {
          this.selectedRows = this.accounts.map((row) => row.id);
        } else {
          this.selectedRows = [];
        }
      },
      handleUserSelected(data, row) {
        this.$emit("userSelected", data, row.id);
      },
      addDefaultRow() {
        this.$emit("addRow");
      },
      removeRows() {
        this.$emit("removeRows", [...this.selectedRows]);
        this.selectedRows = [];
      },
      toggleColumn(key, value) {
        for (const row of this.accounts) {
          row.link[key] = value;
        }
      },
      toggleAllColumns(value) {
        for (const column of this.optionColumns) {
          this.toggleColumn(column.id, value);
        }
      },
      toggleRow(row, value) {
        for (const col of this.optionColumns) {
          row.link[col.id] = value;
        }
      },
      getLinkFormat(columnId) {
        switch (columnId) {
          case "analyser":
            return spiHelperLinkViewURLFormats.editorInteractionAnalyser;
          case "cuwiki":
            return spiHelperLinkViewURLFormats.checkUserWikiSearch;
          case "interleaved":
            return spiHelperLinkViewURLFormats.interleaved;
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
    template: `
    <!--suppress VueUnrecognizedDirective -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-table :hide-caption="false" caption="Links" :use-row-selection="true"
                 :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
                 :paginate="paginate" :pagination-size-options="spiHelperPaginationSizeOptions"
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
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)" />
        </template>

        <template #item-analyser="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.analyser">Editor interaction analyser</cdx-checkbox>
        </template>
        <template #item-timeline="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.timeline">Consolidated timeline</cdx-checkbox>
        </template>
        <template #item-timecard="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.timecard">Timecard</cdx-checkbox>
        </template>
        <template #item-pages="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.pages">Pages</cdx-checkbox>
        </template>
        <template #item-summary="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.summary">Summaries</cdx-checkbox>
        </template>
        <template #item-cuwiki="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.cuwiki">CheckUser wiki</cdx-checkbox>
        </template>
        <template #item-interleaved="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.interleaved">Interleaved</cdx-checkbox>
        </template>
      </cdx-table>
      <ul>
        <li v-for="[columnId, linkItem] in Object.entries(linkItems)" :key="columnId">
          <a :href="linkItem.url.href">{{ linkItem.label }}</a>
        </li>
      </ul>
    </action-container>
  `
  });
  // src/ui/views/top/actions/managementAction.ts
  var ManagementActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      flags: { type: Set, required: true }
    },
    emits: ["update:enabled", "update:flags"],
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
    computed: {
      internalFlags: {
        get() {
          return Array.from(this.flags);
        },
        set(newValue) {
          this.$emit("update:flags", new Set(newValue));
        }
      }
    },
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `
  });
  // src/ui/views/top/actions/moveAction.ts
  var MoveActionComponent = defineComponent({
    props: {
      enabled: { type: Boolean, required: true },
      target: { type: String, required: true },
      suppress: { type: Boolean, required: true },
      addNote: { type: Boolean, required: true },
      selection: { type: [Object, null], required: true },
      archiveEnabled: { type: Boolean, required: true }
    },
    emits: ["update:enabled", "update:target", "update:suppress", "update:addNote", "moveEntireCase"],
    data() {
      return {
        canSuppressRedirect: spiHelperCanSuppressRedirect()
      };
    },
    computed: {
      isSectionMove() {
        return this.selectionType === "single";
      },
      moveTitle() {
        if (!this.selection) {
          return "ERROR";
        }
        if (this.selection.type === "all") {
          return "entire case";
        }
        if (this.selection.type === "multiple") {
          return `${this.selection.sections.length} sections`;
        }
        return "section " + this.selection.section.name;
      },
      disabled() {
        return this.archiveEnabled || this.selectionType === "multiple";
      },
      selectionType() {
        return this.selection?.type ?? null;
      }
    },
    watch: {
      archiveEnabled: {
        handler(enabled) {
          if (enabled) {
            this.$emit("update:enabled", false);
          }
        },
        immediate: true
      }
    },
    template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);"
                      :disabled="disabled">
      <h3>Moving {{ moveTitle }}</h3>
      <page-lookup :model-value="target" @update:model-value="$emit('update:target', $event)"
                   :namespace="4" prefix="Sockpuppet investigations/"
                   placeholder="Title" label="New Case Name" />
      <cdx-message v-if="isSectionMove" type="notice" :allow-user-dismiss="true" style="margin-top: 16px;">
        <p><strong>You are moving a section</strong></p>
        <p>
          Make sure you are expecting to move only the section and not the entire case.
          If you wish to move the entire case, <a @click="$emit('moveEntireCase')">click here</a>
        </p>
      </cdx-message>
      <cdx-checkbox style="margin-top: 16px;" v-if="!isSectionMove" :model-value="suppress"
                    @update:model-value="$emit('update:suppress', $event)">
        {{ canSuppressRedirect ? 'Suppress redirect' : 'Request redirect deletion' }}
        <template #description>
          <template v-if="canSuppressRedirect">
            Delete the old case page
          </template>
          <template v-else>
            Request <a href="//en.wikipedia.org/wiki/Wikipedia:Speedy_deletion#G6._Technical_deletions">G6</a> deletion
            of the old case page
          </template>
          (one you're on right now)
        </template>
      </cdx-checkbox>
      <cdx-checkbox v-if="!isSectionMove" :model-value="addNote" @update:model-value="$emit('update:addNote', $event)">
        Add old case note in archives
        <template #description>
          Adds a note for the original case name in merged archives to help distinguish them
        </template>
      </cdx-checkbox>
    </action-container>
    <cdx-message v-if="archiveEnabled" type="warning" :inline="true">
      Archival is enabled, which overrides moving.
    </cdx-message>
    <cdx-message v-if="selectionType === 'multiple'" type="warning" :inline="true">
      Moving isn't currently supported while multiple sections are selected.
    </cdx-message>
  `
  });
  // src/ui/views/top/actions/multiSection/commentAction.ts
  var defaultEntry = { text: "* ", enabled: false };
  var MultiSectionCommentActionComponent = defineComponent({
    props: {
      sections: { type: Array, required: true },
      bySection: { type: Object, required: true }
    },
    methods: {
      entry(sectionId) {
        return this.bySection.get(sectionId) ?? defaultEntry;
      },
      onUpdateEnabled(sectionId, enabled) {
        const existing = this.bySection.get(sectionId);
        if (existing) {
          existing.enabled = enabled;
        }
      },
      onUpdateText(sectionId, text) {
        const existing = this.bySection.get(sectionId);
        if (existing) {
          existing.text = text;
        }
      }
    },
    template: `
    <div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
      <h4>{{ section.name }}</h4>
      <comment-action :enabled="entry(section.id).enabled"
                      @update:enabled="onUpdateEnabled(section.id, $event)"
                      :text="entry(section.id).text"
                      @update:text="onUpdateText(section.id, $event)"
                      :selected-section="{ type: 'single', section }" />
    </div>
  `
  });
  // src/ui/views/top/actions/multiSection/statusAction.ts
  var defaultEntry2 = { old: "new", new: "nochange", enabled: false };
  var MultiSectionStatusActionComponent = defineComponent({
    props: {
      sections: { type: Array, required: true },
      bySection: { type: Object, required: true }
    },
    emits: ["update-section-status"],
    methods: {
      entry(sectionId) {
        return this.bySection.get(sectionId) ?? defaultEntry2;
      },
      onUpdateEnabled(sectionId, enabled) {
        const existing = this.bySection.get(sectionId);
        if (existing) {
          existing.enabled = enabled;
        }
      },
      onUpdateNewStatus(sectionId, newStatus) {
        const existing = this.bySection.get(sectionId);
        if (existing) {
          existing.new = newStatus;
        }
        this.$emit("update-section-status", sectionId, newStatus);
      }
    },
    template: `
    <div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
      <h4>{{ section.name }}</h4>
      <change-status-action :enabled="entry(section.id).enabled"
                            @update:enabled="onUpdateEnabled(section.id, $event)"
                            :old-status="entry(section.id).old" :new-status="entry(section.id).new"
                            @update:new-status="onUpdateNewStatus(section.id, $event)" />
    </div>
  `
  });
  // src/ui/views/top/actions/sectionAction.ts
  var SectionActionComponent = defineComponent({
    props: {
      allSections: { type: Array, required: true },
      selectedSection: {
        type: [Number, Array, String, null],
        required: true
      },
      multiSelectMode: { type: Boolean, required: true },
      selectedSections: { type: Array, required: true }
    },
    emits: [
      "update-section-selection",
      "update:multiSelectMode",
      "update-multi-select-sections"
    ],
    data() {
      return {
        menuPointerOverHandler: null,
        menuPointerLeaveHandler: null,
        menuFocusInHandler: null,
        activeSectionId: null,
        overlayType: null,
        hoverPreviewTarget: null,
        hoverPreviewMenuItems: []
      };
    },
    computed: {
      canJumpToSelectedSection() {
        return !this.multiSelectMode && typeof this.selectedSection === "number";
      },
      sectionSelectElement() {
        const sectionSelect = this.$refs.sectionSelect;
        return sectionSelect ? sectionSelect.$el : null;
      },
      multiselectLookupElement() {
        const lookup = this.$refs.multiselectLookup;
        return lookup ? lookup.$el : null;
      },
      menuItems() {
        const items = this.allSections.map((s) => ({
          value: s.id,
          label: s.name
        }));
        items.push({ value: "all", label: "All Sections" });
        return items;
      },
      multiSelectMenuItems() {
        return this.allSections.map((s) => ({ value: s.id, label: s.name }));
      },
      multiSelectChips: {
        get() {
          return this.selectedSections.map((section) => ({ value: section.id, label: section.name }));
        },
        set(chips) {
          this.emitMultiSelectIds(chips.map((chip) => chip.value));
        }
      },
      multiSelectSelected: {
        get() {
          return this.selectedSections.map((section) => section.id);
        },
        set(values) {
          this.emitMultiSelectIds(values);
        }
      }
    },
    watch: {
      async multiSelectMode() {
        this.detachHoverPreviewListeners();
        await this.$nextTick();
        this.attachHoverPreviewListeners();
      }
    },
    mounted() {
      this.attachHoverPreviewListeners();
    },
    beforeUnmount() {
      this.detachHoverPreviewListeners();
    },
    methods: {
      handleUpdateSectionSelection(selection) {
        this.$emit("update-section-selection", selection);
      },
      emitMultiSelectIds(values) {
        const newIds = values.filter((value) => typeof value === "number");
        const currentIds = this.selectedSections.map((section) => section.id);
        const idSet = new Set(currentIds);
        const unchanged = newIds.length === currentIds.length && newIds.every((id) => idSet.has(id));
        if (unchanged) {
          return;
        }
        this.$emit("update-multi-select-sections", newIds);
      },
      jumpToSelectedSection() {
        if (!this.canJumpToSelectedSection) {
          return;
        }
        if (this.selectedSection === null || this.selectedSection === "all" || Array.isArray(this.selectedSection)) {
          return;
        }
        scrollToSection(this.selectedSection);
      },
      renderSectionOverlay(sectionId, type) {
        this.overlayType = type;
        showSectionOverlay(sectionId, type);
      },
      clearSectionHighlight() {
        hideSectionOverlay();
      },
      attachHoverPreviewListeners() {
        if (!spiHelperSettings.highlightSection) {
          return;
        }
        const element = this.multiSelectMode ? this.multiselectLookupElement : this.sectionSelectElement;
        if (!element) {
          return;
        }
        this.hoverPreviewTarget = element;
        this.hoverPreviewMenuItems = this.multiSelectMode ? this.multiSelectMenuItems : this.menuItems;
        this.menuPointerOverHandler = (event) => {
          this.handlePreviewEvent(event);
        };
        this.menuPointerLeaveHandler = () => {
          if (this.overlayType === "preview") {
            this.clearSectionHighlight();
          }
        };
        this.menuFocusInHandler = (event) => {
          this.handlePreviewEvent(event);
        };
        element.addEventListener("pointerover", this.menuPointerOverHandler);
        element.addEventListener("pointerleave", this.menuPointerLeaveHandler);
        element.addEventListener("focusin", this.menuFocusInHandler);
      },
      detachHoverPreviewListeners() {
        if (this.menuPointerOverHandler) {
          this.hoverPreviewTarget?.removeEventListener("pointerover", this.menuPointerOverHandler);
        }
        if (this.menuPointerLeaveHandler) {
          this.hoverPreviewTarget?.removeEventListener("pointerleave", this.menuPointerLeaveHandler);
        }
        if (this.menuFocusInHandler) {
          this.hoverPreviewTarget?.removeEventListener("focusin", this.menuFocusInHandler);
        }
        this.menuPointerOverHandler = null;
        this.menuPointerLeaveHandler = null;
        this.menuFocusInHandler = null;
        this.hoverPreviewTarget = null;
        this.hoverPreviewMenuItems = [];
        this.clearSectionHighlight();
      },
      handlePreviewEvent(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        const menuItem = target.closest(".cdx-menu-item");
        if (!menuItem) {
          return;
        }
        const sectionId = getSectionIdByMenuItem(menuItem, this.hoverPreviewMenuItems);
        if (sectionId === null) {
          this.activeSectionId = null;
          this.clearSectionHighlight();
          return;
        }
        if (sectionId !== this.activeSectionId) {
          this.renderSectionOverlay(sectionId, "preview");
        }
      }
    },
    template: `
    <!-- Sections special case -->
    <div class="spiHelper-section-selector">
      <div class="spiHelper-section-input" :class="{ 'spiHelper-section-input--multi': multiSelectMode }">
        <cdx-select v-if="!multiSelectMode" :menu-items="menuItems" :selected="selectedSection"
                    @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
        <cdx-multiselect-lookup v-else class="spiHelper-multi-select-lookup" ref="multiselectLookup"
            v-model:input-chips="multiSelectChips" v-model:selected="multiSelectSelected"
            :menu-items="multiSelectMenuItems" :keep-input-on-selection="true" />
      </div>
      <cdx-button weight="normal" :disabled="multiSelectMode || !canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
      <cdx-toggle-switch v-if="allSections.length > 1"
                         :model-value="multiSelectMode" @update:model-value="$emit('update:multiSelectMode', $event)">
        Multi-action
      </cdx-toggle-switch>
    </div>
  `
  });
  // src/ui/views/expiryInput.ts
  var ExpiryInputComponent = defineComponent({
    inheritAttrs: false,
    props: {
      modelValue: { type: String, required: false, default: "" },
      label: { type: String, required: false, default: "" },
      touched: { type: Boolean, default: false },
      shortened: { type: Boolean, default: false },
      autoDismiss: { type: Boolean, default: false },
      disabled: { type: Boolean, default: false }
    },
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
        if (this.disabled || !this.internalTouched)
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
    beforeUnmount() {
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }
    },
    template: `
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" :disabled="disabled" v-bind="$attrs" />
    </cdx-field>
  `
  });
  // src/ui/views/pageLookup.ts
  var ITEM_LIMIT2 = 10;
  var SEARCH_DEBOUNCE_MS2 = 250;
  var PageLookupComponent = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      placeholder: { type: String, default: "Page" },
      label: { type: String, default: null },
      description: { type: String, default: null },
      namespace: { type: Number, required: true },
      prefix: { type: String, default: "" },
      validateMessage: { type: Boolean, default: true }
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
        searchController: null,
        selection: null,
        menuConfig
      };
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
    },
    beforeUnmount() {
      this.cancelPendingSearch();
    },
    methods: {
      cancelPendingSearch() {
        this.searchController?.abort();
        this.searchController = null;
      },
      startSearch() {
        this.cancelPendingSearch();
        const controller = new AbortController;
        this.searchController = controller;
        return controller.signal;
      },
      async onUpdateInputValue(value) {
        this.menuConfig.searchQuery = value;
        const signal = this.startSearch();
        if (!value) {
          this.pageSuggestions = [];
          return;
        }
        const query = `${this.prefix}${value}`;
        await abortableDelay(SEARCH_DEBOUNCE_MS2, signal);
        if (isAborted(signal)) {
          return;
        }
        const pages = await spiHelperGetPages({
          from: query,
          namespace: this.namespace,
          limit: ITEM_LIMIT2,
          signal
        });
        if (isAborted(signal)) {
          return;
        }
        this.pageSuggestions = this.toMenuItems(pages ?? []);
      },
      onFocus() {
        if (this.pageSuggestions.length === 0) {
          this.onLoadMore();
        }
      },
      async onLoadMore() {
        if (!this.pagename) {
          return;
        }
        const signal = this.startSearch();
        const pages = await spiHelperGetPages({
          from: this.fullPagename,
          namespace: this.namespace,
          limit: this.pageSuggestions.length + ITEM_LIMIT2,
          signal
        });
        if (isAborted(signal) || !pages?.length) {
          return;
        }
        this.pageSuggestions = this.toMenuItems(pages);
      },
      async validateInstantly() {
        await this.$nextTick();
        if (this.pagename.length === 0) {
          this.lookupStatus = "default";
          return;
        }
        const selection = this.pageSuggestions.find((item) => item.label === this.pagename) ?? null;
        if (selection !== null) {
          this.selection = selection.value;
        }
        this.lookupStatus = this.selection === null ? "warning" : "success";
      },
      onSelection(newSelection) {
        if (newSelection !== null) {
          this.lookupStatus = "success";
        }
      },
      toMenuItems(pages) {
        return pages.filter((page) => !page.title.includes("/Archive")).map((page) => ({
          label: this.stripTitle(page.title),
          value: page.pageid.toString()
        }));
      },
      stripTitle(fullTitle) {
        if (this.prefix) {
          return fullTitle.split(this.prefix)[1] ?? fullTitle;
        }
        if (this.namespace === 0) {
          return fullTitle;
        }
        return fullTitle.split(":")[1] ?? fullTitle;
      }
    },
    template: `
    <cdx-field :status="lookupStatus" :messages="validateMessage ? messages : {}" :hide-label="!label">
      <template v-if="label" #label>
        {{ label }}
      </template>
      <template v-if="description" #description>
        {{ description }}
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
          @focus="onFocus"
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
  `
  });
  // src/ui/views/submitForm.ts
  var SubmitFormComponent = defineComponent({
    props: {
      lockComment: { type: String, required: true },
      skipCUVerifyUsers: { type: Set, required: true },
      actionName: { type: String, required: true },
      checkConflict: { type: Boolean, required: true },
      state: { type: Object, required: true },
      accounts: { type: Array, required: true },
      caseActions: { type: Object, required: true },
      allDisabled: { type: Boolean, required: true }
    },
    emits: ["update:lockComment", "update:skipCUVerifyUsers", "onSubmit"],
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
        cdxIconUpdate: tc
      };
    },
    computed: {
      effectiveStatus() {
        const status = this.caseActions.status;
        if (!status) {
          return "";
        }
        const { enabled, data } = status;
        return resolveEffectiveStatus({ enabled, old: data.old, new: data.new });
      },
      globalRequestTargets() {
        const blockAction = this.caseActions.block;
        if (!blockAction.enabled) {
          return [];
        }
        return this.accounts.filter((sock) => sock.block.lock && (isNonRegisteredAccount(sock.username) ? blockAction.data.userGlobalBlocks.get(sock.username) !== true : blockAction.data.userLocks.get(sock.username) !== true));
      },
      needsLockComment() {
        return this.globalRequestTargets.length > 0;
      },
      hasInvalidTag() {
        const blockAction = this.caseActions.block;
        if (!blockAction.enabled) {
          return false;
        }
        return this.accounts.some((user) => user.block.tags.some((tag2) => isSockpuppetTag(tag2) && !tag2.master));
      },
      hasInvalidMove() {
        const moveAction = this.caseActions.move;
        return moveAction?.enabled === true && !moveAction.data.target;
      },
      hasInvalidDuration() {
        const blockAction = this.caseActions.block;
        if (!blockAction.enabled)
          return false;
        const { options, userBlocks, userLocks, userGlobalBlocks } = blockAction.data;
        return this.accounts.some((user) => !isInputDisabled(user, "duration", options, userBlocks, userLocks, userGlobalBlocks, this.accounts) && parseExpiry(user.block.duration) === null);
      },
      commentClaims() {
        const comment = this.caseActions.comment;
        if (!comment?.enabled || this.state.selectedSection?.type !== "single") {
          return [];
        }
        const blockAction = this.caseActions.block;
        return findCommentClaims(comment.data.text, {
          effectiveStatus: this.effectiveStatus,
          blockPlanned: blockAction.enabled && this.accounts.some((user) => user.block.block),
          globalRequestPlanned: this.globalRequestTargets.length > 0
        });
      },
      lenientOverrides() {
        const blockAction = this.caseActions.block;
        const { options, userBlocks } = blockAction.data;
        if (!blockAction.enabled || !options.override || options.noBlock) {
          return [];
        }
        const now = new Date;
        return this.accounts.flatMap((user) => {
          const existing = userBlocks.get(user.username);
          if (!user.block.block || !existing) {
            return [];
          }
          const reasons = findBlockLeniency({
            username: user.username,
            existing,
            intended: user.block,
            now
          });
          return reasons.length > 0 ? [{ username: user.username, reasons }] : [];
        });
      },
      cuBlockConfirmationsNeeded() {
        const blockData = this.caseActions.block.data;
        const neededUsers = new Set;
        if (spiHelperIsCheckuser() || !this.caseActions.block.enabled || !blockData.options.override || !blockData.options.noBlock) {
          return neededUsers;
        }
        for (const userRow of this.accounts) {
          if (!userRow.block.block) {
            continue;
          }
          const blockReason = blockData.userBlocks.get(userRow.username)?.reason;
          if (blockReason && spiHelperCUBlockRegex.exec(blockReason)) {
            neededUsers.add(userRow.username);
          }
        }
        return neededUsers;
      },
      cuBlockOverrideChecked: {
        get() {
          return this.skipCUVerifyUsers.size === this.cuBlockConfirmationsNeeded.size;
        },
        set(newValue) {
          this.$emit("update:skipCUVerifyUsers", newValue ? this.cuBlockConfirmationsNeeded : new Set);
        }
      },
      cuBlockOverrideIndeterminate() {
        const skipCount = this.skipCUVerifyUsers.size;
        return skipCount > 0 && skipCount < this.cuBlockConfirmationsNeeded.size;
      },
      disableButton() {
        return isOpRunning(this.actionName) || this.allDisabled || this.hasInvalidTag || this.hasInvalidMove || this.hasInvalidDuration;
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
    mounted() {
      this.submitElement = this.$refs.submitElement;
    },
    methods: {
      async onSubmit() {
        if (this.disableButton) {
          return;
        }
        if (this.checkConflict) {
          this.popover.revId = await spiHelperGetPageRev(context.pageName);
          if (this.popover.revId === context.startingRevId) {
            this.$emit("onSubmit");
          } else {
            this.popover.show = true;
          }
        } else {
          this.$emit("onSubmit");
        }
      },
      confirmSubmit() {
        this.popover.show = false;
        context.startingRevId = this.popover.revId;
        this.state.selectedSection?.type === "single" ? loadSectionText(this.state.selectedSection.section, { purge: true }) : loadCaseText(this.state, { purge: true });
        this.$emit("onSubmit");
      }
    },
    template: `
    <div class="spiHelper-submitForm">
      <cdx-field v-if="needsLockComment">
        <template #label>Global request comment</template>
        <template #description>Optional comment to include in the global lock/block request</template>
        <cdx-text-area v-model="lockCommentValue" placeholder="Comment" :autosize="true" />
      </cdx-field>
      <cdx-checkbox v-if="cuBlockConfirmationsNeeded.size > 0"
                    v-model="cuBlockOverrideChecked" :indeterminate="cuBlockOverrideIndeterminate">
        Confirm CU-block overriding
        <template #description>You are currently set to override the following CU blocks:
          {{ [...cuBlockConfirmationsNeeded].join(', ') }}
        </template>
      </cdx-checkbox>
      <div>
        <cdx-message v-if="hasInvalidTag" type="error" :inline="true">A user has an invalid tag</cdx-message>
        <cdx-message v-if="hasInvalidMove" type="error" :inline="true"><b>Move</b> is enabled but has no target</cdx-message>
        <cdx-message v-if="hasInvalidDuration" type="error" :inline="true">A user has an invalid block duration</cdx-message>
        <cdx-message v-for="claim in commentClaims" :key="claim.quoted + claim.reason"
                     type="warning" :inline="true">
          The comment includes {{ claim.quoted }}, but {{ claim.reason }}
        </cdx-message>
        <cdx-message v-for="override in lenientOverrides" :key="override.username"
                     type="warning" :inline="true">
          Overriding <b>{{ override.username }}</b>'s existing block with a more lenient one:
          {{ override.reasons.join(', ') }}
        </cdx-message>
        <cdx-button ref="submitElement" action="progressive" weight="primary" @click="onSubmit"
                    :disabled="disableButton">
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
    </div>
  `
  });
  // src/ui/views/tagPopover.ts
  function toStatusButtons(statuses) {
    return Object.entries(statuses).map(([value, { label, icon }]) => ({ value, label, icon }));
  }
  var TagPopoverComponent = defineComponent({
    props: {
      open: { type: Boolean, required: true },
      anchor: {
        type: Object,
        required: false,
        default: null
      },
      clipboardTag: { type: [Object, null], required: true },
      defaultMaster: { type: String, required: true }
    },
    emits: {
      "update:open": (_) => true,
      saveTag: (_) => true,
      addTag: (_) => true,
      copyTag: (_) => true,
      deleteTag: () => true
    },
    data() {
      const sockTags = toStatusButtons(SockpuppetTagStatuses);
      const masterTags = toStatusButtons(SockmasterTagStatuses);
      const altmasterTags = toStatusButtons(AltmasterTagStatuses);
      const allTagSelections = {
        tag: "none",
        altmaster: "none"
      };
      const tagCategoryButtons = [
        { value: "sock", label: "Sockpuppet", icon: dc },
        { value: "master", label: "Sockmaster", icon: vc }
      ];
      const temporaryTag = null;
      const originalTag = null;
      const icons = {
        cdxIconAdd: z5,
        cdxIconCopy: s6,
        cdxIconPaste: S8,
        cdxIconTrash: Q9
      };
      return {
        sockTags,
        masterTags,
        altmasterTags,
        allTagSelections,
        tagCategoryButtons,
        temporaryTag,
        originalTag,
        icons
      };
    },
    computed: {
      openValue: {
        get() {
          return this.open;
        },
        set(newValue) {
          this.$emit("update:open", newValue);
        }
      },
      tagCategory: {
        get() {
          if (this.temporaryTag === null) {
            return null;
          }
          return isSockpuppetTag(this.temporaryTag) ? "sock" : "master";
        },
        set(newValue) {
          if (newValue === "sock") {
            this.temporaryTag = new SockpuppetTag({
              status: "blocked",
              master: this.defaultMaster,
              evidence: this.temporaryTag?.evidence
            });
          } else {
            this.temporaryTag = new SockmasterTag({
              status: "blocked",
              evidence: this.temporaryTag?.evidence
            });
          }
        }
      }
    },
    methods: {
      setTag(newTag) {
        this.originalTag = newTag ? newTag.clone() : null;
        this.temporaryTag = newTag ? newTag.clone() : null;
      },
      normaliseMasters(tag2) {
        if (isSockpuppetTag(tag2)) {
          tag2.master = spiHelperNormalizeUsername(tag2.master);
          tag2.altmaster = spiHelperNormalizeUsername(tag2.altmaster);
        }
        return tag2;
      },
      handleSave() {
        if (this.temporaryTag === null) {
          console.error("No tag to save");
          return;
        }
        this.$emit("saveTag", this.normaliseMasters(this.temporaryTag));
        this.openValue = false;
      },
      handleCancel() {
        this.temporaryTag = this.originalTag ? this.originalTag.clone() : null;
        this.openValue = false;
      },
      handleDeleteTag() {
        this.$emit("deleteTag");
        this.openValue = false;
      },
      handleCopyTag() {
        if (!this.temporaryTag) {
          return;
        }
        this.$emit("copyTag", this.temporaryTag.clone());
      },
      handlePasteTag() {
        if (!this.clipboardTag) {
          return;
        }
        this.temporaryTag = this.clipboardTag.clone();
      },
      handleAddTag() {
        this.$emit("addTag", this.temporaryTag && this.normaliseMasters(this.temporaryTag));
      }
    },
    template: `
    <cdx-popover v-if="anchor" :anchor="anchor" v-model:open="openValue"
                 title="Edit Tag" class="edit-tag-popover">
      <cdx-toggle-button-group :buttons="tagCategoryButtons" v-model="tagCategory" class="tag-category" />
      <div v-if="tagCategory === 'sock'" class="edit-body">
        <cdx-toggle-button-group :buttons="sockTags" v-model="temporaryTag.status" />
        <user-lookup label="Master" v-model="temporaryTag.master" :allow-empty="false" />
        <user-lookup label="Alternate Master" v-model="temporaryTag.altmaster" />
        <cdx-toggle-button-group v-show="temporaryTag.altmaster" :buttons="altmasterTags"
                                 v-model="temporaryTag.altmasterStatus" />
        <cdx-accordion separation="minimal">
          <template #title>
            Extras
          </template>
          <cdx-field>
            <template #label>Evidence</template>
            <cdx-text-input v-model="temporaryTag.evidence" />
          </cdx-field>
        </cdx-accordion>
      </div>
      <div v-else-if="tagCategory === 'master'" class="edit-body">
        <cdx-toggle-button-group :buttons="masterTags" v-model="temporaryTag.status" />
        <cdx-accordion separation="minimal">
          <template #title>
            Extras
          </template>
          <cdx-field>
            <template #label>Evidence</template>
            <cdx-text-input v-model="temporaryTag.evidence" />
          </cdx-field>
          <page-lookup v-model="temporaryTag.spipage" :namespace="4" prefix="Sockpuppet investigations/"
                       label="SPI Page" />
          <page-lookup v-model="temporaryTag.ltapage" :namespace="4" prefix="Long-term abuse/" label="LTA Page" />
        </cdx-accordion>
      </div>
      <template #footer>
        <div class="footer-sideactions">
            <cdx-button action="destructive" @click="handleDeleteTag" aria-label="Delete tag" title="Delete tag">
              <cdx-icon :icon="icons.cdxIconTrash" />
            </cdx-button>
            <cdx-button @click="handleAddTag" aria-label="Add tag" title="Add tag">
              <cdx-icon :icon="icons.cdxIconAdd" />
            </cdx-button>
            <cdx-button @click="handleCopyTag" aria-label="Copy tag" title="Copy tag">
              <cdx-icon :icon="icons.cdxIconCopy" />
            </cdx-button>
            <cdx-button @click="handlePasteTag" aria-label="Paste tag" title="Paste tag">
              <cdx-icon :icon="icons.cdxIconPaste" />
            </cdx-button>
        </div>
        <div class="cdx-popover__footer__actions">
          <cdx-button
              class="cdx-popover__footer__primary-action"
              weight="primary"
              action="progressive"
              @click="handleSave"
          >
            Save
          </cdx-button>
          <cdx-button
              class="cdx-popover__footer__default-action"
              @click="handleCancel"
          >
            Cancel
          </cdx-button>
        </div>
      </template>
    </cdx-popover>
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
        activateHandler: null,
        open: false,
        archiving: false,
        messages
      };
    },
    mounted() {
      this.activateHandler = () => {
        messages.length = 0;
        this.open = true;
        this.archiving = true;
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "submit", type: "oca" });
        spiHelperOneClickArchive(this.state).then(() => {
          this.archiving = false;
        }, () => {});
      };
      this.activateButton.addEventListener("click", this.activateHandler);
    },
    beforeUnmount() {
      if (this.activateHandler) {
        this.activateButton.removeEventListener("click", this.activateHandler);
      }
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
  `
  });
  // src/ui/views/alternateView.ts
  var SPI_CASE_REGEX = /\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i;
  var AlternateViewComponent = defineComponent({
    props: {
      state: { type: Object, required: true },
      feedbackDialog: { type: Object, required: true },
      openButton: { type: Object, required: true },
      defaultCase: { type: String, required: false, default: "" },
      view: { type: String, required: true }
    },
    data() {
      return {
        open: false,
        openHandler: null,
        beforeUnloadHandler: null,
        caseLoaded: false,
        caseLoading: false,
        accountsLoading: false,
        targetCase: this.defaultCase,
        blockData: setupBlockActionData(),
        accounts: [],
        actionsRunning: false,
        unpinned: !spiHelperSettings.interface.pinned,
        messages,
        cdxIconFeedback: k6,
        cdxIconPushPin: W8
      };
    },
    computed: {
      mountPoint() {
        return this.$el.parentElement;
      },
      pageName() {
        return `Wikipedia:Sockpuppet investigations/${this.targetCase}`;
      },
      caseActions() {
        return {
          block: {
            enabled: true,
            data: this.blockData
          }
        };
      }
    },
    watch: {
      unpinned(newVal) {
        if (!this.mountPoint) {
          console.error("AlternateView unpinned: Could not find mountPoint");
          return;
        }
        if (newVal) {
          this.mountPoint.classList.add("unpinned");
        } else {
          this.mountPoint.classList.remove("unpinned");
        }
        spiHelperSettings.interface.pinned = !newVal;
      }
    },
    mounted() {
      if (!this.mountPoint) {
        console.error("AlternateViewComponent mounted: Could not find mountPoint");
        return;
      }
      if (this.unpinned) {
        this.mountPoint.classList.add("unpinned");
      } else {
        this.mountPoint.classList.remove("unpinned");
      }
      this.beforeUnloadHandler = (e) => {
        const opState = getOpState("alternateActions");
        if (opState !== "success" /* Success */) {
          e.preventDefault();
        }
      };
      this.openHandler = () => {
        this.open = !this.open;
        if (this.open) {
          mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "open", type: "alternate" });
          if (!this.caseLoaded) {
            switch (this.view) {
              case "category":
                this.initialiseCategoryView();
                break;
              case "checkuser":
                this.initialiseCheckUserView();
                break;
              case "si":
                this.initialiseSIView();
                break;
            }
          }
        }
        if (this.beforeUnloadHandler) {
          if (this.open) {
            window.addEventListener("beforeunload", this.beforeUnloadHandler);
          } else {
            window.removeEventListener("beforeunload", this.beforeUnloadHandler);
          }
        }
      };
      this.openButton.addEventListener("click", this.openHandler);
    },
    beforeUnmount() {
      if (this.openHandler) {
        this.openButton.removeEventListener("click", this.openHandler);
      }
      if (this.beforeUnloadHandler) {
        window.removeEventListener("beforeunload", this.beforeUnloadHandler);
      }
    },
    methods: {
      dismissMessage,
      handleUserSelected(data, rowId) {
        const userRow = this.accounts.find((r) => r.id === rowId);
        if (!userRow) {
          return;
        }
        if (data.blockid !== undefined && !this.blockData.userBlocks.has(userRow.username)) {
          const ABAO = mw.util.isIPAddress(data.name) ? data.blockanononly : data.blockautoblocking;
          this.blockData.userBlocks.set(userRow.username, {
            username: userRow.username,
            duration: data.blockexpiry ?? "",
            abao: ABAO ?? false,
            acb: data.blocknocreate ?? false,
            ntp: data.blockowntalk ?? false,
            nem: data.blockemail ?? false,
            reason: ""
          });
        }
        UpdateUserAllUserData(data, userRow);
      },
      handleAddRow(row) {
        row ??= getDefaultUserRow(this.state.archiveNotice);
        this.accounts.push(row);
      },
      handleRemoveRows(rowIds) {
        this.accounts = this.accounts.filter((row) => !rowIds.includes(row.id));
      },
      async handleFetchRows() {
        let clipboardText;
        try {
          clipboardText = await navigator.clipboard.readText();
        } catch (err) {
          console.error("handleFetchRows failed to read clipboard:", err);
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            new VueMessage({ type: "warning", content: "Failed to read clipboard. You may need to press 'paste' in the confirmation popup" }).show();
          }
          return;
        }
        const [likelySocks, possibleSocks] = getSockEntries({
          text: clipboardText,
          fullSearch: false,
          state: this.state
        });
        const likelyUsers = new Set(likelySocks.map((sock) => sock.username));
        const newRows = [...likelySocks, ...possibleSocks].map((sock) => updateUserBlockDataSettings({
          userRow: sock,
          defaultBlock: likelyUsers.has(sock.username)
        }));
        const added = new Set(this.massAddUserRows(newRows).map((row) => row.username));
        await ensureUsersFetched(added, this.blockData.fetchedUsers);
        applyFetchedUsers({
          accounts: this.accounts,
          usernames: added,
          blockData: this.blockData,
          state: this.state
        });
      },
      massAddUserRows(newRows) {
        const existingUsernames = new Set(this.accounts.map((s) => s.username));
        const filteredRows = newRows.filter((newRow) => !existingUsernames.has(newRow.username));
        filteredRows.forEach((newRow) => {
          this.handleAddRow(newRow);
        });
        return filteredRows;
      },
      async loadCase(addRow) {
        this.caseLoading = true;
        try {
          setContext(this.pageName, "alternate");
          if (this.targetCase) {
            const [archiveNoticeResult] = await Promise.all([
              spiHelperParseArchiveNotice({ page: this.pageName, state: this.state }),
              ensureUsersFetched(addRow ? new Set([this.targetCase]) : new Set, this.blockData.fetchedUsers)
            ]);
            context.valid = archiveNoticeResult !== null;
            if (archiveNoticeResult === null) {
              this.state.archiveNotice = new ParsedArchiveNotice({ username: this.targetCase });
            } else {
              this.state.archiveNotice = archiveNoticeResult;
            }
            if (addRow) {
              const [userRow] = await prefetchSockRows({
                likelySocks: [generateUserRow(this.targetCase, this.state)],
                possibleSocks: [],
                blockData: this.blockData,
                state: this.state
              });
              if (userRow) {
                const oldIndex = this.accounts.findIndex((user) => user.username === userRow.username);
                if (oldIndex === -1) {
                  this.accounts.splice(0, 0, userRow);
                } else {
                  this.accounts.splice(oldIndex, 1, userRow);
                }
              }
            }
          } else {
            context.valid = false;
          }
          this.blockData.master = spiHelperNormalizeUsername(this.targetCase);
          this.caseLoaded = true;
        } finally {
          this.caseLoading = false;
        }
      },
      async onSubmitActions() {
        if (isOpRunning("alternateActions")) {
          return;
        }
        mw.track("stats.mediawiki_gadget_spihelper_total", 1, { action: "submit", type: "alternate" });
        startOp("alternateActions");
        this.actionsRunning = true;
        try {
          const {
            blockPromises,
            tagPromises,
            talkNoticePromises,
            globalRequestPromise
          } = await spiHelperHandleBlocks({
            accounts: this.accounts,
            blockData: this.blockData
          });
          const userActionsPromise = Promise.all([
            Promise.all(blockPromises),
            Promise.all(tagPromises),
            globalRequestPromise
          ]);
          const talkNoticePromise = Promise.all(talkNoticePromises);
          const [blockedUsers, taggedUsers, globalRequests] = await userActionsPromise;
          await talkNoticePromise;
          if (spiHelperSettings.log.enabled) {
            const logMessage = `* [[:User:${context.userName}]]` + buildUserActionLogMessage({
              blockedUsers,
              taggedUsers,
              lockedUsers: globalRequests.lockedUsers,
              globalBlockedUsers: globalRequests.globalBlockedUsers
            });
            await spiHelperLog(logMessage);
          }
          new VueMessage({ type: "success", content: "Done!" }).show();
          finishOp("alternateActions", "success" /* Success */);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          new VueMessage({
            type: "error",
            content: `Actions stopped: ${message}. Reload and try again. If the issue persists, file a bug report`
          }).show();
          finishOp("alternateActions", "failed" /* Failed */);
        } finally {
          this.blockData.fetchedUsers.clear();
          this.actionsRunning = false;
        }
      },
      async initialiseCategoryView() {
        if (this.defaultCase === "" || this.caseLoading || this.caseLoaded) {
          return;
        }
        const [, suspectedMembers, confirmedMembers] = await Promise.all([
          this.loadCase(false),
          spiHelperGetCategoryMembers(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),
          spiHelperGetCategoryMembers(`Category:Wikipedia sockpuppets of ${this.targetCase}`)
        ]);
        const BuildUserRow = (member, likely) => {
          const userRow = { ...generateUserRow(member.replace("User:", ""), this.state) };
          userRow.block.block = likely;
          return userRow;
        };
        const likelySocks = [...confirmedMembers, `User:${this.targetCase}`].map((member) => BuildUserRow(member, true));
        const possibleSocks = suspectedMembers.map((member) => BuildUserRow(member, false));
        this.accountsLoading = true;
        try {
          const allRows = await prefetchSockRows({
            likelySocks,
            possibleSocks,
            blockData: this.blockData,
            state: this.state
          });
          this.massAddUserRows(allRows);
        } finally {
          this.accountsLoading = false;
        }
      },
      async initialiseCheckUserView() {
        const $reasonSearchOrigin = $("form#checkuserform", document);
        const searchReason = $("#checkreason input", $reasonSearchOrigin).val();
        if (typeof searchReason === "string") {
          const caseName = SPI_CASE_REGEX.exec(searchReason)?.[1];
          if (caseName) {
            this.targetCase = caseName;
            return;
          }
        }
        const searchTarget = $("#checktarget input", $reasonSearchOrigin).val();
        if (typeof searchTarget === "string") {
          if (!mw.util.isIPAddress(searchTarget, true)) {
            this.targetCase = searchTarget;
          }
        }
        const $userSearchOrigin = $("table.mw-checkuser-helper-table", document);
        const sockList = $userSearchOrigin.find("td > a.mw-userlink > bdi");
        await this.populateUserRows(sockList);
      },
      async initialiseSIView() {
        const $searchOrigin = $("ul.mw-checkuser-suggestedinvestigations-users", document);
        const sockList = $searchOrigin.find("li > a.mw-userlink > bdi");
        await this.populateUserRows(sockList);
      },
      async populateUserRows(sockElementList) {
        const allSocks = [];
        const allUsernames = new Set;
        for (const entryElement of sockElementList) {
          const username = spiHelperNormalizeUsername($(entryElement).text());
          if (allUsernames.has(username)) {
            continue;
          }
          allSocks.push(generateUserRow(username, this.state));
          allUsernames.add(username);
        }
        if (allSocks.length > 0 && allSocks[0]) {
          this.targetCase = allSocks[0].username;
        }
        this.accountsLoading = true;
        try {
          const allRows = await prefetchSockRows({
            likelySocks: allSocks,
            possibleSocks: [],
            blockData: this.blockData,
            state: this.state
          });
          this.massAddUserRows(allRows);
        } finally {
          this.accountsLoading = false;
        }
      },
      launchFeedback() {
        const viewPretty = this.view.charAt(0).toUpperCase() + this.view.slice(1);
        this.feedbackDialog.launch({
          subject: `Feedback from ${mw.config.get("wgUserName")}`,
          message: `${viewPretty} form v${VERSION}-${MODE}`
        });
      }
    },
    template: `
    <div id="spiHelper-alternateView" class="spiHelper-mainCard" v-if="open" @keydown.ctrl.enter.capture.prevent="$refs.submitForm?.onSubmit?.()">
      <div id="spiHelper-alternateView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="launchFeedback">
            <cdx-icon :icon="cdxIconFeedback" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-CaseLoader">
        <page-lookup v-model="targetCase"
                     :namespace="4" prefix="Sockpuppet investigations/"
                     placeholder="Case" label="Case title" description="Optional but recommended" />
        <div style="display: flex; gap: 10px;">
          <cdx-button weight="primary" action="progressive" :disabled="caseLoading"
                      @click="loadCase(true)">Load</cdx-button>
          <cdx-progress-indicator v-if="caseLoading">Loading case</cdx-progress-indicator>
          <cdx-progress-indicator v-else-if="accountsLoading">Loading accounts</cdx-progress-indicator>
        </div>
      </div>
      <div id="spiHelper-alternateView-Content" v-if="caseLoaded">
        <div>
          <h4>Link</h4>
          <link-action :enabled="true" :case-name="targetCase"
                       :accounts="accounts"
                       @user-selected="handleUserSelected"
                       @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
        <div>
          <h4>Block</h4>
          <block-action :enabled="true" fetch-type="clipboard"
                        :accounts="accounts" v-model:block-options="blockData.options"
                        :user-locks="blockData.userLocks"
                        :user-global-blocks="blockData.userGlobalBlocks"
                        :user-blocks="blockData.userBlocks"
                        :default-master="blockData.master"
                        @user-selected="handleUserSelected" @fetch-rows="handleFetchRows"
                        @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
      </div>
      <div v-if="caseLoaded">
        <submit-form :accounts="accounts"
                     v-model:lock-comment="blockData.lockcomment" v-model:skipCUVerifyUsers="blockData.skipCUVerifyUsers"
                     :case-actions="caseActions" :state="state"
                     :all-disabled="false" :action-name="'alternateActions'" :check-conflict="false"
                     @on-submit="onSubmitActions" ref="submitForm" />
      </div>
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div class="spiHelper-messageRow">
        <cdx-message v-for="message in messages" :key="message.id" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true" @user-dismissed="dismissMessage(message.id)">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `
  });
  // src/ui/views/changelogView.ts
  var ChangelogViewComponent = defineComponent({
    props: {
      unseenChanges: { type: Array, required: true },
      openState: { type: Object, required: true }
    },
    data() {
      return {
        beta: MODE !== "production"
      };
    },
    methods: {
      onClose() {
        this.openState.isOpen = false;
        this.$emit("dismissed");
      },
      resolveDate(date) {
        if (typeof date === "string")
          return date;
        return this.beta ? date.beta : date.stable;
      }
    },
    template: `
    <cdx-dialog
        v-model:open="openState.isOpen"
        title="What's new"
        @update:open="onClose"
    >
      <div v-for="[version, entry] in unseenChanges" :key="version">
        <h3 style="display: inline;">{{ version }}</h3> · {{ resolveDate(entry.date) }}
        <ul>
          <li v-for="change in entry.changes" :key="change">{{ change }}</li>
        </ul>
      </div>

      <p style="margin-top: 12px;"><a href="//en.wikipedia.org/wiki/User:DatGuy/spihelper/changelog.json">See all change history</a></p>
      
      <cdx-message v-if="beta" style="padding: 12px; margin-top: 24px">
        <p><strong>Beta Reminder</strong></p>
        <p>You are running a beta version.</p>
        <p>It is recommended to double-check your edits, especially ones that are impacted by a recent change.</p>
      </cdx-message>

      <template #footer>
        <cdx-button action="progressive" @click="onClose">Got it</cdx-button>
      </template>
    </cdx-dialog>`
  });
  // src/changelog.ts
  async function getChangelog() {
    const api2 = spiHelperGetEnwikiAPI();
    const request = {
      action: "query",
      prop: "revisions",
      rvprop: "content",
      rvslots: "main",
      pageids: 82598459,
      formatversion: "2"
    };
    try {
      const response = await api2.get(request);
      const content = response.query.pages[0]?.revisions?.[0]?.slots.main.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.error("getChangelog fetch error:", error);
    }
    return {};
  }
  async function getUnseenChanges(lastSeenVersion) {
    const changelog = await getChangelog();
    return Object.entries(changelog).filter(([version]) => semverGt(version, lastSeenVersion)).sort(([a], [b]) => semverGt(a, b) ? -1 : 1);
  }
  function semverGt(versionA, versionB) {
    const partsA = versionA.split(".").map(Number);
    const partsB = versionB.split(".").map(Number);
    for (let i = 0;i < 3; i++) {
      if ((partsA[i] ?? 0) > (partsB[i] ?? 0))
        return true;
      if ((partsA[i] ?? 0) < (partsB[i] ?? 0))
        return false;
    }
    return false;
  }

  // src/ui/views/toastView.ts
  var ToastContainerComponent = defineComponent({
    template: `
    <cdx-toast-container />
    `
  });

  // src/spihelper.ts
  if (mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/") && !mw.config.get("wgPageName").includes("Wikipedia:Sockpuppet_investigations/SPI/")) {
    bootstrap("spi");
  } else if (mw.config.get("wgCanonicalSpecialPageName") === "CheckUser") {
    bootstrap("checkuser");
  } else if (mw.config.get("wgCanonicalSpecialPageName") === "SuggestedInvestigations" && mw.config.get("wgPageName").includes("/detail/")) {
    bootstrap("si");
  } else if (mw.config.get("wgNamespaceNumber") === 14 && ["Suspected Wikipedia sockpuppets", "Wikipedia sockpuppets"].some((cat) => mw.config.get("wgCategories").includes(cat))) {
    bootstrap("category");
  }
  function bootstrap(pageType) {
    mw.loader.using(["vue", "@wikimedia/codex", "mediawiki.api", "mediawiki.ForeignApi", "mediawiki.util", "mediawiki.user"], (require2) => {
      const Vue = require2("vue");
      const Codex = require2("@wikimedia/codex");
      setToRaw(Vue.toRaw);
      setMarkRaw(Vue.markRaw);
      setMessagesReactive(Vue.reactive);
      setTableRowIdentifier(Codex.TableRowIdentifier);
      const feedbackDialog = createLazyFeedbackDialog();
      if (false) {} else if (true) {
        importStylesheet("User:DatGuy/spihelper.dev.css");
      }
      let targetSock;
      const caseState = Vue.reactive(new CaseState);
      if (pageType === "spi") {
        const rawPageName = mw.config.get("wgPageName");
        setContext(rawPageName);
        refreshSections(caseState);
      } else if (pageType === "category") {
        targetSock = /Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get("wgPageName").replaceAll("_", " "));
        if (!targetSock?.[1]) {
          return;
        }
      }
      const loadedOptions = loadOptions();
      if (loadedOptions) {
        Object.assign(spiHelperSettings, loadedOptions);
      } else {
        (async () => {
          await migrateOptions();
          saveOptions();
        })();
      }
      mountToastContainer(Vue, Codex);
      const changelogState = Vue.reactive({ isOpen: false });
      if (spiHelperSettings.lastSeenVersion !== VERSION) {
        getUnseenChanges(spiHelperSettings.lastSeenVersion).then((unseenChanges) => {
          const mountPoint = document.createElement("div");
          mountPoint.style.position = "absolute";
          mw.util.$content.prepend(mountPoint);
          const changelogApp = Vue.createMwApp(ChangelogViewComponent, {
            unseenChanges,
            openState: changelogState,
            onDismissed: async () => {
              spiHelperSettings.lastSeenVersion = VERSION;
              await saveOptions();
              changelogApp.unmount();
              mountPoint.remove();
            }
          }).component("cdx-button", Codex.CdxButton).component("cdx-dialog", Codex.CdxDialog).component("cdx-message", Codex.CdxMessage);
          changelogApp.mount(mountPoint);
        }, () => {});
      }
      const initLink = mw.util.addPortletLink("p-cactions", "#", MODE === "production" ? "SPI" : "SPI-Beta", "ca-spiHelper", "Run spiHelper");
      if (initLink) {
        const mountPoint = document.createElement("div");
        mountPoint.setAttribute("id", "spiHelper-vue-mount-point");
        mw.util.$content.prepend(mountPoint);
        initLink.addEventListener("click", () => {
          changelogState.isOpen = true;
        });
        switch (pageType) {
          case "spi": {
            Vue.createMwApp(TopViewComponent, {
              state: caseState,
              feedbackDialog,
              openButton: initLink
            }).component("cdx-tabs", Codex.CdxTabs).component("cdx-tab", Codex.CdxTab).component("cdx-select", Codex.CdxSelect).component("cdx-card", Codex.CdxCard).component("cdx-toggle-switch", Codex.CdxToggleSwitch).component("cdx-text-area", Codex.CdxTextArea).component("cdx-toggle-button", Codex.CdxToggleButton).component("cdx-toggle-button-group", Codex.CdxToggleButtonGroup).component("cdx-button", Codex.CdxButton).component("cdx-button-group", Codex.CdxButtonGroup).component("cdx-icon", Codex.CdxIcon).component("cdx-table", Codex.CdxTable).component("cdx-text-input", Codex.CdxTextInput).component("cdx-checkbox", Codex.CdxCheckbox).component("cdx-lookup", Codex.CdxLookup).component("cdx-field", Codex.CdxField).component("cdx-message", Codex.CdxMessage).component("cdx-multiselect-lookup", Codex.CdxMultiselectLookup).component("cdx-progress-bar", Codex.CdxProgressBar).component("cdx-progress-indicator", Codex.CdxProgressIndicator).component("cdx-accordion", Codex.CdxAccordion).component("cdx-label", Codex.CdxLabel).component("cdx-popover", Codex.CdxPopover).component("action-accordion", ActionAccordionComponent).component("action-button", ActionButtonComponent).component("action-container", ActionContainerComponent).component("action-content", ActionContentComponent).component("submit-form", SubmitFormComponent).component("comment-action", CommentActionComponent).component("change-status-action", ChangeStatusActionComponent).component("multi-section-comment-action", MultiSectionCommentActionComponent).component("multi-section-status-action", MultiSectionStatusActionComponent).component("block-action", BlockActionComponent).component("link-action", LinkActionComponent).component("management-action", ManagementActionComponent).component("archive-action", ArchiveActionComponent).component("move-action", MoveActionComponent).component("section-action", SectionActionComponent).component("user-lookup", UserLookupComponent).component("page-lookup", PageLookupComponent).component("expiry-input", ExpiryInputComponent).component("tag-popover", TagPopoverComponent).directive("tooltip", Codex.CdxTooltip).mount(mountPoint);
            break;
          }
          case "checkuser":
          case "category":
          case "si": {
            Vue.createMwApp(AlternateViewComponent, {
              state: caseState,
              feedbackDialog,
              openButton: initLink,
              view: pageType,
              ...pageType === "category" ? { defaultCase: targetSock?.[1] ?? "" } : {}
            }).component("cdx-button", Codex.CdxButton).component("cdx-checkbox", Codex.CdxCheckbox).component("cdx-field", Codex.CdxField).component("cdx-icon", Codex.CdxIcon).component("cdx-label", Codex.CdxLabel).component("cdx-lookup", Codex.CdxLookup).component("cdx-message", Codex.CdxMessage).component("cdx-popover", Codex.CdxPopover).component("cdx-progress-indicator", Codex.CdxProgressIndicator).component("cdx-select", Codex.CdxSelect).component("cdx-table", Codex.CdxTable).component("cdx-text-area", Codex.CdxTextArea).component("cdx-text-input", Codex.CdxTextInput).component("cdx-toggle-button-group", Codex.CdxToggleButtonGroup).component("submit-form", SubmitFormComponent).component("block-action", BlockActionComponent).component("link-action", LinkActionComponent).component("user-lookup", UserLookupComponent).component("page-lookup", PageLookupComponent).component("expiry-input", ExpiryInputComponent).component("tag-popover", TagPopoverComponent).directive("tooltip", Codex.CdxTooltip).mount(mountPoint);
            break;
          }
        }
      }
      createSettingsLink(Vue, Codex, feedbackDialog);
      if (mw.config.get("wgCategories").includes("SPI cases awaiting archive") && spiHelperIsClerk()) {
        createOCALink(Vue, Codex, caseState);
      }
      window.addEventListener("beforeunload", (e) => {
        if (hasRunningOps()) {
          e.preventDefault();
        }
      });
    });
  }
  function createLazyFeedbackDialog() {
    let dialog = null;
    return {
      launch(contents) {
        (async () => {
          try {
            if (!dialog) {
              await mw.loader.using(["mediawiki.feedback"]);
              dialog = new mw.Feedback(getFeedbackConfig());
            }
            dialog.launch(contents);
          } catch (error) {
            mw.notify("Could not load the feedback dialog", { type: "error" });
            console.error("Error loading mediawiki.feedback:", error);
          }
        })();
      }
    };
  }
  function createSettingsLink(Vue, Codex, feedbackDialog) {
    const settingsLink = mw.util.addPortletLink("p-cactions", "#", MODE === "production" ? "SPI-Options" : "SPI-Beta-Options", "ca-spiHelperOpts", "Modify spiHelper settings");
    if (settingsLink) {
      const mountPoint = document.body.appendChild(document.createElement("div"));
      Vue.createMwApp(OptionsComponent, {
        feedbackDialog,
        openButton: settingsLink,
        toaster: Codex.useToast()
      }).component("cdx-button", Codex.CdxButton).component("cdx-dialog", Codex.CdxDialog).component("cdx-field", Codex.CdxField).component("cdx-lookup", Codex.CdxLookup).component("cdx-select", Codex.CdxSelect).component("cdx-toggle-switch", Codex.CdxToggleSwitch).component("cdx-accordion", Codex.CdxAccordion).component("cdx-text-input", Codex.CdxTextInput).component("cdx-icon", Codex.CdxIcon).component("cdx-message", Codex.CdxMessage).component("cdx-multiselect-lookup", Codex.CdxMultiselectLookup).component("watch-setting", WatchSettingComponent).component("expiry-setting", ExpirySettingComponent).component("expiry-input", ExpiryInputComponent).component("log-page-setting", LogPageSettingComponent).component("page-lookup", PageLookupComponent).mount(mountPoint);
    }
  }
  function createOCALink(Vue, Codex, caseState) {
    const oneClickArchiveLink = mw.util.addPortletLink("p-cactions", "#", MODE === "production" ? "SPI-Archive" : "SPI-Beta-Archive", "ca-spiHelperArchive", "Run one click archival");
    if (oneClickArchiveLink) {
      const mountPoint = document.body.appendChild(document.createElement("div"));
      Vue.createMwApp(OneClickArchivalComponent, {
        state: caseState,
        activateButton: oneClickArchiveLink
      }).component("cdx-dialog", Codex.CdxDialog).component("cdx-message", Codex.CdxMessage).component("cdx-progress-bar", Codex.CdxProgressBar).mount(mountPoint);
    }
  }
  function mountToastContainer(Vue, Codex) {
    const toastApp = Vue.createMwApp(ToastContainerComponent).component("cdx-toast-container", Codex.CdxToastContainer);
    const mountPoint = document.body.appendChild(document.createElement("div"));
    toastApp.mount(mountPoint);
  }
})();

// </nowiki>
