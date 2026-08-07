import { describe, expect, test } from 'bun:test';
import type { LinkRowData, UserRow } from '../../../../../src/types';
import { LinkActionComponent } from '../../../../../src/ui/views/top';
import type { ColumnId, LinkRecord } from '../../../../../src/ui/views/top/actions/linkAction.ts';
import type { LinkFormat } from '../../../../../src/constants';

interface LinkTestCtx {
  accounts: UserRow[];
  caseName: string;
  optionColumns: { id: ColumnId; label: string }[];
  getLinkFormat(columnId: ColumnId): LinkFormat | null;
}

const rawMethods = LinkActionComponent.methods as unknown as {
  getLinkFormat(this: LinkTestCtx, columnId: ColumnId): LinkFormat | null;
};

const rawComputed = LinkActionComponent.computed as unknown as {
  linkItems(this: LinkTestCtx): Partial<LinkRecord>;
};

function makeRow(username: string, link: Partial<LinkRowData> = {}): UserRow {
  return {
    id: username,
    username,
    link: {
      analyser: false,
      timeline: false,
      timecard: false,
      pages: false,
      summary: false,
      cuwiki: false,
      interleaved: false,
      ...link,
    },
    block: {
      block: false,
      duration: '',
      acb: false,
      abao: false,
      ntp: false,
      nem: false,
      lock: false,
      tags: [],
    },
  };
}

function makeCtx({
  accounts = [] as UserRow[],
  caseName = 'Master',
  columns = [{ id: 'interleaved', label: 'Interleaved' }],
}: {
  accounts?: UserRow[];
  caseName?: string;
  columns?: { id: ColumnId; label: string }[];
} = {}): LinkTestCtx {
  const ctx: LinkTestCtx = {
    accounts,
    caseName,
    optionColumns: columns,
    getLinkFormat(columnId) { return rawMethods.getLinkFormat.call(ctx, columnId); },
  };
  return ctx;
}

describe('linkItems', () => {
  test('empty accounts produces no links', () => {
    expect(rawComputed.linkItems.call(makeCtx())).toEqual({});
  });

  test('column with no users checked is absent from result', () => {
    const ctx = makeCtx({ accounts: [makeRow('User1')] });
    expect(rawComputed.linkItems.call(ctx).interleaved).toBeUndefined();
  });

  describe('pipe-separated single-param format (interleaved)', () => {
    test('single user produces correct URL', () => {
      const ctx = makeCtx({ accounts: [makeRow('Sock1', { interleaved: true })] });
      const items = rawComputed.linkItems.call(ctx);
      expect(items.interleaved?.url.searchParams.get('user')).toBe('Sock1');
      expect(items.interleaved?.url.origin).toBe('https://interleaved.toolforge.org');
    });

    test('multiple users are joined with a pipe', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { interleaved: true }), makeRow('User2', { interleaved: true })],
      });
      expect(rawComputed.linkItems.call(ctx).interleaved?.url.searchParams.get('user')).toBe('User1|User2');
    });

    test('unchecked user is excluded', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { interleaved: true }), makeRow('User2')],
      });
      expect(rawComputed.linkItems.call(ctx).interleaved?.url.searchParams.get('user')).toBe('User1');
    });
  });

  describe('multi-key format (analyser)', () => {
    const col = [{ id: 'analyser' as ColumnId, label: 'Interaction Analyser' }];

    test('each user is appended as a separate param', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { analyser: true }), makeRow('User2', { analyser: true })],
        columns: col,
      });
      expect(rawComputed.linkItems.call(ctx).analyser?.url.searchParams.getAll('users'))
        .toEqual(['User1', 'User2']);
    });

    test('unchecked user is excluded', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { analyser: true }), makeRow('User2')],
        columns: col,
      });
      expect(rawComputed.linkItems.call(ctx).analyser?.url.searchParams.getAll('users'))
        .toEqual(['User1']);
    });
  });

  describe('userQueryStringWrapper (cuwiki)', () => {
    const col = [{ id: 'cuwiki' as ColumnId, label: 'CU wiki' }];

    test('usernames are wrapped in quotes and joined with OR', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { cuwiki: true }), makeRow('User2', { cuwiki: true })],
        columns: col,
      });
      expect(rawComputed.linkItems.call(ctx).cuwiki?.url.searchParams.get('search'))
        .toBe('"User1" OR "User2"');
    });
  });

  describe('startingParams', () => {
    test('cuwiki includes ns0=1', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { cuwiki: true })],
        columns: [{ id: 'cuwiki', label: 'CU wiki' }],
      });
      expect(rawComputed.linkItems.call(ctx).cuwiki?.url.searchParams.get('ns0')).toBe('1');
    });
  });
});
