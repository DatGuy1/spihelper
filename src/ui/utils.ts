import { ParsedArchiveNotice, type UserRow } from '../types/spi.ts';
import { type CaseState } from '../state.ts';
import { DefaultLinkRowData } from '../types/vue.ts';
import { parseUserTags, setupDefaultBlockRowData, spiHelperNormalizeUsername } from '../utils.ts';
import { spiHelperSettings } from '../options';
import { fetchTemplateArguments, parseTemplates } from '../template.ts';
import { context } from '../context.ts';
import type { MenuGroupData, MenuItemData } from '@wikimedia/codex';
import type { BlockEntry } from '../types/api.ts';
import { spiHelperGetGlobalUser } from '../api.ts';

export function getSockEntries(opts: {
  text: string;
  fullSearch: boolean;
  state: CaseState;
}): [UserRow[], UserRow[], Set<string>] {
  const { text, fullSearch, state } = opts;
  const likelySocks: UserRow[] = fullSearch ? [generateUserRow(context.caseName, state)] : [];
  const possibleSocks: UserRow[] = [];
  const allUsernames: Set<string> = fullSearch ? new Set([context.caseName]) : new Set();

  if (fullSearch) {
    let $searchOrigin: JQuery<Element> | JQuery<Document> = $(document);
    if (state.selectedSection?.type === 'specific') {
      $searchOrigin = $(`a[href$="section=${state.selectedSection.section.id}"]`).parentsUntil(':has(hr)').last().nextUntil('hr');
    }
    const sockList = $searchOrigin.find('.cuEntry').find('a:first');

    for (const entryElement of sockList) {
      const username = spiHelperNormalizeUsername($(entryElement).text());
      if (allUsernames.has(username)) {
        continue;
      }
      likelySocks.push(generateUserRow(username, state));
      allUsernames.add(username);
    }
  }

  const isRelevantTemplate = (templateName: string) => {
    return (/sock ?list/.exec(templateName)) !== null || ['ip', 'vandal', 'user', 'noping'].some(t => templateName.includes(t));
  };
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

export function generateUserRow(username: string, state: CaseState): UserRow {
  if (mw.util.isIPAddress(username, true)) {
    if (spiHelperSettings.interface.displayIPv6As64 && mw.util.isIPv6Address(username, false)) {
      return {
        ...getDefaultUserRow(state.archiveNotice),
        username: buildIPBlock(username),
      };
    }
    else {
      return { ...getDefaultUserRow(state.archiveNotice), username: username };
    }
  }
  else {
    return { ...getDefaultUserRow(state.archiveNotice), username: username };
  }
}

function buildIPBlock(fullIP: string): string {
  if (!mw.util.isIPv6Address(fullIP, false)) {
    return fullIP;
  }
  return fullIP.split(':').slice(0, 4).concat('0', '0', '0', '0').join(':') + '/64';
}

export function getDefaultUserRow(archiveNotice: ParsedArchiveNotice | null): UserRow {
  const newRow: UserRow = {
    id: crypto.randomUUID(),
    username: '',
    block: setupDefaultBlockRowData(),
    link: { ...DefaultLinkRowData },
  };
  if (archiveNotice) {
    if (archiveNotice.crosswiki) {
      newRow.block.lock = true;
    }
    if (archiveNotice.notalk) {
      newRow.block.nem = true;
      newRow.block.ntp = true;
    }
  }
  newRow.block.duration = spiHelperSettings.interface.defaultBlockDuration;
  return newRow;
}

/**
 * Updates block table based on block settings, tags, and defaultBlock
 */
export function updateUserBlockDataSettings(opts: {
  userRow: UserRow;
  currentBlock?: BlockEntry | null;
  userPage?: string;
  defaultBlock: boolean;
}): UserRow {
  const { userRow, currentBlock, userPage, defaultBlock } = opts;
  if (currentBlock) {
    userRow.block.block = true;
    userRow.block.acb = currentBlock.acb;
    userRow.block.abao = currentBlock.abao;
    userRow.block.ntp = currentBlock.ntp;
    userRow.block.nem = currentBlock.nem;
    userRow.block.duration = currentBlock.duration;
  }
  else {
    userRow.block.block = defaultBlock;
    if (mw.util.isIPAddress(userRow.username, true)) {
      userRow.block.duration = '1 week';
    }
  }

  if (userPage) {
    userRow.block.tags = parseUserTags(userPage);
  }

  return userRow;
}

export const isMenuGroupData = (item: MenuItemData | MenuGroupData): item is MenuGroupData => 'items' in item;

export async function setUserRowBlockData(opts: {
  userRow: UserRow;
  block: BlockEntry | null | undefined;
  userPage?: string;
  defaultBlock: boolean;
  checkLock: boolean;
  state: CaseState;
}) {
  const { block: blockSetting, userPage, defaultBlock, checkLock, state } = opts;
  const userRow = updateUserBlockDataSettings({
    userRow: opts.userRow,
    defaultBlock,
    currentBlock: blockSetting,
    userPage: userPage,
  });

  let isLocked: boolean | null = null;
  if (checkLock) {
    const globalUser = await spiHelperGetGlobalUser(userRow.username);
    if (globalUser) {
      isLocked = globalUser.locked;
      // noinspection RedundantIfStatementJS
      if (globalUser.locked || state.archiveNotice?.crosswiki) {
        userRow.block.lock = true;
      }
      else {
        userRow.block.lock = false;
      }
    }
  }

  return { userRow, isLocked };
}
