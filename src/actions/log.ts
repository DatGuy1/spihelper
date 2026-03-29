import { spiHelperSettings } from '../options';
import { spiHelperEditPage, spiHelperGetPageText } from '../api.ts';
import { getFullLogPage } from '../options/utils.ts';

/**
 * Logs SPI actions to userspace à la Twinkle's CSD/prod/etc. logs
 *
 * @param {string} logString String with the changes the user made
 */
export async function spiHelperLog(logString: string): Promise<void> {
  const now = new Date();
  const dateString = now.toLocaleString('en', { month: 'long' }) + ' '
    + now.toLocaleString('en', { year: 'numeric' });
  const dateHeader = '==\\s*' + dateString + '\\s*==';
  const dateHeaderRe = new RegExp(dateHeader, 'i');
  const dateHeaderReWithAnyDate = /==.*?==/i;

  const logPage = getFullLogPage(spiHelperSettings.log.page);
  let logPageText = await spiHelperGetPageText(logPage, false);
  if (!logPageText.match(dateHeaderRe)) {
    if (spiHelperSettings.log.reversed) {
      const firstHeaderMatch = dateHeaderReWithAnyDate.exec(logPageText);
      if (firstHeaderMatch?.index) {
        logPageText = logPageText.slice(0, firstHeaderMatch.index) + '== ' + dateString + ' ==\n' + logPageText.slice(firstHeaderMatch.index);
      }
    }
    else {
      logPageText += '\n== ' + dateString + ' ==';
    }
  }
  if (spiHelperSettings.log.reversed) {
    const firstHeaderMatch = dateHeaderReWithAnyDate.exec(logPageText);
    if (firstHeaderMatch?.index) {
      logPageText = logPageText.slice(0, firstHeaderMatch.index + firstHeaderMatch[0].length) + '\n' + logString + logPageText.slice(firstHeaderMatch.index + firstHeaderMatch[0].length);
    }
  }
  else {
    logPageText += '\n' + logString;
  }
  await spiHelperEditPage({
    title: logPage,
    newText: logPageText,
    summary: 'Logging spihelper edits',
    createonly: false,
    watch: 'nochange',
  });
}
