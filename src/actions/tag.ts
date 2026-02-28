import type { UserRow } from '../types/spi.ts';
import { spiHelperSettings } from '../options';
import {
  spiHelperEditPage,
  spiHelperGetGlobalUser,
  spiHelperGetPageText,
} from '../api.ts';
import { context } from '../context.ts';
import { isNonRegisteredAccount } from '../utils.ts';
import { VueMessage } from '../ui/messages.ts';

function createCategoryPage(title: string) {
  return spiHelperEditPage({
    title,
    newText: '{{sockpuppet category}}',
    summary: `Creating sockpuppet category per [[${context.prefixedName}]]`,
    createonly: true,
    watch: spiHelperSettings.watch.categories,
    watchExpiry: spiHelperSettings.expiry.categories,
  });
}

/**
 * Given a tag entry, runs the required logic and tags the user
 * @param {UserRow} opts.sock Sock to run the logic for
 * @param {boolean} opts.tagNonLocalAccounts Whether to tag accounts that don't exist locally
 * @param {string} opts.sockmaster The username of the sockmaster to tag for
 * @param {string} opts.altmaster The username of the alternate master to tag for
 * @return {Promise<boolean>} Whether the tag was successfully applied
 */
export async function spiHelperTagUser(opts: {
  sock: UserRow;
  tagNonLocalAccounts: boolean;
  master: string;
  altmaster: string;
  blocked: boolean;
}): Promise<boolean> {
  const { sock, tagNonLocalAccounts, master, altmaster, blocked } = opts;
  if (isNonRegisteredAccount(sock.username)) {
    return false; // do not support tagging IPs
  }
  const userInfo = await spiHelperGetGlobalUser(sock.username);
  if (!userInfo) {
    // Skip, don't tag accounts that don't exist
    new VueMessage({
      type: 'warning',
      content: `The account ${sock.username} does not exist and so has not been tagged`,
    }).show();
    return false;
  }
  if (!tagNonLocalAccounts && !userInfo.existsLocally) {
    // Skip as the account does not exist locally and the
    // "tag accounts that don't exist locally" setting is unchecked.
    new VueMessage({
      type: 'warning',
      content: `The account ${sock.username} does not exist locally and so has not been tagged`,
    }).show();
    return false;
  }

  let tagText = '';
  const isMaster = sock.block.tag.startsWith('M');
  let tag: string;
  switch (sock.block.tag) {
    case 'Mblocked':
      tag = 'blocked';
      break;
    case 'Mconfirmed':
      tag = 'blocked';
      break;
    case 'Mbanned':
      tag = 'banned';
      break;
    case 'Ssuspected':
      tag = 'blocked';
      break;
    case 'Sproven':
      tag = 'proven';
      break;
    case 'Sconfirmed':
      tag = 'confirmed';
      break;
    default:
      console.error('spiHelperTagUser: Unexpected tag value', sock.block.tag);
      return false;
  }

  const isNotBlocked = !userInfo.existsLocally || !blocked;

  if (isMaster) {
    tagText += `{{sockpuppeteer
| 1 = ${tag}
| locked = ${userInfo.locked ? 'yes' : 'no'}`;
    if (sock.block.tag === 'Mconfirmed' || sock.block.tag === 'Mbanned') {
      tagText += '\n| checked = yes';
    }
    tagText += '\n}}';
  }
  const tagAltmaster = sock.block.altmaster !== 'none';
  // Not if-else because we tag something as both sock and master if they're a
  // sockmaster and have a suspected altmaster
  if (!isMaster || tagAltmaster) {
    let altmasterParam = tagAltmaster ? altmaster : '';
    let altmasterStatusParam = tagAltmaster ? sock.block.altmaster : '';
    let sockmasterName = master;
    if (tagAltmaster && isMaster) {
      // If we have an altmaster and we're the master, swap a few values around
      sockmasterName = altmaster;
      tag = sock.block.altmaster === 'suspected' ? 'blocked' : sock.block.altmaster;
      altmasterParam = '';
      altmasterStatusParam = '';
      tagText += '\n';
    }
    tagText += `{{sockpuppet
| 1 = ${sockmasterName}
| 2 = ${tag}
| locked = ${userInfo.locked ? 'yes' : 'no'}
| notblocked = ${isNotBlocked ? 'yes' : 'no'}
| altmaster = ${altmasterParam}
| altmaster-status = ${altmasterStatusParam}
}}`;
  }
  return spiHelperEditPage({
    title: `User:${sock.username}`,
    newText: tagText,
    summary: `Adding sockpuppetry tag per [[${context.prefixedName}]]`,
    createonly: false,
    watch: spiHelperSettings.watch.tagged,
    watchExpiry: spiHelperSettings.expiry.tagged,
  }).then(result => result !== null);
}

export async function createSockCategories(opts: {
  userRows: UserRow[];
  master: string;
  altmaster: string;
}): Promise<boolean> {
  const { userRows, master, altmaster } = opts;
  // Whether we should purge sock pages (needed when we create a category)
  let needsPurge = false;
  // Check if we need to validate our categories to reduce API calls
  const checkConfirmedCat = userRows.some(sock => sock.block.tag === 'Sproven' || sock.block.tag === 'Sconfirmed');
  const checkSuspectedCat = userRows.some(sock => sock.block.tag === 'Ssuspected');
  const checkAltSuspectedCat = userRows.some(sock => sock.block.altmaster === 'suspected');
  const checkAltProvenCat = userRows.some(sock => sock.block.altmaster === 'proven');

  if (checkAltProvenCat) {
    const catName = `Category:Wikipedia sockpuppets of ${altmaster}`;
    const catText = await spiHelperGetPageText(catName, false);
    // Empty text means the page doesn't exist - create it
    if (!catText) {
      await createCategoryPage(catName);
      needsPurge = true;
    }
  }
  if (checkAltSuspectedCat) {
    const catName = `Category:Suspected Wikipedia sockpuppets of ${altmaster}`;
    const catText = await spiHelperGetPageText(catName, false);
    if (!catText) {
      await createCategoryPage(catName);
      needsPurge = true;
    }
  }
  if (checkConfirmedCat) {
    const catName = `Category:Wikipedia sockpuppets of ${master}`;
    const catText = await spiHelperGetPageText(catName, false);
    if (!catText) {
      await createCategoryPage(catName);
      needsPurge = true;
    }
  }
  if (checkSuspectedCat) {
    const catName = `Category:Suspected Wikipedia sockpuppets of ${master}`;
    const catText = await spiHelperGetPageText(catName, false);
    if (!catText) {
      await createCategoryPage(catName);
      needsPurge = true;
    }
  }
  return needsPurge;
}
