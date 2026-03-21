import { spiHelperBlockUser, spiHelperEditPage } from '../api.ts';
import { spiHelperSettings } from '../options';
import { type BlockOptions, type UserRow } from '../types/spi.ts';
import { spiHelperIsCheckuser } from '../role.ts';
import { isNoExpiry, isSockpuppetTag, spiHelperNormalizeUsername } from '../utils.ts';
import { buildContextSummary, context } from '../context.ts';

function buildTalkNotice(opts: {
  sock: UserRow;
  noticeType: 'master' | 'sock';
  sockmaster: string;
  cuBlock: boolean;
}) {
  const { sock, noticeType, sockmaster, cuBlock } = opts;
  let newText: string;
  let isSock = noticeType === 'sock';
  // Hacky workaround for when we didn't make a master tag
  if (isSock && sockmaster && sock.username === spiHelperNormalizeUsername(sockmaster)) {
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
  if (context.valid) {
    newText += '|spi=' + context.caseName;
  }
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
  if (isSock && sockmaster) {
    newText += '|master=' + sockmaster;
  }
  newText += '}}';
  return newText;
}

function buildBlockSummary(
  blockOptions: BlockOptions, isIP: boolean, isIPRange: boolean, acb: boolean,
) {
  let blockSummary = 'Abusing [[WP:SOCK|multiple accounts]]';
  if (context.valid) {
    blockSummary += `: Please see: [[${context.prefixedName}]]`;
  }
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
  blockOptions: BlockOptions;
}): Promise<boolean> {
  const { sock, blockOptions } = opts;
  const isIP = mw.util.isIPAddress(sock.username, true);
  const isIPRange = isIP && !mw.util.isIPAddress(sock.username, false);
  const blockSummary = buildBlockSummary(blockOptions, isIP, isIPRange, sock.block.acb);
  return await spiHelperBlockUser({
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
}

export async function spiHelperAddTalkBlockNotice(opts: {
  sock: UserRow;
  blockOptions: BlockOptions;
  userTalkContent: string | undefined;
  talkNotices: ('master' | 'sock')[];
  defaultMaster: string;
}): Promise<void> {
  const { sock, blockOptions, userTalkContent, talkNotices, defaultMaster } = opts;
  if (talkNotices.length === 0) {
    return;
  }
  const sockmaster = sock.block.tags.find(tag => isSockpuppetTag(tag))?.master ?? defaultMaster;
  // Talk page notice
  const cuBlock = blockOptions.cuBlock
    && spiHelperIsCheckuser()
    && spiHelperSettings.useCheckuserblockAccount;
  const userTalkPage = `User talk:${sock.username}`;
  let newText = blockOptions.blankTalk ? '' : userTalkContent ?? '';
  for (const talkNotice of talkNotices) {
    newText += '\n' + buildTalkNotice({ sock, noticeType: talkNotice, sockmaster, cuBlock });
  }
  // Hardcode the watch setting to 'nochange' since we will have either
  // watched or not watched based on the boolean watchBlockedUser
  await spiHelperEditPage({
    title: userTalkPage,
    newText,
    summary: buildContextSummary('Adding sockpuppetry block notice'),
    createonly: false,
    watch: 'nochange',
  });
}
