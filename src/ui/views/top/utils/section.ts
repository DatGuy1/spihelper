import type { CaseState } from '../../../../state.ts';
import { setUserRowBlockData } from '../../../utils.ts';
import {
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { Tag, UserRow } from '../../../../types/spi.ts';
import { isNonRegisteredAccount } from '../../../../utils.ts';
import type { BlockEntry } from '../../../../types/api.ts';

export async function prefetchSockRows(opts: {
  likelySocks: UserRow[];
  possibleSocks: UserRow[];
  allUsernames: string[];
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  userTags: Map<string, Tag>;
  state: CaseState;
}): Promise<UserRow[]> {
  const { likelySocks, possibleSocks, allUsernames, userBlocks, userLocks, userTags, state } = opts;
  // For the minute time complexity gains
  const likelySet = new Set(likelySocks.map(sock => sock.id));

  const validUserPages = allUsernames.filter(name => !isNonRegisteredAccount(name))
    .map(name => `User:${name}`);

  const [blockSettings, userPages] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(validUserPages),
  ]);
  const checkLock = allUsernames.length < 7;

  const userPromises = [...likelySocks, ...possibleSocks].map(async (userRow) => {
    const blockSetting = blockSettings.get(userRow.username);
    if (blockSetting !== undefined) {
      userBlocks.set(userRow.username, blockSetting);
    }

    const userPage = userPages.get(userRow.username);
    const defaultBlock = likelySet.has(userRow.id);
    const { userRow: newRow, isLocked } = await setUserRowBlockData({
      userRow, block: blockSetting, defaultBlock, userPage, checkLock, state,
    });
    if (isLocked !== null) {
      userLocks.set(userRow.username, isLocked);
    }
    userTags.set(userRow.username, userRow.block.tag);
    return newRow;
  });

  return await Promise.all(userPromises);
}
