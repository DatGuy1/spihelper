import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import * as blockModule from '../src/actions/block.ts';
import * as tagModule from '../src/actions/tag.ts';
import * as apiModule from '../src/api.ts';
import * as roleModule from '../src/role.ts';
import { spiHelperHandleBlocks } from '../src/caseActions.ts';
import { setupBlockActionData } from '../src/utils.ts';
import { type BlockRowData, SockpuppetTag, type UserRow } from '../src/types';

function makeRow(username: string, block: Partial<BlockRowData> = {}): UserRow {
  return {
    id: username,
    username,
    link: {
      analyser: false, timeline: false, timecard: false, pages: false,
      summary: false, cuwiki: false, interleaved: false,
    },
    block: {
      block: true, duration: '1 week', acb: false, abao: false, ntp: false, nem: false,
      lock: false, tags: [], ...block,
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('spiHelperHandleBlocks', () => {
  afterEach(() => {
    mock.restore();
  });

  test('talkNoticePromises and tagPromises are already populated by the time the function returns, before the block API call settles', async () => {
    // Regression test: talkNoticePromises/tagPromises used to only get their entries pushed
    // *after* spiHelperProcessBlockRow resolved, which happens well after this function has
    // already returned. Callers do Promise.all(talkNoticePromises) right away, so those
    // promises were racing against an array that was still empty at that point.
    spyOn(roleModule, 'spiHelperIsAdmin').mockReturnValue(true);
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    spyOn(tagModule, 'createSockCategories').mockResolvedValue(new Map());
    spyOn(apiModule, 'spiHelperGetBulkUserBlockSettings').mockResolvedValue(new Map());
    spyOn(apiModule, 'spiHelperGetBulkPageText').mockResolvedValue(new Map());
    spyOn(blockModule, 'spiHelperAddTalkBlockNotice').mockResolvedValue(undefined);
    spyOn(tagModule, 'spiHelperTagUser').mockResolvedValue(true);

    // Block requests are jittered with a real setTimeout to avoid hitting API rate limits
    // (see caseActions.ts); run the callback immediately so the test doesn't sleep for it.
    spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => {
      fn();
      return 0;
    }) as unknown as typeof setTimeout);

    const blockGate = deferred<boolean>();
    spyOn(blockModule, 'spiHelperProcessBlockRow').mockReturnValue(blockGate.promise);

    const row = makeRow('Vandal', {
      tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
    });

    const { talkNoticePromises, tagPromises, blockPromises } = await spiHelperHandleBlocks({
      accounts: [row],
      blockData: { ...setupBlockActionData(), master: 'Master' },
    });

    // The block API call is still pending (blockGate hasn't resolved), but the arrays
    // the caller is about to Promise.all() must already have their entries.
    expect(talkNoticePromises).toHaveLength(1);
    expect(tagPromises).toHaveLength(1);

    blockGate.resolve(true);
    const [blockedUsers, taggedUsers] = await Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
    ]);
    await Promise.all(talkNoticePromises);

    expect(blockedUsers).toEqual(['Vandal']);
    expect(taggedUsers).toEqual(['Vandal']);
  });

  test('does not tag or send a talk notice when the block fails', async () => {
    spyOn(roleModule, 'spiHelperIsAdmin').mockReturnValue(true);
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    spyOn(tagModule, 'createSockCategories').mockResolvedValue(new Map());
    spyOn(apiModule, 'spiHelperGetBulkUserBlockSettings').mockResolvedValue(new Map());
    spyOn(apiModule, 'spiHelperGetBulkPageText').mockResolvedValue(new Map());
    const talkNoticeSpy = spyOn(blockModule, 'spiHelperAddTalkBlockNotice').mockResolvedValue(undefined);
    const tagSpy = spyOn(tagModule, 'spiHelperTagUser').mockResolvedValue(true);
    spyOn(blockModule, 'spiHelperProcessBlockRow').mockResolvedValue(false);
    spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void) => {
      fn();
      return 0;
    }) as unknown as typeof setTimeout);

    const row = makeRow('Vandal', {
      tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
    });

    const { blockPromises, tagPromises, talkNoticePromises } = await spiHelperHandleBlocks({
      accounts: [row],
      blockData: { ...setupBlockActionData(), master: 'Master' },
    });

    const [blockedUsers, taggedUsers] = await Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
    ]);
    await Promise.all(talkNoticePromises);

    expect(blockedUsers).toEqual([null]);
    expect(taggedUsers).toEqual([null]);
    expect(tagSpy).not.toHaveBeenCalled();
    expect(talkNoticeSpy).not.toHaveBeenCalled();
  });

  test('already-blocked users are tagged without a second, redundant tag call', async () => {
    spyOn(roleModule, 'spiHelperIsAdmin').mockReturnValue(true);
    spyOn(roleModule, 'spiHelperIsCheckuser').mockReturnValue(true);
    spyOn(tagModule, 'createSockCategories').mockResolvedValue(new Map());
    spyOn(apiModule, 'spiHelperGetBulkUserBlockSettings').mockResolvedValue(new Map([
      ['Vandal', {
        username: 'Vandal', duration: 'indefinite', acb: false, abao: false,
        ntp: false, nem: false, reason: '',
      }],
    ]));
    spyOn(apiModule, 'spiHelperGetBulkPageText').mockResolvedValue(new Map());
    const tagSpy = spyOn(tagModule, 'spiHelperTagUser').mockResolvedValue(true);
    const processSpy = spyOn(blockModule, 'spiHelperProcessBlockRow');

    const row = makeRow('Vandal', {
      tags: [new SockpuppetTag({ master: 'Master', status: 'blocked' })],
    });

    const { blockPromises, tagPromises } = await spiHelperHandleBlocks({
      accounts: [row],
      blockData: { ...setupBlockActionData(), master: 'Master' },
    });

    expect(tagPromises).toHaveLength(1);
    const [blockedUsers, taggedUsers] = await Promise.all([
      Promise.all(blockPromises),
      Promise.all(tagPromises),
    ]);

    expect(blockedUsers).toEqual([null]);
    expect(taggedUsers).toEqual(['Vandal']);
    expect(tagSpy).toHaveBeenCalledTimes(1);
    // Already blocked and override is off, so the real block API is never attempted.
    expect(processSpy).not.toHaveBeenCalled();
  });
});
