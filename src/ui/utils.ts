import {
  type BlockEntry,
  type BlockOptions,
  DefaultLinkRowData,
  type GlobalBlockEntry,
  type GlobalUser,
  type InputColumn,
  type ParsedArchiveNotice,
  type UserRow,
} from '../types';
import type { CaseState } from '../state.ts';
import { isNonRegisteredAccount, parseUserTags, setupDefaultBlockRowData, spiHelperNormalizeUsername } from '../utils.ts';
import { spiHelperSettings } from '../options';
import { fetchTemplateArguments, parseTemplates } from '../template.ts';
import { context } from '../context.ts';
import type { MenuGroupData, MenuItemData } from '@wikimedia/codex';

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

/**
 * Codex's TableRowIdentifier symbol, handed over by bootstrap once Codex has loaded.
 *
 * Without it CdxTable keys rows by their array index, so inserting or removing a row
 * re-patches every row after it, and per-row child state (a lookup's suggestions, an
 * expiry input's touched flag) stays attached to the position rather than the account.
 */
export let tableRowIdentifier: symbol | null = null;
export function setTableRowIdentifier(identifier: symbol) {
  tableRowIdentifier = identifier;
}

export function getDefaultUserRow(archiveNotice: ParsedArchiveNotice | null): UserRow {
  const id = crypto.randomUUID();
  const newRow: UserRow = {
    id,
    username: '',
    block: setupDefaultBlockRowData(),
    link: { ...DefaultLinkRowData },
  };
  if (tableRowIdentifier) {
    // Object spread carries own enumerable symbols, so this survives generateUserRow
    (newRow as unknown as Record<symbol, string>)[tableRowIdentifier] = id;
  }
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
    userRow.block.tags = parseUserTags(userPage, userRow.username);
  }

  return userRow;
}

export const isMenuGroupData = (item: MenuItemData | MenuGroupData): item is MenuGroupData => 'items' in item;

export function setUserRowBlockData(opts: {
  userRow: UserRow;
  block: BlockEntry | undefined;
  userPage?: string;
  defaultBlock: boolean;
  globalUser: GlobalUser | undefined;
  globalBlock: GlobalBlockEntry | undefined;
  state: CaseState;
}) {
  const { block: blockSetting, userPage, defaultBlock, globalUser, globalBlock, state } = opts;
  const userRow = updateUserBlockDataSettings({
    userRow: opts.userRow,
    defaultBlock,
    currentBlock: blockSetting,
    userPage: userPage,
  });

  const crosswiki = state.archiveNotice?.crosswiki ?? false;
  let isLocked: boolean | null = null;
  let isGloballyBlocked: boolean | null = null;
  if (globalUser) {
    isLocked = globalUser.locked;
    userRow.block.lock = globalUser.locked || crosswiki;
  }
  else if (isNonRegisteredAccount(userRow.username)) {
    // Temporary accounts and IPs can't be locked, so the same checkbox stands for
    // the global block that gets requested for them instead
    isGloballyBlocked = globalBlock !== undefined;
    userRow.block.lock = isGloballyBlocked || crosswiki;
  }

  return { userRow, isLocked, isGloballyBlocked };
}

type MenuNode = MenuItemData | MenuGroupData;
export function pruneMenuData(nodes: MenuNode[]): MenuNode[] {
  return nodes
    .map((node) => {
      if (isMenuGroupData(node)) {
        const cleanedItems = pruneMenuData(node.items);

        // Remove group if empty after cleaning
        if (cleanedItems.length === 0) return null;

        return {
          ...node,
          items: cleanedItems,
        };
      }

      // Remove item if value is falsy
      if (!node.value) return null;

      return node;
    })
    .filter((node): node is MenuItemData => node !== null);
}

export function isInputDisabled(
  row: UserRow | null,
  column: InputColumn,
  blockOptions: BlockOptions,
  userBlocks: Map<string, BlockEntry>,
  userLocks: Map<string, boolean>,
  userGlobalBlocks: Map<string, boolean>,
  targetRows: UserRow[],
): boolean {
  if (column === 'lock') {
    if (row === null) return false;
    // Nothing left to request if the target already carries the action we'd ask for.
    // Explicit true checks because either map can hold false or be missing the row.
    return isNonRegisteredAccount(row.username)
      ? userGlobalBlocks.get(row.username) === true
      : userLocks.get(row.username) === true;
  }
  if (column === 'block') {
    if (row === null) return blockOptions.noBlock;
    return blockOptions.noBlock
      || (!blockOptions.override && userBlocks.get(row.username) !== undefined);
  }
  if (blockOptions.noBlock) return true;
  if (row === null) {
    return !targetRows.some(r => r.block.block);
  }
  if (!row.block.block) return true;
  return !blockOptions.override && userBlocks.get(row.username) !== undefined;
}

/**
 * A setTimeout that a signal can cut short.
 *
 * Always resolves, never rejects: callers check `signal.aborted` after awaiting anyway,
 * and rejecting would need a catch around every step of a search flow.
 */
export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    // An aborted signal never emits the event, so it would otherwise wait it out
    if (signal.aborted) {
      resolve();
      return;
    }

    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

/**
 * Whether a search has been superseded since it started.
 *
 * Reading `aborted` through a call is deliberate: it's a readonly property, so checking
 * it inline narrows it to false for the rest of the function, and TypeScript flags the
 * next check as dead even though awaiting in between is exactly when it changes.
 */
export function isAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

export let toRaw: (<T>(observed: T) => T) | null = null;
export function setToRaw(toRawArg: <T>(observed: T) => T) {
  toRaw = toRawArg;
}

export let markRaw: (<T extends object>(value: T) => T) | null = null;
export function setMarkRaw(markRawArg: <T extends object>(value: T) => T) {
  markRaw = markRawArg;
}
