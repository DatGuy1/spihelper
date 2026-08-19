import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import type {
  BlockEntry,
  GlobalBlockEntry,
  GlobalUser,
  PrefetchedUser,
  UserRow,
} from '../../../../../src/types';
import { isSockpuppetTag } from '../../../../../src/utils.ts';
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

const { prefetchSockRows } = await import('../../../../../src/ui/views/top/utils/section.ts');
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
});

describe('prefetchSockRows', () => {
  /** Loads one section's worth of accounts against a cache shared with earlier calls */
  function loadSection(usernames: string[], fetchedUsers: Map<string, PrefetchedUser>) {
    const likelySocks: UserRow[] = usernames.map(name => makeUserRow(name));
    return prefetchSockRows({
      likelySocks,
      possibleSocks: [],
      allUsernames: new Set(usernames),
      userBlocks: new Map<string, BlockEntry>(),
      userLocks: new Map<string, boolean>(),
      userGlobalBlocks: new Map<string, boolean>(),
      fetchedUsers,
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
