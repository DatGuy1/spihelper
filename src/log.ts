import { spiHelperSettings } from './options.ts';
import { spiHelperEditPage, spiHelperGetPageText } from './api.ts';

/**
 * Logs SPI actions to userspace a la Twinkle's CSD/prod/etc. logs
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

  let logPageText = await spiHelperGetPageText('User:' + mw.config.get('wgUserName') + '/spihelper_log', false);
  if (!logPageText.match(dateHeaderRe)) {
    if (spiHelperSettings.log.reversed) {
      const firstHeaderMatch = logPageText.match(dateHeaderReWithAnyDate);
      if (firstHeaderMatch && firstHeaderMatch.index) {
        logPageText = logPageText.slice(0, firstHeaderMatch.index) + '== ' + dateString + ' ==\n' + logPageText.slice(firstHeaderMatch.index);
      }
    }
    else {
      logPageText += '\n== ' + dateString + ' ==';
    }
  }
  if (spiHelperSettings.log.reversed) {
    const firstHeaderMatch = logPageText.match(dateHeaderReWithAnyDate);
    if (firstHeaderMatch && firstHeaderMatch.index) {
      logPageText = logPageText.slice(0, firstHeaderMatch.index + firstHeaderMatch[0].length) + '\n' + logString + logPageText.slice(firstHeaderMatch.index + firstHeaderMatch[0].length);
    }
  }
  else {
    logPageText += '\n' + logString;
  }
  await spiHelperEditPage('User:' + mw.config.get('wgUserName') + '/spihelper_log', logPageText, 'Logging spihelper edits', false, 'nochange');
}
