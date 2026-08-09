import type { CaseState } from '../../../../state.ts';
import { setUserRowBlockData } from '../../../utils.ts';
import {
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
  userTags: Map<string, Tag[]>;
  state: CaseState;
}): Promise<UserRow[]> {
  const { likelySocks, possibleSocks, allUsernames, userBlocks, userLocks, userTags, state } = opts;
  // For the minute time complexity gains
  const likelySet = new Set(likelySocks.map(sock => sock.id));

  // We don't currently support requesting locks (global blocks?) for temporary accounts and IPs
  const registeredUsernames = new Set(
    [...allUsernames].filter(name => !isNonRegisteredAccount(name)),
  );
  const validUserPages = [...registeredUsernames].map(name => `User:${name}`);

  const [blockSettings, userPages, globalUsers] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(validUserPages),
    spiHelperGetBulkGlobalUsers(registeredUsernames),
  ]);

  return [...likelySocks, ...possibleSocks].map((userRow) => {
    const blockSetting = blockSettings.get(userRow.username);
    if (blockSetting !== undefined) {
      userBlocks.set(userRow.username, blockSetting);
    }

    const userPage = userPages.get(userRow.username);
    const defaultBlock = likelySet.has(userRow.id);
    const { userRow: newRow, isLocked } = setUserRowBlockData({
      userRow,
      block: blockSetting,
      defaultBlock,
      userPage,
      globalUser: globalUsers.get(userRow.username),
      state,
    });
    if (isLocked !== null) {
      userLocks.set(userRow.username, isLocked);
    }
    userTags.set(userRow.username, userRow.block.tags);
    return newRow;
  });
}
