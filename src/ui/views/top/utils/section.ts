import type { CaseState } from '../../../../state.ts';
import { setUserRowBlockData } from '../../../utils.ts';
import {
  spiHelperGetBulkGlobalBlocks,
  spiHelperGetBulkGlobalUsers,
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { BlockEntry, Tag, UserRow } from '../../../../types';
import { isNonRegisteredAccount } from '../../../../utils.ts';

export async function prefetchSockRows(opts: {
  likelySocks: UserRow[];
  possibleSocks: UserRow[];
  allUsernames: Set<string>;
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  userGlobalBlocks: Map<string, boolean>;
  userTags: Map<string, Tag[]>;
  state: CaseState;
}): Promise<UserRow[]> {
  const {
    likelySocks, possibleSocks, allUsernames,
    userBlocks, userLocks, userGlobalBlocks, userTags, state,
  } = opts;
  // For the minute time complexity gains
  const likelySet = new Set(likelySocks.map(sock => sock.id));

  const registeredUsernames = new Set<string>();
  const unregisteredUsernames = new Set<string>();
  for (const name of allUsernames) {
    (isNonRegisteredAccount(name) ? unregisteredUsernames : registeredUsernames).add(name);
  }
  const validUserPages = [...registeredUsernames].map(name => `User:${name}`);

  const [blockSettings, userPages, globalUsers, globalBlocks] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(validUserPages),
    spiHelperGetBulkGlobalUsers(registeredUsernames),
    spiHelperGetBulkGlobalBlocks(unregisteredUsernames),
  ]);

  return [...likelySocks, ...possibleSocks].map((userRow) => {
    const blockSetting = blockSettings.get(userRow.username);
    if (blockSetting !== undefined) {
      userBlocks.set(userRow.username, blockSetting);
    }

    const userPage = userPages.get(userRow.username);
    const defaultBlock = likelySet.has(userRow.id);
    const { userRow: newRow, isLocked, isGloballyBlocked } = setUserRowBlockData({
      userRow,
      block: blockSetting,
      defaultBlock,
      userPage,
      globalUser: globalUsers.get(userRow.username),
      globalBlock: globalBlocks.get(userRow.username),
      state,
    });
    if (isLocked !== null) {
      userLocks.set(userRow.username, isLocked);
    }
    if (isGloballyBlocked !== null) {
      userGlobalBlocks.set(userRow.username, isGloballyBlocked);
    }
    userTags.set(userRow.username, userRow.block.tags);
    return newRow;
  });
}
