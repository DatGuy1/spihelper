import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { chunkArray, spiHelperGetBulkGlobalUsers } from '../src/api.ts';
import type { GlobalUsersResponse } from '../src/types';

describe('chunkArray', () => {
  test('splits into equal chunks', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  test('last chunk is smaller when length is not divisible by size', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('returns empty array for empty input', () => {
    expect(chunkArray([], 5)).toEqual([]);
  });

  test('returns one chunk when size exceeds array length', () => {
    expect(chunkArray([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });

  test('returns single-element chunks when size is 1', () => {
    expect(chunkArray(['a', 'b', 'c'], 1)).toEqual([['a'], ['b'], ['c']]);
  });

  test('preserves element order within and across chunks', () => {
    const input = [10, 20, 30, 40, 50, 60];
    const result = chunkArray(input, 3);
    expect(result).toEqual([[10, 20, 30], [40, 50, 60]]);
  });
});

describe('spiHelperGetBulkGlobalUsers', () => {
  // getApiChunkSize() reads the user's rights to pick the batch size; the setup.ts
  // stub has no getRights, so add one for the duration of these tests
  const mwUser = mw.user as unknown as { getRights?: () => Promise<string[]> };
  // spiHelperGetAPI() hands back an mw.Api built at module load, so the stub goes on the
  // prototype rather than on the (unexported) instance
  let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;

  /** Replies to every request with the single batch given */
  function respondWith(globalusers: GlobalUsersResponse['query']['globalusers']) {
    post.mockResolvedValue({ query: { globalusers } });
  }

  beforeEach(() => {
    post = spyOn(mw.Api.prototype, 'post');
    // No apihighlimits, so batches cap at 50
    mwUser.getRights = () => Promise.resolve([]);
  });

  afterEach(() => {
    mock.restore();
    delete mwUser.getRights;
  });

  test('maps an attached account to existsLocally', async () => {
    respondWith([
      { name: 'Attached', centralid: 1, locked: false, localinfo: { attached: true, localid: 5 } },
    ]);

    const result = await spiHelperGetBulkGlobalUsers(new Set(['Attached']));

    expect(result.get('Attached')).toEqual({
      name: 'Attached', locked: false, existsLocally: true,
    });
  });

  test('a global account with no local attachment does not exist locally', async () => {
    respondWith([{ name: 'Unattached', centralid: 2, locked: true, localinfo: { attached: false } }]);

    const result = await spiHelperGetBulkGlobalUsers(new Set(['Unattached']));

    expect(result.get('Unattached')).toEqual({
      name: 'Unattached', locked: true, existsLocally: false,
    });
  });

  test('omits names the API reports as missing or invalid', async () => {
    // An IP comes back invalid; a name with no global account comes back missing
    respondWith([
      { name: 'NoSuchUser', missing: true },
      { name: '127.0.0.1', invalid: true },
      { name: 'Real', centralid: 3, locked: false, localinfo: { attached: true } },
    ]);

    const result = await spiHelperGetBulkGlobalUsers(
      new Set(['NoSuchUser', '127.0.0.1', 'Real']),
    );

    expect([...result.keys()]).toEqual(['Real']);
  });

  test('splits over the 50-name limit into multiple requests and merges the results', async () => {
    const usernames = Array.from({ length: 120 }, (_, i) => `User${i}`);
    // Echo back whichever names the chunk asked for
    post.mockImplementation(((request: { gususers: string[] }) => Promise.resolve({
      query: {
        globalusers: request.gususers.map(name => ({
          name, centralid: 1, locked: false, localinfo: { attached: true },
        })),
      },
    })) as unknown as typeof mw.Api.prototype.post);

    const result = await spiHelperGetBulkGlobalUsers(new Set(usernames));

    // 120 names without apihighlimits is three requests of at most 50
    expect(post).toHaveBeenCalledTimes(3);
    expect(result.size).toBe(120);
  });

  test('makes no request at all for an empty set', async () => {
    const result = await spiHelperGetBulkGlobalUsers(new Set());

    expect(post).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });

  test('returns an empty map rather than throwing when the request fails', async () => {
    post.mockRejectedValue(new Error('network'));

    const result = await spiHelperGetBulkGlobalUsers(new Set(['Someone']));

    expect(result.size).toBe(0);
  });
});
