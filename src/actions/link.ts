import { spiHelperNormalizeUsername } from '../utils.ts';
import { spiHelperLinkViewURLFormats } from '../constants/linkview.ts';
import { fetchValue } from '../ui/utils.ts';

export function spiHelperGenerateLinksTable(numLinkUsers: number, $actionView: JQuery) {
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

  for (let i = 1; i <= numLinkUsers; i++) {
    let usernameValue: string;
    try {
      usernameValue = fetchValue('#spiHelper_link_username' + i, $actionView);
    }
    catch (e) {
      console.error(e);
      continue;
    }
    const username = spiHelperNormalizeUsername(usernameValue);
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
        generatedURL += URLentry.userQueryStringKey + '=' + URLentry.userQueryStringWrapper
          + encodeURIComponent(username) + URLentry.userQueryStringWrapper;
      }
      else {
        generatedURL += URLentry.userQueryStringWrapper
          + encodeURIComponent(username) + URLentry.userQueryStringWrapper;
      }
    }
    generatedURL += (URLentry.appendToQueryString === '' ? '' : '&') + URLentry.appendToQueryString;
    const $statusLine = $('<li>').appendTo($linkViewList);
    const $statusLineLink = $('<a>').appendTo($statusLine);
    $statusLineLink
      .attr('href', generatedURL)
      .attr('target', '_blank')
      .attr('rel', 'noopener noreferrer')
      .text(spiHelperLinkViewURLFormats[linkKey].name);
  }
}
