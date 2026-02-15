import {
  spiHelperBlockUser,
  spiHelperEditPage,
} from '../api.ts';
import { spiHelperCUBlockRegex } from '../constants/regex.ts';
import { spiHelperSettings } from '../options';
import type { BlockOptions, SockRow } from '../types/spi.ts';
import { spiHelperIsCheckuser } from '../role.ts';
import { isNoExpiry, spiHelperNormalizeUsername } from '../utils.ts';
import { context } from '../context.ts';
import type { BlockEntry } from '../types/api.ts';
import { VueMessage } from '../ui/messages.ts';

function buildTalkNotice(sock: SockRow, noticeType: 'master' | 'sock', sockmaster: string, cuBlock: boolean) {
  let newText: string;
  let isSock = noticeType === 'sock';
  // Hacky workaround for when we didn't make a master tag
  if (isSock && sock.username === spiHelperNormalizeUsername(sockmaster)) {
    isSock = false;
  }
  if (isSock) {
    newText = '== Blocked as a sockpuppet ==\n';
  }
  else {
    newText = '== Blocked for sockpuppetry ==\n';
  }
  if (cuBlock) {
    newText += '{{checkuserblock-account|sig=~~~~';
  }
  else {
    newText += '{{subst:uw-sockblock|sig=yes';
  }
  newText += '|spi=' + context.caseName;
  if (isNoExpiry(sock.duration)) {
    newText += '|indef=yes';
  }
  else {
    newText += '|time=' + sock.duration;
    if (cuBlock) {
      newText += '|indef=no';
    }
  }
  if (sock.ntp) {
    newText += '|notalk=yes';
  }
  if (isSock) {
    newText += '|master=' + sockmaster;
  }
  newText += '}}';
  return newText;
}

function buildBlockSummary(
  blockOptions: BlockOptions, isIP: boolean, isIPRange: boolean, acb: boolean,
) {
  let blockSummary = `Abusing [[WP:SOCK|multiple accounts]]: Please see: [[${context.prefixedName}]]`;
  if (spiHelperIsCheckuser() && blockOptions.cuBlock) {
    const cuBlockTemplate = isIP ? '{{checkuserblock}}' : '{{checkuserblock-account}}';
    if (blockOptions.cuBlockOnly) {
      blockSummary = cuBlockTemplate;
    }
    else {
      blockSummary = cuBlockTemplate + ': ' + blockSummary;
    }
  }
  else if (isIPRange) {
    blockSummary = `{{rangeblock|1=${blockSummary}`;
    if (!acb) {
      blockSummary += '|create=yes';
    }
    blockSummary += '}}';
  }
  return blockSummary;
}

/**
 * Given a sock row, runs the required logic and blocks the user
 */
export async function spiHelperProcessBlockRow(opts: {
  sock: SockRow;
  userBlock: BlockEntry | undefined;
  userTalkContent: string | undefined;
  blockOptions: BlockOptions;
  noticeType: 'master' | 'sock' | null;
  sockmaster: string;
}): Promise<boolean> {
  const { sock, userBlock, userTalkContent, blockOptions, noticeType, sockmaster } = opts;
  if (userBlock !== undefined && !blockOptions.override) {
    // If the user is already blocked, and we haven't asked
    // to override, exit before we get to API block error
    new VueMessage({
      type: 'warning',
      content: `Block target ${sock.username} is already blocked. Check the "override existing blocks" box to re-block them`,
    }).show();
    // Return true because end result is the same
    return true;
  }
  const blockReason = userBlock?.reason;
  if (
    !spiHelperIsCheckuser() && blockOptions.override
    && blockReason && spiHelperCUBlockRegex.exec(blockReason)
  ) {
    // If you're not a checkuser, we've asked to overwrite existing blocks, and the block
    // target has a CU block on them, check whether that was intended
    const prompt = 'User ' + sock.username + ' is CheckUser-blocked, are you SURE you want to re-block them?\n'
      + 'Current block message:\n' + blockReason;
    if (!confirm(prompt)) {
      return false;
    }
  }
  if (!sock.duration) {
    // Exit before we get to API block error
    new VueMessage({
      type: 'error',
      content: `Block target ${sock.username} does not have an intended duration`,
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
    anononly: (isIP ? sock.abao : false),
    accountcreation: sock.acb,
    autoblock: (isIP ? false : sock.abao),
    notalkpage: sock.ntp,
    noemail: sock.nem,
    watchBlockedUser: spiHelperSettings.watch.blocked,
    watchExpiry: spiHelperSettings.expiry.blocked,
  });

  if (isIPRange) {
    // There isn't really a talk page for an IP range, so return here before we reach that section
    return blockSuccess;
  }

  if (!blockSuccess) {
    // Don't add a block notice if we failed to block
    return false;
  }

  // Talk page notice
  if (noticeType) {
    const cuBlock = blockOptions.cuBlock
      && spiHelperIsCheckuser()
      && spiHelperSettings.useCheckuserblockAccount;
    let newText = buildTalkNotice(sock, noticeType, sockmaster, cuBlock);
    const userTalkPage = `User talk:${sock.username}`;
    if (!blockOptions.blankTalk) {
      if (userTalkContent) {
        newText = userTalkContent + '\n' + newText;
      }
    }
    // Hardcode the watch setting to 'nochange' since we will have either
    // watched or not watched based on the boolean watchBlockedUser
    await spiHelperEditPage({
      title: userTalkPage,
      newText,
      summary: `Adding sockpuppetry block notice per [[${context.prefixedName}]]`,
      createonly: false,
      watch: 'nochange',
    });
  }

  return true;
}
