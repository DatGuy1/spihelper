import type { CaseState, SectionSelection } from '../../../../state.ts';
import { loadCaseText, loadSectionText } from '../../../../state.ts';
import { getSockEntries, updateSockRowSettings } from '../../../utils.ts';
import {
  spiHelperGetBulkPageText,
  spiHelperGetBulkUserBlockSettings,
  spiHelperGetGlobalUser,
} from '../../../../api.ts';
import type { SockRow } from '../../../../types/spi.ts';

export async function prefetchSockRowsForSelection(
  selection: SectionSelection | null,
  state: CaseState,
  userlocks: Map<string, boolean>,
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

  const nonIPUsernames = allUsernames.filter(name =>
    !mw.util.isIPAddress(name, true)
    && !mw.util.isTemporaryUser(name),
  )
    .map(name => `User:${name}`);

  const [blockSettings, userPages] = await Promise.all([
    spiHelperGetBulkUserBlockSettings(allUsernames),
    spiHelperGetBulkPageText(nonIPUsernames),
  ]);

  const userPromises = [...likelySocks, ...possibleSocks].map(async (sock) => {
    const blockSetting = blockSettings.get(sock.username);
    const userPage = userPages.get(`User:${sock.username}`);

    const row = updateSockRowSettings({
      row: sock,
      defaultBlock: likelySet.has(sock),
      currentBlock: blockSetting,
      currentTags: userPage,
    });

    const globalUser = await spiHelperGetGlobalUser(row.username);
    if (globalUser) {
      const locked = globalUser.locked;
      userlocks.set(sock.username, locked);
      if (locked) {
        row.lock = true;
      }
      else if (!state.archiveNotice?.crosswiki) {
        row.lock = false;
      }
    }

    return row;
  });

  return await Promise.all(userPromises);
}
