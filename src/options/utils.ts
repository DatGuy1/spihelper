import { spiHelperParseWikitext } from '../api.ts';

/**
 * Returns true if the date provided is a valid date for strtotime in PHP,
 * determined by using the time parser function and a parse API call
 */
export async function spiHelperValidateDate(dateInStringFormat: string) {
  // Is this really the best way to do this? It's pretty funny
  const response = await spiHelperParseWikitext('{{#time:r|' + dateInStringFormat + '}}');
  return !response.includes('Error: Invalid time.');
}

export function getFullLogPage(logPage: string): string {
  return `User:${mw.config.get('wgUserName')}/${logPage}`;
}
