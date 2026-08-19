import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { silenceConsoleError } from './fixtures/console.ts';
import {
  chunkArray,
  spiHelperGetBulkGlobalBlocks,
  spiHelperGetBulkGlobalUsers,
  spiHelperGetBulkPageRestrictions,
  spiHelperGetBulkPageText,
  spiHelperGetPages,
  spiHelperGetUsers,
} from '../src/api.ts';
import type {
  GlobalBlocksResponse,
  GlobalUsersResponse,
  PendingChanges,
  Protection,
} from '../src/types';

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
  // spiHelperGetAPI() hands back an mw.Api built at module load, so the stub goes on the
  // prototype rather than on the (unexported) instance
  let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;

  /** Replies to every request with the single batch given */
  function respondWith(globalusers: GlobalUsersResponse['query']['globalusers']) {
    post.mockResolvedValue({ query: { globalusers } });
  }

  beforeEach(() => {
    post = spyOn(mw.Api.prototype, 'post');
  });

  afterEach(() => {
    mock.restore();
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

  test('rejects rather than returning a map missing the failed chunk', async () => {
    const apiError = new Error('network');
    post.mockRejectedValue(apiError);

    const error = await spiHelperGetBulkGlobalUsers(new Set(['Someone'])).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('spiHelperGetBulkGlobalUsers failed');
    expect((error as Error).cause).toBe(apiError);
  });
});

describe('spiHelperGetBulkGlobalBlocks', () => {
  let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;

  type GlobalBlock = GlobalBlocksResponse['query']['globalblocks'][number];

  function makeBlock(overrides: Partial<GlobalBlock> & { target?: string }): GlobalBlock {
    return {
      id: '1',
      by: 'Steward',
      bywiki: 'metawiki',
      timestamp: '2026-01-01T00:00:00Z',
      expiry: 'infinity',
      reason: 'Long-term abuse',
      anononly: false,
      automatic: false,
      ...overrides,
    };
  }

  function respondWith(globalblocks: GlobalBlock[]) {
    post.mockResolvedValue({ query: { globalblocks } });
  }

  beforeEach(() => {
    post = spyOn(mw.Api.prototype, 'post');
  });

  afterEach(() => {
    mock.restore();
  });

  test('keys the block by its target', async () => {
    respondWith([makeBlock({ target: '~2026-00000-01' })]);

    const result = await spiHelperGetBulkGlobalBlocks(new Set(['~2026-00000-01']));

    expect(result.get('~2026-00000-01')).toEqual({
      target: '~2026-00000-01',
      expiry: 'infinity',
      by: 'Steward',
      reason: 'Long-term abuse',
    });
  });

  test('handles IPs and ranges the same way as accounts', async () => {
    respondWith([
      makeBlock({ target: '192.0.2.1' }),
      makeBlock({ target: '2001:DB8:0:0:0:0:0:0/32' }),
      makeBlock({ target: 'Spammer' }),
    ]);

    const result = await spiHelperGetBulkGlobalBlocks(
      new Set(['192.0.2.1', '2001:DB8:0:0:0:0:0:0/32', 'Spammer']),
    );

    expect([...result.keys()]).toEqual([
      '192.0.2.1', '2001:DB8:0:0:0:0:0:0/32', 'Spammer',
    ]);
  });

  test('skips autoblocks, which hide the target they were derived from', async () => {
    respondWith([
      makeBlock({ automatic: true }),
      makeBlock({ target: '~2026-00000-02' }),
    ]);

    const result = await spiHelperGetBulkGlobalBlocks(new Set(['~2026-00000-02']));

    expect([...result.keys()]).toEqual(['~2026-00000-02']);
  });

  test('leaves unblocked targets out of the map rather than storing a null', async () => {
    respondWith([makeBlock({ target: 'Blocked' })]);

    const result = await spiHelperGetBulkGlobalBlocks(new Set(['Blocked', 'NotBlocked']));

    expect(result.has('NotBlocked')).toBe(false);
    expect(result.size).toBe(1);
  });

  // bglimit caps how many blocks come back at once, so one chunk's results can arrive over
  // several responses. Dropping the tail would read as "those targets aren't blocked", which
  // is indistinguishable from the normal case
  test('follows the continuation and merges targets split across responses', async () => {
    post
      .mockResolvedValueOnce({
        query: { globalblocks: [makeBlock({ target: 'First' })] },
        continue: { bgcontinue: '1|2', continue: '-||' },
      })
      .mockResolvedValueOnce({ query: { globalblocks: [makeBlock({ target: 'Second' })] } });

    const result = await spiHelperGetBulkGlobalBlocks(new Set(['First', 'Second']));

    expect(post).toHaveBeenCalledTimes(2);
    expect([...result.keys()]).toEqual(['First', 'Second']);
  });

  test('splits over the 50-target limit into multiple requests and merges the results', async () => {
    const targets = Array.from({ length: 120 }, (_, i) => `~2026-00000-${i}`);
    post.mockImplementation(((request: { bgtargets: string[] }) => Promise.resolve({
      query: {
        globalblocks: request.bgtargets.map(target => makeBlock({ target })),
      },
    })) as unknown as typeof mw.Api.prototype.post);

    const result = await spiHelperGetBulkGlobalBlocks(new Set(targets));

    expect(post).toHaveBeenCalledTimes(3);
    expect(result.size).toBe(120);
  });

  test('makes no request at all for an empty set', async () => {
    const result = await spiHelperGetBulkGlobalBlocks(new Set());

    expect(post).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });

  test('rejects rather than returning a map missing the failed chunk', async () => {
    const apiError = new Error('network');
    post.mockRejectedValue(apiError);

    const error = await spiHelperGetBulkGlobalBlocks(new Set(['~2026-00000-01']))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('spiHelperGetBulkGlobalBlocks failed');
    expect((error as Error).cause).toBe(apiError);
  });
});

describe('spiHelperGetBulkPageText', () => {
  let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;

  /** One response's worth of pages, in the shape prop=revisions returns */
  function pagesFor(titles: string[]) {
    return titles.map((title, index) => ({
      pageid: index + 1,
      title,
      revisions: [{ slots: { main: { content: `content of ${title}` } } }],
    }));
  }

  beforeEach(() => {
    post = spyOn(mw.Api.prototype, 'post');
  });

  afterEach(() => {
    mock.restore();
  });

  test('makes a single request when the response is complete', async () => {
    post.mockResolvedValue({ query: { pages: pagesFor(['User:A', 'User:B']) } });

    const result = await spiHelperGetBulkPageText(['User:A', 'User:B']);

    expect(post).toHaveBeenCalledTimes(1);
    expect(result.get('User:A')).toBe('content of User:A');
    expect(result.get('User:B')).toBe('content of User:B');
  });

  test('follows the continue token and merges the truncated remainder', async () => {
    // The API truncates once a response would exceed $wgAPIMaxResultSize and hands back a
    // token instead of erroring, so the pages left out arrive only on the next round
    post
      .mockResolvedValueOnce({
        query: { pages: pagesFor(['User:A']) },
        continue: { rvcontinue: '123|456', continue: '||' },
      })
      .mockResolvedValueOnce({ query: { pages: pagesFor(['User:B']) } });

    const result = await spiHelperGetBulkPageText(['User:A', 'User:B']);

    expect(post).toHaveBeenCalledTimes(2);
    expect(result.get('User:A')).toBe('content of User:A');
    expect(result.get('User:B')).toBe('content of User:B');
  });

  test('passes the continuation parameters back on the follow-up request', async () => {
    post
      .mockResolvedValueOnce({
        query: { pages: pagesFor(['User:A']) },
        continue: { rvcontinue: '123|456', continue: '||' },
      })
      .mockResolvedValueOnce({ query: { pages: pagesFor(['User:B']) } });

    await spiHelperGetBulkPageText(['User:A', 'User:B']);

    expect(post.mock.calls[1]?.[0]).toMatchObject({ rvcontinue: '123|456', continue: '||' });
  });

  test('resolves normalised titles under the name that was asked for', async () => {
    post.mockResolvedValue({
      query: {
        normalized: [{ from: 'User:some_sock', to: 'User:Some sock' }],
        pages: pagesFor(['User:Some sock']),
      },
    });

    const result = await spiHelperGetBulkPageText(['User:some_sock']);

    expect(result.get('User:some_sock')).toBe('content of User:Some sock');
    expect(result.get('User:Some sock')).toBe('content of User:Some sock');
  });

  test('makes no request at all for an empty list', async () => {
    const result = await spiHelperGetBulkPageText([]);

    expect(post).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });

  describe('when the text cannot be fetched in full', () => {
    test('rejects rather than returning the pages that did come back', async () => {
      post
        .mockResolvedValueOnce({
          query: { pages: pagesFor(['User:A']) },
          continue: { rvcontinue: '123|456', continue: '||' },
        })
        .mockRejectedValueOnce(new Error('network'));

      const error = await spiHelperGetBulkPageText(['User:A', 'User:B']).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('spiHelperGetBulkPageText failed');
    });

    test('names the failing pages and keeps the underlying error as the cause', async () => {
      const apiError = new Error('http');
      post.mockRejectedValue(apiError);

      const error = await spiHelperGetBulkPageText(['User talk:A']).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('User talk:A');
      expect((error as Error).cause).toBe(apiError);
    });

    test('rejects instead of truncating when the continuation never terminates', async () => {
      post.mockResolvedValue({
        query: { pages: pagesFor(['User:A']) },
        continue: { rvcontinue: '123|456', continue: '||' },
      });

      const error = await spiHelperGetBulkPageText(['User:A', 'User:B']).catch((e: unknown) => e);

      expect((error as Error).cause).toMatchObject({
        message: expect.stringMatching(/still continuing after \d+ rounds/) as unknown as string,
      });
    });
  });
});

describe('spiHelperGetBulkPageRestrictions', () => {
  const semiProtection: Protection[] = [
    { type: 'edit', level: 'autoconfirmed', expiry: 'infinity' },
  ];
  /* eslint-disable camelcase -- these are the API's own field names */
  const pendingChanges: PendingChanges = {
    stable_revid: 1,
    level: 1,
    level_text: 'stable',
    protection_level: 'autoconfirmed',
    protection_expiry: 'infinity',
  };
  /* eslint-enable camelcase */
  let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;

  beforeEach(() => {
    post = spyOn(mw.Api.prototype, 'post');
  });

  afterEach(() => {
    mock.restore();
  });

  test('records the protection and pending changes it got back', async () => {
    post.mockResolvedValue({
      query: {
        pages: [{
          title: 'Wikipedia:Sockpuppet investigations/Foo',
          protection: semiProtection,
          flagged: pendingChanges,
        }],
      },
    });

    const result = await spiHelperGetBulkPageRestrictions(['Wikipedia:Sockpuppet investigations/Foo']);

    expect(result.get('Wikipedia:Sockpuppet investigations/Foo')).toEqual({
      protection: semiProtection,
      pendingChanges,
    });
  });

  test('resolves normalised titles under the name that was asked for', async () => {
    post.mockResolvedValue({
      query: {
        normalized: [{
          from: 'Wikipedia:Sockpuppet investigations/Foo_bar',
          to: 'Wikipedia:Sockpuppet investigations/Foo bar',
        }],
        pages: [{
          title: 'Wikipedia:Sockpuppet investigations/Foo bar',
          protection: semiProtection,
        }],
      },
    });

    const result = await spiHelperGetBulkPageRestrictions([
      'Wikipedia:Sockpuppet investigations/Foo_bar',
    ]);

    expect(result.get('Wikipedia:Sockpuppet investigations/Foo_bar')?.protection)
      .toEqual(semiProtection);
    expect(result.get('Wikipedia:Sockpuppet investigations/Foo bar')?.protection)
      .toEqual(semiProtection);
  });

  test('rejects rather than returning a map missing the failed chunk', async () => {
    const apiError = new Error('network');
    post.mockRejectedValue(apiError);

    const error = await spiHelperGetBulkPageRestrictions(['Wikipedia:Sockpuppet investigations/Foo'])
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('spiHelperGetBulkPageRestrictions failed');
    expect((error as Error).cause).toBe(apiError);
  });

  test('makes no request at all for an empty list', async () => {
    const result = await spiHelperGetBulkPageRestrictions([]);

    expect(post).not.toHaveBeenCalled();
    expect(result.size).toBe(0);
  });
});

describe('fetchInChunks chunk sizing', () => {
  let post: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'post'>>;
  let getRights: ReturnType<typeof spyOn<typeof mw.user, 'getRights'>>;

  /** n distinct usernames, so the Set doesn't collapse them */
  const names = (n: number) => new Set(Array.from({ length: n }, (_, i) => `User${i}`));

  beforeEach(() => {
    post = spyOn(mw.Api.prototype, 'post');
    post.mockResolvedValue({ query: { globalusers: [] } });
    getRights = spyOn(mw.user, 'getRights');
    getRights.mockResolvedValue([]);
  });

  afterEach(() => {
    mock.restore();
  });

  test('does not ask for rights when the targets fit in one low-limit chunk', async () => {
    await spiHelperGetBulkGlobalUsers(names(50));

    expect(getRights).not.toHaveBeenCalled();
    expect(post).toHaveBeenCalledTimes(1);
  });

  test('asks for rights once the targets exceed the low limit', async () => {
    await spiHelperGetBulkGlobalUsers(names(51));

    expect(getRights).toHaveBeenCalled();
  });

  test('splits past the low limit into low-limit chunks without apihighlimits', async () => {
    await spiHelperGetBulkGlobalUsers(names(51));

    expect(post).toHaveBeenCalledTimes(2);
  });

  test('keeps past the low limit in one chunk with apihighlimits', async () => {
    getRights.mockResolvedValue(['apihighlimits']);

    await spiHelperGetBulkGlobalUsers(names(51));

    expect(post).toHaveBeenCalledTimes(1);
  });
});

describe('lookup requests', () => {
  let get: ReturnType<typeof spyOn<typeof mw.Api.prototype, 'get'>>;

  beforeEach(() => {
    get = spyOn(mw.Api.prototype, 'get');
  });

  afterEach(() => {
    get.mockRestore();
  });

  test('spiHelperGetUsers forwards the abort signal to the request', async () => {
    get.mockImplementation((() =>
      Promise.resolve({ query: { allusers: [] } })) as unknown as typeof mw.Api.prototype.get);
    const controller = new AbortController();

    await spiHelperGetUsers({ from: 'Foo', limit: 10, signal: controller.signal });

    expect(get.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
  });

  test('spiHelperGetUsers treats a failed lookup as no matches', async () => {
    const errorSpy = silenceConsoleError();
    get.mockImplementation((() =>
      Promise.reject(new Error('network'))) as unknown as typeof mw.Api.prototype.get);

    expect(await spiHelperGetUsers({ from: 'Foo', limit: 10 })).toEqual([]);
    errorSpy.mockRestore();
  });

  test('spiHelperGetPages forwards the abort signal to the request', async () => {
    get.mockImplementation((() =>
      Promise.resolve({ query: { allpages: [] } })) as unknown as typeof mw.Api.prototype.get);
    const controller = new AbortController();

    await spiHelperGetPages({ from: 'Foo', namespace: 4, limit: 10, signal: controller.signal });

    expect(get.mock.calls[0]?.[1]?.signal).toBe(controller.signal);
  });

  test('spiHelperGetPages logs a failed lookup', async () => {
    const errorSpy = silenceConsoleError();
    get.mockImplementation((() =>
      Promise.reject(new Error('network'))) as unknown as typeof mw.Api.prototype.get);

    expect(await spiHelperGetPages({ from: 'Foo', namespace: 4, limit: 10 })).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  test('spiHelperGetPages stays quiet when the lookup was aborted', async () => {
    const errorSpy = silenceConsoleError();
    const controller = new AbortController();
    // Aborting is what makes the request reject, so it happens in that order
    get.mockImplementation((() => {
      controller.abort();
      return Promise.reject(new Error('aborted'));
    }) as unknown as typeof mw.Api.prototype.get);

    expect(await spiHelperGetPages({
      from: 'Foo', namespace: 4, limit: 10, signal: controller.signal,
    })).toBeNull();
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
