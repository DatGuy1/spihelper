import type { CaseState, SectionSelection } from '../../../../state.ts';
import { loadCaseText, loadSectionText } from '../../../../state.ts';
import { getSockEntries, setSockRowBlock } from '../../../utils.ts';
import {
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
} from '../../../../api.ts';
import type { SockRow } from '../../../../types/spi.ts';
import { isNonRegisteredAccount } from '../../../../utils.ts';
import type { BlockEntry } from '../../../../types/api.ts';

export async function prefetchSockRowsForSelection(
  selection: SectionSelection | null,
  state: CaseState,
  userLocks: Map<string, boolean>,
  userBlocks: Map<string, BlockEntry>,
): Promise<SockRow[]> {
  if (!selection) {
    return [];
  }

  // Prefill block and link tables. Should we make this configurable?
  const searchText = await (selection.type === 'all'
    ? loadCaseText(state)
    : loadSectionText(selection.section));

  const [likelySocks, possibleSocks, allUsernames] = getSockEntries({
    text: searchText,
    fullSearch: true,
    state: state,
  });

  // For the minute time complexity gains
  const likelySet = new Set(likelySocks);

  const validUsernames = allUsernames.filter(name => !isNonRegisteredAccount(name))
    .map(name => `User:${name}`);

  const [blockSettings, userPages] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(validUsernames),
  ]);

  const userPromises = [...likelySocks, ...possibleSocks].map(async (sock) => {
    const blockSetting = blockSettings.get(sock.username);
    if (blockSetting !== undefined) {
      userBlocks.set(sock.username, blockSetting);
    }

    const userPage = userPages.get(`User:${sock.username}`);
    const defaultBlock = likelySet.has(sock);
    const { row: newRow, isLocked } = await setSockRowBlock({
      sock, block: blockSetting, defaultBlock, userPage, state,
    });
    if (isLocked !== null) {
      userLocks.set(sock.username, isLocked);
    }
    return newRow;
  });

  return await Promise.all(userPromises);
}
