import type { CaseState } from '../../../../state.ts';
import { setSockRowBlock } from '../../../utils.ts';
import {
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { SockRow } from '../../../../types/spi.ts';
import { isNonRegisteredAccount } from '../../../../utils.ts';
import type { BlockEntry } from '../../../../types/api.ts';

export async function prefetchSockRows(opts: {
  likelySocks: SockRow[];
  possibleSocks: SockRow[];
  allUsernames: string[];
  userBlocks: Map<string, BlockEntry>;
  userLocks: Map<string, boolean>;
  state: CaseState;
}) {
  const { likelySocks, possibleSocks, allUsernames, userBlocks, userLocks, state } = opts;
  // For the minute time complexity gains
  const likelySet = new Set(likelySocks);

  const validUsernames = allUsernames.filter(name => !isNonRegisteredAccount(name))
    .map(name => `User:${name}`);

  const [blockSettings, userPages] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(validUsernames),
  ]);
  const checkLock = allUsernames.length < 7;

  const userPromises = [...likelySocks, ...possibleSocks].map(async (sock) => {
    const blockSetting = blockSettings.get(sock.username);
    if (blockSetting !== undefined) {
      userBlocks.set(sock.username, blockSetting);
    }

    const userPage = userPages.get(sock.username);
    const defaultBlock = likelySet.has(sock);
    const { row: newRow, isLocked } = await setSockRowBlock({
      sock, block: blockSetting, defaultBlock, userPage, checkLock, state,
    });
    if (isLocked !== null) {
      userLocks.set(sock.username, isLocked);
    }
    return newRow;
  });

  return await Promise.all(userPromises);
}
