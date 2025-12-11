import {
  spiHelperEditPage,
  spiHelperGetPageText, spiHelperGetUserBlockSettings, spiHelperWikiBlockUser,
} from '../api.ts';
import { spiHelperCUBlockRegex } from '../constants/regex.ts';
import { spiHelperSettings } from '../options.ts';
import type { BlockEntry } from '../types/spi.ts';
import { spiHelperIsCheckuser } from '../role.ts';
import { spiHelperGetInterwikiPrefix, spiHelperNormalizeUsername } from '../utils.ts';
import { context } from '../context.ts';

/**
 * Given a block entry, runs the required logic and blocks the user
 *
 * @param {BlockEntry} blockEntry Block entry to run the logic for
 * @param {boolean} cuBlock Whether to use the {{checkuserblock}} template family
 * @param {boolean} cuBlockOnly Whether to use just {{checkuserblock}} without an additional summary
 * @param {boolean} overrideExisting Whether any existing blocks should be overriden
 * @param {boolean} blankTalk Whether the user's talk page should be
 * blanked before adding the block template
 * @param {string} sockmaster Username of the sockmaster
 * @return {Promise<boolean>} Whether the block succeeded
 */
export async function spiHelperBlockUser(
  blockEntry: BlockEntry, cuBlock: boolean,
  cuBlockOnly: boolean, overrideExisting: boolean,
  blankTalk: boolean, sockmaster: string,
): Promise<boolean> {
  const blockSettings = await spiHelperGetUserBlockSettings(blockEntry.username);
  const blockReason = blockSettings?.reason;
  if (
    !spiHelperIsCheckuser() && overrideExisting
    && blockReason && spiHelperCUBlockRegex.exec(blockReason)
  ) {
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
  let blockSummary = 'Abusing [[WP:SOCK|multiple accounts]]: Please see: [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]';
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
    spiHelperSettings.watch.blocked,
    spiHelperSettings.expiry.blocked);
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
    const isCheckUserBlockAccount = spiHelperIsCheckuser() && cuBlock
      && spiHelperSettings.useCheckuserblockAccount;
    if (isCheckUserBlockAccount) {
      newText += '{{checkuserblock-account|sig=~~~~';
    }
    else {
      newText += '{{subst:uw-sockblock|sig=yes';
    }
    newText += '|spi=' + context.caseName;
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
      newText, 'Adding sockpuppetry block notice per [[' + spiHelperGetInterwikiPrefix() + context.pageName + ']]', false, 'nochange');
  }

  return true;
}
