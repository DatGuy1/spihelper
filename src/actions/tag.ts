import { type GlobalUser, type MasterNeeds, type Tag, type UserRow } from '../types';
import { spiHelperSettings } from '../options';
import {
  spiHelperEditPage,
  spiHelperGetPageText,
} from '../api.ts';
import { buildContextSummary } from '../context.ts';
import {
  buildTitleLinkHtml,
  countOf,
  isNonRegisteredAccount,
  isSockmasterTag,
  isSockpuppetTag,
  parseUserTags,
} from '../utils.ts';
import { VueMessage } from '../ui/messages.ts';

function createCategoryPage(title: string) {
  return spiHelperEditPage({
    title,
    newText: '{{sockpuppet category}}',
    summary: buildContextSummary('Creating sockpuppet category'),
    createonly: true,
    watch: spiHelperSettings.watch.categories,
    watchExpiry: spiHelperSettings.expiry.categories,
  });
}

// Deep equality check
function tagArraysEqual(tags1: Tag[], tags2: Tag[]): boolean {
  if (tags1.length !== tags2.length) return false;

  // Duplicity check
  const used = new Array<boolean>(tags2.length).fill(false);

  for (const tag1 of tags1) {
    let found = false;

    for (let i = 0; i < tags2.length; i++) {
      const tag2 = tags2[i];
      if (!tag2) {
        continue;
      }
      if (!used[i] && tag1.equals(tag2)) {
        used[i] = true;
        found = true;
        break;
      }
    }

    if (!found) return false;
  }

  return true;
}

/**
 * Replace the first sock/sockmaster template with `replacement`,
 * and remove all later ones (including their whole line)
 */
function replaceSockTemplates(pageText: string, replacement: string): string {
  const templateRegex = /\n?\{\{\s*sock\w*\b[\s\S]*?}}/gi;

  const matches = [...pageText.matchAll(templateRegex)];
  if (matches.length === 0) {
    // No existing templates, replace all content
    return replacement;
  }

  const firstMatch = matches[0];
  if (!firstMatch) {
    // should not happen as we check matches.length above
    return replacement;
  }
  const matchText = firstMatch[0];
  pageText = pageText.replace(matchText, () => replacement);

  matches.slice(1).forEach((match) => {
    const matchText = match[0];
    pageText = pageText.replace(matchText, '');
  });

  return pageText;
}

/**
 * Given a tag entry, runs the required logic and tags the user
 * @param {UserRow} opts.sock Sock to run the logic for
 * @param {string} opts.pageText Text of the userpage
 * @param opts.blocked Whether the user is blocked
 * @param opts.globalUser The sock's global account, absent if they have none
 * @param {boolean} opts.tagNonLocalAccounts Whether to tag accounts that don't exist locally
 * @return {Promise<boolean>} Whether the tag was successfully applied
 */
export async function spiHelperTagUser(opts: {
  sock: UserRow;
  pageText: string;
  blocked: boolean;
  globalUser: GlobalUser | undefined;
  tagNonLocalAccounts: boolean;
}): Promise<boolean> {
  const { sock, pageText, blocked, globalUser: userInfo, tagNonLocalAccounts } = opts;
  if (isNonRegisteredAccount(sock.username)) {
    return false; // do not support tagging IPs
  }
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
  sock.block.tags.forEach((tag) => {
    tag.locked = userInfo.locked;
  });

  const oldTags = parseUserTags(pageText);
  // Remove invalid tags and make them unique
  const cleanedTags = sock.block.tags.reduce<Tag[]>((acc, tag) => {
    const isOrphanSockpuppet = isSockpuppetTag(tag) && !tag.master;
    const alreadyAdded = acc.some(existing => existing.equals(tag));

    if (!isOrphanSockpuppet && !alreadyAdded) {
      acc.push(tag);
    }
    return acc;
  }, []);
  if (tagArraysEqual(oldTags, cleanedTags)) {
    const userLinkHtml = buildTitleLinkHtml(`User:${sock.username}`);
    new VueMessage({
      type: 'notice',
      content: `Tags are unmodified, skipping ${userLinkHtml}`,
      isHtml: true,
    }).show();
    return false;
  }
  const tagText = cleanedTags.map(tag => tag.generateWikitext(blocked)).join('\n');
  const newText = replaceSockTemplates(pageText, tagText);

  const actionVerb = oldTags.length < cleanedTags.length ? 'Adding' : 'Updating';
  // Only state the count when there's more than one tag
  const tagSummary = cleanedTags.length > 1
    ? countOf(cleanedTags.length, 'sockpuppetry tag')
    : 'sockpuppetry tag';
  return spiHelperEditPage({
    title: `User:${sock.username}`,
    newText,
    summary: buildContextSummary(`${actionVerb} ${tagSummary}`),
    createonly: false,
    watch: spiHelperSettings.watch.tagged,
    watchExpiry: spiHelperSettings.expiry.tagged,
  }).then(result => result !== null);
}

function collectCategoryNeeds(userRows: UserRow[]): Map<string, MasterNeeds> {
  const masterNeedsMap = new Map<string, { confirmed: boolean; suspected: boolean }>();

  function ensure(master: string) {
    if (!masterNeedsMap.has(master)) {
      masterNeedsMap.set(master, { confirmed: false, suspected: false });
    }
    return masterNeedsMap.get(master) ?? { confirmed: false, suspected: false };
  }

  for (const row of userRows) {
    for (const tag of row.block.tags) {
      if (isSockmasterTag(tag)) {
        continue;
      }
      const entry = ensure(tag.master);
      if (tag.status === 'proven' || tag.status === 'confirmed') entry.confirmed = true;
      if (tag.status === 'blocked') entry.suspected = true;
      if (tag.altmaster) {
        const altEntry = ensure(tag.altmaster);
        if (tag.altmasterStatus === 'proven') altEntry.confirmed = true;
        if (tag.altmasterStatus === 'suspected') altEntry.suspected = true;
      }
    }
  }
  return masterNeedsMap;
}

export async function createSockCategories(userRows: UserRow[]): Promise<Map<string, boolean>> {
  const purgeMap = new Map<string, boolean>();
  const categoryNeeds = collectCategoryNeeds(userRows);

  for (const [master, { confirmed, suspected }] of categoryNeeds) {
    if (!master) {
      continue;
    }
    let created = false;
    if (confirmed) {
      const catName = `Category:Wikipedia sockpuppets of ${master}`;
      const catText = await spiHelperGetPageText(catName, false);
      if (!catText) {
        await createCategoryPage(catName);
        created = true;
      }
    }
    if (suspected) {
      const catName = `Category:Suspected Wikipedia sockpuppets of ${master}`;
      const catText = await spiHelperGetPageText(catName, false);
      if (!catText) {
        await createCategoryPage(catName);
        created = true;
      }
    }
    purgeMap.set(master, created);
  }
  return purgeMap;
}
