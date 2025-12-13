import type { TagEntry } from '../types/spi.ts';
import { spiHelperSettings } from '../options.ts';
import { spiHelperEditPage, spiHelperGetGlobalUser, spiHelperGetUserBlockSettings } from '../api.ts';
import { context } from '../context.ts';

/**
 * Given a tag entry, runs the required logic and tags the user
 * @param {TagEntry} tagEntry Tag entry to run the logic for
 * @param {boolean} tagNonLocalAccounts Whether to tag accounts that don't exist locally
 * @param {string} sockmaster The username of the sockmaster to tag for
 * @param {string} altmaster The username of the alternate master to tag for
 * @return {Promise<boolean>} Whether the tag was successfully applied
 */
export async function spiHelperTagUser(
  tagEntry: TagEntry, tagNonLocalAccounts: boolean, sockmaster: string, altmaster: string,
): Promise<boolean> {
  // We currently allow TAs to be tagged, but can disable it with mw.util.isTemporaryUser if we want
  if (mw.util.isIPAddress(tagEntry.username, true)) {
    return false; // do not support tagging IPs
  }
  const userInfo = await spiHelperGetGlobalUser(tagEntry.username);
  if (!userInfo || !userInfo.existsLocally) {
    // Skip, don't tag accounts that don't exist
    const $statusLine = $('<li>').appendTo($('#spiHelper_status', document));
    $statusLine.addClass('spihelper-errortext').html('<b>The account ' + tagEntry.username + ' does not exist and so has not been tagged.</b>');
    return false;
  }
  if (!tagNonLocalAccounts && !userInfo.existsLocally) {
    // Skip as the account does not exist locally and the
    // "tag accounts that don't exist locally" setting is unchecked.
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

  const blockSettings = await spiHelperGetUserBlockSettings(tagEntry.username);
  const isNotBlocked = !userInfo.existsLocally || !blockSettings;

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
  await spiHelperEditPage('User:' + tagEntry.username, tagText, 'Adding sockpuppetry tag per [[' + context.prefixedName + ']]',
    false, spiHelperSettings.watch.tagged, spiHelperSettings.expiry.tagged);
  return true;
}
