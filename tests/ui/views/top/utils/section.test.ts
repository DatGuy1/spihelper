import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import type {
  BlockEntry,
  GlobalBlockEntry,
  GlobalUser,
  PrefetchedUser,
  UserRow,
} from '../../../../../src/types';
import { isSockpuppetTag } from '../../../../../src/tags.ts';
import { makeBlockEntry, makeUserRow } from '../../../../fixtures/spi.ts';
import { stubApi } from '../../../../fixtures/api.ts';

const mockGetBulkUserBlockSettings = mock((_usernames: Set<string>) =>
  Promise.resolve(new Map<string, BlockEntry>()));
const mockGetBulkPageText = mock((_titles: string[]) =>
  Promise.resolve(new Map<string, string>()));
const mockGetBulkGlobalUsers = mock((_usernames: Set<string>) =>
  Promise.resolve(new Map<string, GlobalUser>()));
const mockGetBulkGlobalBlocks = mock((_targets: Set<string>) =>
  Promise.resolve(new Map<string, GlobalBlockEntry>()));

await stubApi({
  spiHelperGetBulkUserBlockSettings: mockGetBulkUserBlockSettings,
  spiHelperGetBulkPageText: mockGetBulkPageText,
  spiHelperGetBulkGlobalUsers: mockGetBulkGlobalUsers,
  spiHelperGetBulkGlobalBlocks: mockGetBulkGlobalBlocks,
});

const {
  applyFetchedUsers,
  ensureUsersFetched,
  getSockEntries,
  prefetchSockRows,
} = await import('../../../../../src/ui/views/top/utils/section.ts');
const { setupBlockActionData } = await import('../../../../../src/utils.ts');
const { CaseState } = await import('../../../../../src/state.ts');
const contextModule = await import('../../../../../src/context.ts');

beforeEach(() => {
  contextModule.setContext('Wikipedia:Sockpuppet investigations/Foo');
  mockGetBulkUserBlockSettings.mockReset().mockResolvedValue(new Map());
  mockGetBulkPageText.mockReset().mockResolvedValue(new Map());
  mockGetBulkGlobalUsers.mockReset().mockResolvedValue(new Map());
  mockGetBulkGlobalBlocks.mockReset().mockResolvedValue(new Map());
});

afterEach(() => {
  mock.restore();
  // renderCuEntries appends to the real document, so each test starts from a clean page
  document.body.innerHTML = '';
});

function textNode(content: string): Text {
  return document.createTextNode(content);
}

function elementNode(content = ''): HTMLSpanElement {
  const span = document.createElement('span');
  span.textContent = content;
  return span;
}

function makeAnchor(...children: Node[]): HTMLAnchorElement {
  const a = document.createElement('a');
  for (const child of children) a.appendChild(child);
  return a;
}

/**
 * Put the given username anchors on the page in the markup an SPI case actually uses,
 * and let the real jQuery from setup.ts query it
 */
function renderCuEntries(anchors: Element[]): void {
  const list = document.createElement('ul');
  for (const anchor of anchors) {
    const item = document.createElement('li');
    const entry = document.createElement('span');
    entry.className = 'plainlinks cuEntry';
    const inner = document.createElement('span');
    inner.className = 'plainlinks';
    inner.appendChild(anchor);
    const talkLink = document.createElement('a');
    talkLink.appendChild(document.createTextNode('talk'));
    entry.append(inner, talkLink);
    item.appendChild(entry);
    list.appendChild(item);
  }
  document.body.appendChild(list);
}

function makeState(): InstanceType<typeof CaseState> {
  return new CaseState([], null, null);
}

describe('prefetchSockRows', () => {
  /** Loads one section's worth of accounts against a cache shared with earlier calls */
  function loadSection(usernames: string[], fetchedUsers: Map<string, PrefetchedUser>) {
    return prefetchSockRows({
      likelySocks: usernames.map(name => makeUserRow(name)),
      possibleSocks: [],
      blockData: { ...setupBlockActionData(), fetchedUsers },
      state: new CaseState(),
    });
  }

  /** The usernames each of the block settings lookups asked the API about */
  const requestedUsernames = () => mockGetBulkUserBlockSettings.mock.calls.map(
    ([usernames]) => [...usernames],
  );

  test('looks up every user the first time a section brings them in', async () => {
    await loadSection(['SockA', 'SockB'], new Map());

    expect(requestedUsernames()).toEqual([['SockA', 'SockB']]);
    expect(mockGetBulkPageText).toHaveBeenCalledWith(['User:SockA', 'User:SockB']);
  });

  test('asks for nothing when the section holds only users already looked up', async () => {
    const fetchedUsers = new Map<string, PrefetchedUser>();
    await loadSection(['SockA', 'SockB'], fetchedUsers);
    await loadSection(['SockB', 'SockA'], fetchedUsers);

    expect(requestedUsernames()).toEqual([['SockA', 'SockB'], []]);
    expect(mockGetBulkPageText).toHaveBeenLastCalledWith([]);
  });

  test('asks only about the users a new section adds', async () => {
    const fetchedUsers = new Map<string, PrefetchedUser>();
    await loadSection(['SockA'], fetchedUsers);
    await loadSection(['SockA', 'SockB'], fetchedUsers);

    expect(requestedUsernames()).toEqual([['SockA'], ['SockB']]);
    expect(mockGetBulkPageText).toHaveBeenLastCalledWith(['User:SockB']);
  });

  test('caches users who turned out to have nothing on them, rather than retrying', async () => {
    // An unblocked user with no userpage is absent from every response map, so a cache
    // keyed off those maps alone would look them up again on each section change
    const fetchedUsers = new Map<string, PrefetchedUser>();
    await loadSection(['SockA'], fetchedUsers);
    await loadSection(['SockA'], fetchedUsers);

    expect(requestedUsernames()).toEqual([['SockA'], []]);
  });

  test('builds rows from the cache without a second lookup', async () => {
    mockGetBulkUserBlockSettings.mockResolvedValue(
      new Map([['SockA', makeBlockEntry('SockA', { duration: 'infinity' })]]),
    );
    mockGetBulkPageText.mockResolvedValue(
      new Map([['User:SockA', '{{sockpuppet|Master|confirmed}}']]),
    );

    const fetchedUsers = new Map<string, PrefetchedUser>();
    const [firstRow] = await loadSection(['SockA'], fetchedUsers);
    const [secondRow] = await loadSection(['SockA'], fetchedUsers);

    expect(mockGetBulkUserBlockSettings).toHaveBeenCalledTimes(2);
    expect(secondRow?.block.block).toBe(firstRow?.block.block);
    expect(secondRow?.block.duration).toBe('infinity');
    expect(secondRow?.block.tags.filter(isSockpuppetTag).map(tag => tag.master)).toEqual(['Master']);
  });
});

describe('getSockEntries', () => {
  describe('fullSearch: false', () => {
    const state = makeState();

    test('empty text produces empty lists', () => {
      const [likely, possible] = getSockEntries({ text: '', fullSearch: false, state });
      expect(likely).toEqual([]);
      expect(possible).toEqual([]);
    });

    test('{{user|...}} adds username to possibleSocks', () => {
      const [, possible] = getSockEntries({ text: '{{user|Sock}}', fullSearch: false, state });
      expect(possible.map(r => r.username)).toContain('Sock');
    });

    test('{{vandal|...}} adds username to possibleSocks', () => {
      const [, possible] = getSockEntries({ text: '{{vandal|Vandal}}', fullSearch: false, state });
      expect(possible.map(r => r.username)).toContain('Vandal');
    });

    test('{{sock list|...}} expands multiple usernames', () => {
      const [, possible] = getSockEntries({
        text: '{{sock list|1=Foo|2=Bar}}',
        fullSearch: false,
        state,
      });
      const names = possible.map(r => r.username);
      expect(names).toContain('Foo');
      expect(names).toContain('Bar');
    });

    test('duplicate username across templates appears only once', () => {
      const [, possible] = getSockEntries({
        text: '{{user|SockA}}\n{{vandal|SockA}}',
        fullSearch: false,
        state,
      });
      expect(possible).toHaveLength(1);
    });

    test('irrelevant templates are ignored', () => {
      const [, possible] = getSockEntries({
        text: '{{cite web|url=https://example.com}}',
        fullSearch: false,
        state,
      });
      expect(possible).toEqual([]);
    });
  });

  describe('fullSearch: true', () => {
    test('anchor with a plain text node is included as a sock entry', () => {
      renderCuEntries([makeAnchor(textNode('SockA'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely.map(r => r.username)).toContain('SockA');
    });

    test('leading/trailing whitespace in the text node is trimmed', () => {
      renderCuEntries([makeAnchor(textNode(' SockA '))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely.map(r => r.username)).toContain('SockA');
    });

    test('only the text node is used when a sibling element node is present', () => {
      renderCuEntries([makeAnchor(textNode('RealSock'), elementNode('UserHighlightType'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      const names = likely.map(r => r.username);
      expect(names).toContain('RealSock');
      expect(names).not.toContain('UserHighlightType');
    });

    test('anchor with only an element node (no text node) is skipped entirely', () => {
      renderCuEntries([makeAnchor(elementNode('IgnoredUser'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      const names = likely.map(r => r.username);
      expect(names).not.toContain('IgnoredUser');
      expect(likely).toHaveLength(1); // only the case master
    });

    test('anchor with an empty text node is skipped', () => {
      renderCuEntries([makeAnchor(textNode(''))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely).toHaveLength(1); // only the case master
    });

    test('duplicate usernames from the DOM are deduplicated', () => {
      renderCuEntries([makeAnchor(textNode('SockA')), makeAnchor(textNode('SockA'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely.filter(r => r.username === 'SockA')).toHaveLength(1);
    });

    test('username already in allUsernames (from template text) is not added from DOM', () => {
      renderCuEntries([makeAnchor(textNode('SockA'))]);
      const [likely, possible] = getSockEntries({
        text: '{{user|SockA}}',
        fullSearch: true,
        state: makeState(),
      });
      const allNames = [...likely, ...possible].map(r => r.username);
      expect(allNames.filter(n => n === 'SockA')).toHaveLength(1);
    });
  });
});

describe('applyFetchedUsers', () => {
  /** A table holding one row per name, as the views leave it after adding them */
  function makeAccounts(usernames: string[]): UserRow[] {
    return usernames.map(name => makeUserRow(name));
  }

  test('seeds rows from the cache the lookups filled', async () => {
    mockGetBulkUserBlockSettings.mockResolvedValue(
      new Map([['SockA', makeBlockEntry('SockA', { duration: 'infinity' })]]),
    );
    mockGetBulkPageText.mockResolvedValue(
      new Map([['User:SockA', '{{sockpuppet|Master|confirmed}}']]),
    );
    const accounts = makeAccounts(['SockA']);
    const blockData = setupBlockActionData();

    await ensureUsersFetched(new Set(['SockA']), blockData.fetchedUsers);
    applyFetchedUsers({
      accounts,
      usernames: new Set(['SockA']),
      blockData,
      state: makeState(),
    });

    const [row] = accounts;
    expect(row?.block.block).toBe(true);
    expect(row?.block.duration).toBe('infinity');
    expect(row?.block.tags.filter(isSockpuppetTag).map(tag => tag.master)).toEqual(['Master']);
    expect(blockData.userBlocks.has('SockA')).toBe(true);
  });

  test('keeps the block state the row already carries', async () => {
    // The row went up with the default its import gave it, and the user may have changed
    // it while the lookups were in flight. Neither is ours to reset for an unblocked account
    const accounts = makeAccounts(['SockA', 'SockB']);
    const [likelyRow, possibleRow] = accounts;
    if (likelyRow) {
      likelyRow.block.block = true;
    }
    const blockData = setupBlockActionData();

    await ensureUsersFetched(new Set(['SockA', 'SockB']), blockData.fetchedUsers);
    applyFetchedUsers({
      accounts,
      usernames: new Set(['SockA', 'SockB']),
      blockData,
      state: makeState(),
    });

    expect(likelyRow?.block.block).toBe(true);
    expect(possibleRow?.block.block).toBe(false);
  });

  test('leaves rows it was not asked about alone', () => {
    const accounts = makeAccounts(['SockA', 'SockB']);
    const editedRow = accounts[1];
    if (editedRow) {
      editedRow.block.duration = '1 week';
    }

    applyFetchedUsers({
      accounts,
      usernames: new Set(['SockA']),
      blockData: setupBlockActionData(),
      state: makeState(),
    });

    expect(editedRow?.block.duration).toBe('1 week');
    expect(editedRow?.block.block).toBe(false);
  });
});
