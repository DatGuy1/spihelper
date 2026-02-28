import {
  spiHelperBlockUser,
  spiHelperEditPage,
} from '../api.ts';
import { spiHelperSettings } from '../options';
import type { BlockOptions, UserRow } from '../types/spi.ts';
import { spiHelperIsCheckuser } from '../role.ts';
import { isNoExpiry, spiHelperNormalizeUsername } from '../utils.ts';
import { context } from '../context.ts';

function buildTalkNotice(sock: UserRow, noticeType: 'master' | 'sock', sockmaster: string, cuBlock: boolean) {
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
  if (isNoExpiry(sock.block.duration)) {
    newText += '|indef=yes';
  }
  else {
    newText += '|time=' + sock.block.duration;
    if (cuBlock) {
      newText += '|indef=no';
    }
  }
  if (sock.block.ntp) {
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
  sock: UserRow;
  userTalkContent: string | undefined;
  blockOptions: BlockOptions;
  noticeType: 'master' | 'sock' | null;
  sockmaster: string;
}): Promise<boolean> {
  const { sock, userTalkContent, blockOptions, noticeType, sockmaster } = opts;
  const isIP = mw.util.isIPAddress(sock.username, true);
  const isIPRange = isIP && !mw.util.isIPAddress(sock.username, false);
  const blockSummary = buildBlockSummary(blockOptions, isIP, isIPRange, sock.block.acb);
  const blockSuccess = await spiHelperBlockUser({
    user: sock.username,
    duration: sock.block.duration,
    reason: blockSummary,
    reblock: blockOptions.override,
    anononly: (isIP ? sock.block.abao : false),
    accountcreation: sock.block.acb,
    autoblock: (isIP ? false : sock.block.abao),
    notalkpage: sock.block.ntp,
    noemail: sock.block.nem,
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
