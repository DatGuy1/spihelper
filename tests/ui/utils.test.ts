import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type { MenuGroupData, MenuItemData } from '@wikimedia/codex';
import { spiHelperSettings } from '../../src/options';
import { CaseState } from '../../src/state.ts';
import { ParsedArchiveNotice } from '../../src/types';
import { SockpuppetTag } from '../../src/tags.ts';
import {
  abortableDelay,
  generateUserRow,
  getDefaultUserRow,
  isAborted,
  isMenuGroupData,
  pruneMenuData,
  setUserRowBlockData,
  updateUserBlockDataSettings,
} from '../../src/ui/utils.ts';

function makeState(archiveNotice: ParsedArchiveNotice | null = null): CaseState {
  return new CaseState([], null, archiveNotice);
}

afterEach(() => {
  mock.restore();
});

describe('menu data', () => {
  describe('isMenuGroupData', () => {
    test('returns true for an object with an items property', () => {
      const group: MenuGroupData = { label: 'L', items: [] };
      expect(isMenuGroupData(group)).toBe(true);
    });

    test('returns false for a plain menu item', () => {
      const item: MenuItemData = { value: 'v', label: 'L' };
      expect(isMenuGroupData(item)).toBe(false);
    });
  });

  describe('pruneMenuData', () => {
    test('returns empty array unchanged', () => {
      expect(pruneMenuData([])).toEqual([]);
    });

    test('removes items whose value is falsy', () => {
      const nodes = [
        { value: '', label: 'Bad' },
        { value: 'ok', label: 'Good' },
      ];
      expect(pruneMenuData(nodes)).toEqual([{ value: 'ok', label: 'Good' }]);
    });

    test('keeps items with a truthy value', () => {
      const node = { value: 'foo', label: 'Foo' };
      expect(pruneMenuData([node])).toEqual([node]);
    });

    test('removes a group whose children are all pruned', () => {
      const group: MenuGroupData = { label: 'Empty', items: [{ value: '', label: 'X' }] };
      expect(pruneMenuData([group])).toEqual([]);
    });

    test('keeps a group and strips only its invalid items', () => {
      const group: MenuGroupData = {
        label: 'Mixed',
        items: [
          { value: '', label: 'Bad' },
          { value: 'good', label: 'Good' },
        ],
      };
      const result = pruneMenuData([group]);
      expect(result).toHaveLength(1);
      const item = result[0];
      if (!item || !isMenuGroupData(item)) throw new Error('expected MenuGroupData');
      expect(item.items).toEqual([{ value: 'good', label: 'Good' }]);
    });
  });
});

describe('user rows', () => {
  describe('getDefaultUserRow', () => {
    test('returns a row with default block duration and no special flags', () => {
      const row = getDefaultUserRow(null);
      expect(row.username).toBe('');
      expect(row.block.lock).toBe(false);
      expect(row.block.nem).toBe(false);
      expect(row.block.ntp).toBe(false);
      expect(row.block.duration).toBe(spiHelperSettings.interface.defaultBlockDuration);
    });

    test('crosswiki archive notice sets lock=true', () => {
      const notice = new ParsedArchiveNotice({ username: 'User', crosswiki: true });
      const row = getDefaultUserRow(notice);
      expect(row.block.lock).toBe(true);
      expect(row.block.nem).toBe(false);
      expect(row.block.ntp).toBe(false);
    });

    test('notalk archive notice sets nem=true and ntp=true', () => {
      const notice = new ParsedArchiveNotice({ username: 'User', notalk: true });
      const row = getDefaultUserRow(notice);
      expect(row.block.lock).toBe(false);
      expect(row.block.nem).toBe(true);
      expect(row.block.ntp).toBe(true);
    });

    test('crosswiki + notalk sets lock, nem, and ntp', () => {
      const notice = new ParsedArchiveNotice({ username: 'User', crosswiki: true, notalk: true });
      const row = getDefaultUserRow(notice);
      expect(row.block.lock).toBe(true);
      expect(row.block.nem).toBe(true);
      expect(row.block.ntp).toBe(true);
    });

    test('each call produces a unique id', () => {
      const a = getDefaultUserRow(null);
      const b = getDefaultUserRow(null);
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('updateUserBlockDataSettings', () => {
    test('copies all fields from currentBlock', () => {
      const row = getDefaultUserRow(null);
      const result = updateUserBlockDataSettings({
        userRow: row,
        currentBlock: {
          username: 'User',
          duration: '1 year',
          acb: true,
          abao: false,
          ntp: true,
          nem: false,
          reason: '',
        },
        defaultBlock: false,
      });
      expect(result.block.block).toBe(true);
      expect(result.block.duration).toBe('1 year');
      expect(result.block.acb).toBe(true);
      expect(result.block.abao).toBe(false);
      expect(result.block.ntp).toBe(true);
      expect(result.block.nem).toBe(false);
    });

    test('without currentBlock, block flag mirrors defaultBlock', () => {
      const rowTrue = getDefaultUserRow(null);
      expect(updateUserBlockDataSettings(
        { userRow: rowTrue, defaultBlock: true }).block.block,
      ).toBe(true);

      const rowFalse = getDefaultUserRow(null);
      expect(updateUserBlockDataSettings(
        { userRow: rowFalse, defaultBlock: false }).block.block,
      ).toBe(false);
    });

    test('IP address without currentBlock gets a 1-week duration default', () => {
      spyOn(mw.util, 'isIPAddress').mockReturnValue(true);
      const row = { ...getDefaultUserRow(null), username: '192.0.2.1' };
      const result = updateUserBlockDataSettings({ userRow: row, defaultBlock: false });
      expect(result.block.duration).toBe('1 week');
    });

    test('userPage string is parsed into tags', () => {
      const row = getDefaultUserRow(null);
      const result = updateUserBlockDataSettings({
        userRow: row,
        defaultBlock: false,
        userPage: '{{sockpuppet|1=Master|2=confirmed}}',
      });
      expect(result.block.tags).toHaveLength(1);
      const tag = result.block.tags[0];
      if (!(tag instanceof SockpuppetTag)) throw new Error('expected SockpuppetTag');
      expect(tag.master).toBe('Master');
      expect(tag.status).toBe('confirmed');
    });
  });

  describe('setUserRowBlockData', () => {
    function setRowData(username: string, opts: {
      globalUser?: { name: string; locked: boolean; existsLocally: boolean };
      globalBlock?: { target: string; expiry: string; by: string; reason: string };
      crosswiki?: boolean;
    } = {}) {
      const archiveNotice = opts.crosswiki
        ? new ParsedArchiveNotice({ username: 'Master', crosswiki: true })
        : null;
      return setUserRowBlockData({
        userRow: generateUserRow(username, makeState(archiveNotice)),
        block: undefined,
        defaultBlock: false,
        globalUser: opts.globalUser,
        globalBlock: opts.globalBlock,
        state: makeState(archiveNotice),
      });
    }

    test('a registered account reports its lock state and no global block state', () => {
      const result = setRowData('Sock', {
        globalUser: { name: 'Sock', locked: true, existsLocally: true },
      });

      expect(result.isLocked).toBe(true);
      // Registered accounts are locked rather than globally blocked
      expect(result.isGloballyBlocked).toBeNull();
      expect(result.userRow.block.lock).toBe(true);
    });

    test('a globally blocked temporary account is reported blocked and pre-checked', () => {
      const result = setRowData('~2026-00000-01', {
        globalBlock: {
          target: '~2026-00000-01', expiry: 'infinity', by: 'Steward', reason: 'Long-term abuse',
        },
      });

      expect(result.isGloballyBlocked).toBe(true);
      expect(result.isLocked).toBeNull();
      expect(result.userRow.block.lock).toBe(true);
    });

    test('an unblocked temporary account is reported unblocked rather than unknown', () => {
      const result = setRowData('~2026-00000-01');

      expect(result.isGloballyBlocked).toBe(false);
      expect(result.userRow.block.lock).toBe(false);
    });

    test('an unblocked temporary account is still pre-checked on a crosswiki case', () => {
      const result = setRowData('~2026-00000-01', { crosswiki: true });

      expect(result.isGloballyBlocked).toBe(false);
      expect(result.userRow.block.lock).toBe(true);
    });
  });

  describe('generateUserRow', () => {
    afterEach(() => {
      spiHelperSettings.interface.displayIPv6As64 = true;
    });

    test('regular username is kept as-is', () => {
      expect(generateUserRow('TestUser', makeState()).username).toBe('TestUser');
    });

    test('non-IPv6 IP address is kept as-is', () => {
      spyOn(mw.util, 'isIPAddress').mockReturnValue(true);
      expect(generateUserRow('192.0.2.1', makeState()).username).toBe('192.0.2.1');
    });

    test('IPv6 address is collapsed to /64 block when displayIPv6As64 is enabled', () => {
      spyOn(mw.util, 'isIPAddress').mockReturnValue(true);
      spyOn(mw.util, 'isIPv6Address').mockReturnValue(true);
      expect(generateUserRow('2001:db8:0:1:2:3:4:5', makeState()).username).toBe('2001:db8:0:1:0:0:0:0/64');
    });

    test('IPv6 address is kept as-is when displayIPv6As64 is disabled', () => {
      spyOn(mw.util, 'isIPAddress').mockReturnValue(true);
      spyOn(mw.util, 'isIPv6Address').mockReturnValue(true);
      spiHelperSettings.interface.displayIPv6As64 = false;
      expect(generateUserRow('2001:db8:0:1:2:3:4:5', makeState()).username).toBe('2001:db8:0:1:2:3:4:5');
    });
  });
});

describe('abortableDelay', () => {
  test('resolves once the delay elapses', async () => {
    const controller = new AbortController();
    let elapsed = false;
    const delay = abortableDelay(5, controller.signal).then(() => {
      elapsed = true;
    });
    expect(elapsed).toBe(false);
    await delay;
    expect(elapsed).toBe(true);
    expect(isAborted(controller.signal)).toBe(false);
  });

  test('resolves early, rather than rejecting, when the signal aborts', async () => {
    const controller = new AbortController();
    const delay = abortableDelay(100_000, controller.signal);
    controller.abort();
    await delay;
    expect(isAborted(controller.signal)).toBe(true);
  });

  test('clears the timer it queued when aborted', async () => {
    const clearSpy = spyOn(globalThis, 'clearTimeout');
    const controller = new AbortController();
    const delay = abortableDelay(100_000, controller.signal);
    controller.abort();
    await delay;
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  test('resolves immediately for a signal that has already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await abortableDelay(100_000, controller.signal);
  });
});
