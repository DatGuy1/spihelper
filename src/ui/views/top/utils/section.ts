import type { CaseState } from '../../../../state.ts';
import { generateUserRow, setUserRowBlockData } from '../../../utils.ts';
import { markRaw } from '../../../runtime.ts';
import { context } from '../../../../context.ts';
import { fetchTemplateArguments, parseTemplates } from '../../../../template.ts';
import {
  spiHelperGetBulkGlobalBlocks,
  spiHelperGetBulkGlobalUsers,
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { BlockEntry, PrefetchedUser, UserRow } from '../../../../types';
import { isNonRegisteredAccount, spiHelperNormalizeUsername } from '../../../../utils.ts';
import { VueMessage } from '../../../messages.ts';

const SockListTemplateRegex = /sock ?list/;
const UserTemplateNameParts = ['ip', 'vandal', 'user', 'noping'];

function isRelevantTemplate(templateName: string): boolean {
  return SockListTemplateRegex.test(templateName)
    || UserTemplateNameParts.some(part => templateName.includes(part));
}

export function getSockEntries(opts: {
  text: string;
  fullSearch: boolean;
  state: CaseState;
}): [UserRow[], UserRow[], Set<string>] {
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

  return [likelySocks, possibleSocks, allUsernames];
}

export async function prefetchSockRows(opts: {
  likelySocks: UserRow[];
  possibleSocks: UserRow[];
  allUsernames: Set<string>;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  userGlobalBlocks: Map<string, boolean>;
  fetchedUsers: Map<string, PrefetchedUser>;
  state: CaseState;
}): Promise<UserRow[]> {
  const {
    likelySocks, possibleSocks, allUsernames,
    userBlocks, userLocks, userGlobalBlocks, fetchedUsers,
    state,
  } = opts;
  // For the minute time complexity gains
  const likelySet = new Set(likelySocks.map(sock => sock.id));

  // Changing sections re-runs this over users we have usually already looked up,
  // so only the ones we have never seen go out to the API
  const newUsernames = new Set([...allUsernames].filter(name => !fetchedUsers.has(name)));
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
  if (lookups) {
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

  return [...likelySocks, ...possibleSocks].map((userRow) => {
    const fetched = fetchedUsers.get(userRow.username);
    const blockSetting = fetched?.block;
    if (blockSetting) {
      userBlocks.set(userRow.username, blockSetting);
    }

    const defaultBlock = likelySet.has(userRow.id);
    const { userRow: newRow, isLocked, isGloballyBlocked } = setUserRowBlockData({
      userRow,
      block: blockSetting,
      defaultBlock,
      userPage: fetched?.userPage,
      globalUser: fetched?.globalUser,
      globalBlock: fetched?.globalBlock,
      state,
    });
    if (isLocked !== null) {
      userLocks.set(userRow.username, isLocked);
    }
    if (isGloballyBlocked !== null) {
      userGlobalBlocks.set(userRow.username, isGloballyBlocked);
    }
    return newRow;
  });
}
