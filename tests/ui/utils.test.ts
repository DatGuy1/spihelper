import { afterEach, beforeAll, describe, expect, mock, spyOn, test } from 'bun:test';
import type { MenuGroupData, MenuItemData } from '@wikimedia/codex';
import { setContext } from '../../src/context.ts';
import { spiHelperSettings } from '../../src/options';
import { CaseState } from '../../src/state.ts';
import { ParsedArchiveNotice, SockpuppetTag } from '../../src/types';
import {
  generateUserRow,
  getDefaultUserRow,
  getSockEntries,
  isMenuGroupData,
  pruneMenuData,
  setUserRowBlockData,
  updateUserBlockDataSettings,
} from '../../src/ui/utils.ts';

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

function installJQueryMock(anchors: Element[]): void {
  const cuResult = { find: (_: string) => anchors };
  const docResult = {
    find: (sel: string) => (sel === '.cuEntry' ? cuResult : { find: () => [] }),
  };
  spyOn(globalThis as unknown as { $: () => unknown }, '$').mockImplementation(() => docResult);
}

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

describe('getSockEntries', () => {
  describe('fullSearch: false', () => {
    const state = makeState();

    test('empty text produces empty lists', () => {
      const [likely, possible, all] = getSockEntries({ text: '', fullSearch: false, state });
      expect(likely).toEqual([]);
      expect(possible).toEqual([]);
      expect(all.size).toBe(0);
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
      const [, possible, all] = getSockEntries({
        text: '{{user|SockA}}\n{{vandal|SockA}}',
        fullSearch: false,
        state,
      });
      expect(possible.filter(r => r.username === 'SockA')).toHaveLength(1);
      expect(all.size).toBe(1);
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
    beforeAll(() => {
      setContext('Wikipedia:Sockpuppet investigations/Master');
    });

    test('anchor with a plain text node is included as a sock entry', () => {
      installJQueryMock([makeAnchor(textNode('SockA'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely.map(r => r.username)).toContain('SockA');
    });

    test('leading/trailing whitespace in the text node is trimmed', () => {
      installJQueryMock([makeAnchor(textNode(' SockA '))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely.map(r => r.username)).toContain('SockA');
    });

    test('only the text node is used when a sibling element node is present', () => {
      installJQueryMock([makeAnchor(textNode('RealSock'), elementNode('UserHighlightType'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      const names = likely.map(r => r.username);
      expect(names).toContain('RealSock');
      expect(names).not.toContain('UserHighlightType');
    });

    test('anchor with only an element node (no text node) is skipped entirely', () => {
      installJQueryMock([makeAnchor(elementNode('IgnoredUser'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      const names = likely.map(r => r.username);
      expect(names).not.toContain('IgnoredUser');
      expect(likely).toHaveLength(1); // only the case master
    });

    test('anchor with an empty text node is skipped', () => {
      installJQueryMock([makeAnchor(textNode(''))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely).toHaveLength(1); // only the case master
    });

    test('duplicate usernames from the DOM are deduplicated', () => {
      installJQueryMock([makeAnchor(textNode('SockA')), makeAnchor(textNode('SockA'))]);
      const [likely] = getSockEntries({ text: '', fullSearch: true, state: makeState() });
      expect(likely.filter(r => r.username === 'SockA')).toHaveLength(1);
    });

    test('username already in allUsernames (from template text) is not added from DOM', () => {
      installJQueryMock([makeAnchor(textNode('SockA'))]);
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
