import type { CaseState } from '../../../../state.ts';
import { setUserRowBlockData } from '../../../utils.ts';
import {
  spiHelperGetBulkGlobalBlocks,
  spiHelperGetBulkGlobalUsers,
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { BlockEntry, PrefetchedUser, UserRow } from '../../../../types';
import { isNonRegisteredAccount } from '../../../../utils.ts';

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

  // Could bundle the 4 API calls into a single spiHelperGetUserSnapshot
  // call that calls list=blocks|globalusers|...&bkusers=...&gususers=...
  const [blockSettings, userPages, globalUsers, globalBlocks] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(newUsernames),
    spiHelperGetBulkPageText(validUserPages),
    spiHelperGetBulkGlobalUsers(registeredUsernames),
    spiHelperGetBulkGlobalBlocks(unregisteredUsernames),
  ]);
  for (const name of newUsernames) {
    fetchedUsers.set(name, {
      block: blockSettings.get(name),
      userPage: userPages.get(`User:${name}`),
      globalUser: globalUsers.get(name),
      globalBlock: globalBlocks.get(name),
    });
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
