import type { CaseState } from '../../../../state.ts';
import { generateUserRow, setUserRowData } from '../../../utils.ts';
import { markRaw } from '../../../runtime.ts';
import { context } from '../../../../context.ts';
import { fetchTemplateArguments, parseTemplates } from '../../../../template.ts';
import {
  spiHelperGetBulkGlobalBlocks,
  spiHelperGetBulkGlobalUsers,
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { BlockActionData, PrefetchedUser, UserRow } from '../../../../types';
import { isNonRegisteredAccount, spiHelperNormalizeUsername } from '../../../../utils.ts';
import { VueMessage } from '../../../messages.ts';

const SockListTemplateRegex = /sock ?list/;
const UserTemplateNameParts = ['ip', 'vandal', 'user', 'noping', 'np'];

function isRelevantTemplate(templateName: string): boolean {
  return SockListTemplateRegex.test(templateName)
    || UserTemplateNameParts.some(part => templateName.includes(part));
}

export function getSockEntries(opts: {
  text: string;
  fullSearch: boolean;
  state: CaseState;
}): [UserRow[], UserRow[]] {
  const { text, fullSearch, state } = opts;
  const likelySocks: UserRow[] = fullSearch ? [generateUserRow(context.userName, state)] : [];
  const possibleSocks: UserRow[] = [];
  const allUsernames: Set<string> = fullSearch ? new Set([context.userName]) : new Set();

  if (fullSearch) {
    let $searchOrigin: JQuery<Element> | JQuery<Document> = $(document);
    if (state.selectedSection?.type === 'single') {
      $searchOrigin = $(`a[href$="section=${state.selectedSection.section.id}"]`).parentsUntil(':has(hr)').last().nextUntil('hr');
    }
    const sockList = $searchOrigin.find('.cuEntry').toArray()
      .map(entry => entry.querySelector('a'))
      .filter(link => link !== null);

    for (const entryElement of sockList) {
      const filteredUsername = Array.from(entryElement.childNodes).find(n => n.nodeType === Node.TEXT_NODE)?.textContent ?? '';
      if (!filteredUsername) {
        continue;
      }
      const username = spiHelperNormalizeUsername(filteredUsername);
      if (allUsernames.has(username)) {
        continue;
      }
      likelySocks.push(generateUserRow(username, state));
      allUsernames.add(username);
    }
  }

  const allTemplates = parseTemplates(text);
  for (const template of allTemplates) {
    if (isRelevantTemplate(template.name)) {
      const templateUsernames = fetchTemplateArguments(template);
      for (const templateUsername of templateUsernames) {
        const username = spiHelperNormalizeUsername(templateUsername);
        if (!allUsernames.has(username)) {
          possibleSocks.push(generateUserRow(username, state));
          allUsernames.add(username);
        }
      }
    }
  }

  return [likelySocks, possibleSocks];
}

/** Fills the fetchedUsers cache with everyone in usernames we haven't loaded */
export async function ensureUsersFetched(
  usernames: Set<string>,
  fetchedUsers: Map<string, PrefetchedUser>,
): Promise<void> {
  // Changing sections re-runs this over users we have usually already looked up,
  // so only the ones we have never seen go out to the API
  const newUsernames = new Set([...usernames].filter(name => !fetchedUsers.has(name)));
  const registeredUsernames = new Set<string>();
  const unregisteredUsernames = new Set<string>();
  for (const name of newUsernames) {
    (isNonRegisteredAccount(name) ? unregisteredUsernames : registeredUsernames).add(name);
  }
  const validUserPages = [...registeredUsernames].map(name => `User:${name}`);

  // Could maybe bundle the 4 API calls into a single spiHelperGetUserSnapshot
  // call that calls list=blocks|globalusers|...&bkusers=...&gususers=...?
  const lookups = await Promise.all([
    spiHelperGetBulkUserBlockSettings(newUsernames),
    spiHelperGetBulkPageText(validUserPages),
    spiHelperGetBulkGlobalUsers(registeredUsernames),
    spiHelperGetBulkGlobalBlocks(unregisteredUsernames),
  ]).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    new VueMessage({
      type: 'warning',
      content: `Could not look up blocks and tags for these accounts: ${message}`,
    }).show();
    return null;
  });
  if (!lookups) {
    return;
  }

  const [blockSettings, userPages, globalUsers, globalBlocks] = lookups;
  for (const name of newUsernames) {
    // Nothing renders these entries so keep Vue from proxying
    const fetched: PrefetchedUser = {
      block: blockSettings.get(name),
      userPage: userPages.get(`User:${name}`),
      globalUser: globalUsers.get(name),
      globalBlock: globalBlocks.get(name),
    };
    fetchedUsers.set(name, markRaw(fetched));
  }
}

/** Seeds a row's block, lock, and tag states from the cache, and files what it found */
function applyFetchedUser(opts: {
  userRow: UserRow;
  defaultBlock: boolean;
  blockData: BlockActionData;
  state: CaseState;
}): UserRow {
  const { userRow, defaultBlock, blockData, state } = opts;
  const fetched = blockData.fetchedUsers.get(userRow.username);
  const { userRow: newRow, globalStatus } = setUserRowData({
    userRow,
    fetchedUser: fetched,
    defaultBlock,
    state,
  });

  if (fetched?.block) {
    blockData.userBlocks.set(newRow.username, fetched.block);
  }
  switch (globalStatus.kind) {
    case 'locked':
      blockData.userLocks.set(newRow.username, globalStatus.locked);
      break;
    case 'gblocked':
      blockData.userGlobalBlocks.set(newRow.username, globalStatus.blocked);
      break;
    case 'none':
      break;
  }
  return newRow;
}

export function applyFetchedUsers(opts: {
  accounts: UserRow[];
  usernames: Set<string>;
  blockData: BlockActionData;
  state: CaseState;
}): void {
  const { accounts, usernames, blockData, state } = opts;
  for (const userRow of accounts) {
    if (!usernames.has(userRow.username)) {
      continue;
    }
    applyFetchedUser({
      userRow,
      defaultBlock: userRow.block.block,
      blockData,
      state,
    });
  }
}

/** Looks up a fresh set of rows and seeds them */
export async function prefetchSockRows(opts: {
  likelySocks: UserRow[];
  possibleSocks: UserRow[];
  blockData: BlockActionData;
  state: CaseState;
}): Promise<UserRow[]> {
  const { likelySocks, possibleSocks, blockData, state } = opts;
  const allRows = [...likelySocks, ...possibleSocks];
  // For the minute time complexity gains
  const likelyIds = new Set(likelySocks.map(sock => sock.id));

  await ensureUsersFetched(new Set(allRows.map(row => row.username)), blockData.fetchedUsers);

  return allRows.map(userRow => applyFetchedUser({
    userRow,
    defaultBlock: likelyIds.has(userRow.id),
    blockData,
    state,
  }));
}
