import { afterEach, describe, expect, test } from 'bun:test';
import { createApp, defineComponent, nextTick, reactive } from 'vue';
import { CdxButton, CdxCheckbox, CdxIcon, CdxTable } from '@wikimedia/codex';
import type { LinkRowData, LinkTool, UserRow } from '../../../../../src/types';
import { LinkActionComponent } from '../../../../../src/ui/views/top';
import type { LinkColumn, LinkRecord } from '../../../../../src/ui/views/top/actions/linkAction.ts';
import { spiHelperBuiltinLinkTools } from '../../../../../src/constants';
import { makeUserRow } from '../../../../fixtures/spi.ts';

interface LinkTestCtx {
  accounts: UserRow[];
  caseName: string;
  linkTools: LinkTool[];
  optionColumns: LinkColumn[];
}

const rawComputed = LinkActionComponent.computed as unknown as {
  optionColumns(this: Omit<LinkTestCtx, 'optionColumns'>): LinkColumn[];
  linkItems(this: LinkTestCtx): LinkRecord;
};

// Only the link columns matter here, so the block half stays at the fixture's defaults
const makeRow = (username: string, link: LinkRowData = {}): UserRow => (
  makeUserRow(username, {}, link)
);

function builtin(id: string): LinkTool {
  const tool = spiHelperBuiltinLinkTools.find(t => t.id === id);
  if (!tool) {
    throw new Error(`No built-in link tool ${id}`);
  }
  return tool;
}

function makeCtx({
  accounts = [] as UserRow[],
  caseName = 'Master',
  tools = [builtin('interleaved')],
}: {
  accounts?: UserRow[];
  caseName?: string;
  tools?: LinkTool[];
} = {}): LinkTestCtx {
  const base = { accounts, caseName, linkTools: tools };
  return { ...base, optionColumns: rawComputed.optionColumns.call(base) };
}

describe('LinkActionComponent', () => {
  describe('optionColumns', () => {
    const tools = [builtin('timecard'), builtin('spitools-timecard')];

    test('keeps tools that use the case name when there is one', () => {
      expect(makeCtx({ tools }).optionColumns.map(c => c.id)).toEqual(['timecard', 'spitools-timecard']);
    });

    test('drops tools that use the case name when there is none', () => {
      expect(makeCtx({ tools, caseName: '' }).optionColumns.map(c => c.id)).toEqual(['timecard']);
    });
  });

  describe('linkItems', () => {
    test('empty accounts produces no links', () => {
      expect(rawComputed.linkItems.call(makeCtx())).toEqual({});
    });

    test('column with no users checked is absent from result', () => {
      const ctx = makeCtx({ accounts: [makeRow('User1')] });
      expect(rawComputed.linkItems.call(ctx).interleaved).toBeUndefined();
    });

    test('labels the link after its column', () => {
      const ctx = makeCtx({ accounts: [makeRow('Sock1', { interleaved: true })] });
      expect(rawComputed.linkItems.call(ctx).interleaved?.label).toBe('Interleaved');
    });

    describe('joined single-param format (interleaved)', () => {
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

    describe('repeated-param format (analyser)', () => {
      const tools = [builtin('analyser')];

      test('each user is appended as a separate param', () => {
        const ctx = makeCtx({
          accounts: [makeRow('User1', { analyser: true }), makeRow('User2', { analyser: true })],
          tools,
        });
        expect(rawComputed.linkItems.call(ctx).analyser?.url.searchParams.getAll('users'))
          .toEqual(['User1', 'User2']);
      });

      test('unchecked user is excluded', () => {
        const ctx = makeCtx({
          accounts: [makeRow('User1', { analyser: true }), makeRow('User2')],
          tools,
        });
        expect(rawComputed.linkItems.call(ctx).analyser?.url.searchParams.getAll('users'))
          .toEqual(['User1']);
      });
    });

    describe('cuwiki', () => {
      const tools = [builtin('cuwiki')];

      test('usernames are wrapped in quotes and joined with OR', () => {
        const ctx = makeCtx({
          accounts: [makeRow('User1', { cuwiki: true }), makeRow('User2', { cuwiki: true })],
          tools,
        });
        expect(rawComputed.linkItems.call(ctx).cuwiki?.url.searchParams.get('search'))
          .toBe('"User1" OR "User2"');
      });

      test('keeps the query string from the tool URL', () => {
        const ctx = makeCtx({ accounts: [makeRow('User1', { cuwiki: true })], tools });
        expect(rawComputed.linkItems.call(ctx).cuwiki?.url.searchParams.get('ns0')).toBe('1');
      });
    });

    test('fills the case name into a tool that uses it', () => {
      const ctx = makeCtx({
        accounts: [makeRow('User1', { 'spitools-pages': true })],
        caseName: 'Some master',
        tools: [builtin('spitools-pages')],
      });
      expect(rawComputed.linkItems.call(ctx)['spitools-pages']?.url.href)
        .toBe('https://spi-tools.toolforge.org/spi/pages/Some%20master?users=User1');
    });
  });

  // The cells render through a v-for of dynamic slot names, which only a real compile exercises
  describe('rendering', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    async function mount(tools: LinkTool[]) {
      const accounts = reactive([makeRow('User1')]);
      const Harness = defineComponent({
        components: { LinkAction: LinkActionComponent },
        setup: () => ({ accounts }),
        template: '<link-action ref="link" :accounts="accounts" case-name="Master" />',
      });
      const el = document.createElement('div');
      document.body.appendChild(el);
      const app = createApp(Harness);
      /* eslint-disable vue/component-definition-name-casing */
      app.component('cdx-table', CdxTable);
      app.component('cdx-checkbox', CdxCheckbox);
      app.component('cdx-button', CdxButton);
      app.component('cdx-icon', CdxIcon);
      /* eslint-enable vue/component-definition-name-casing */
      // The username cell isn't under test; render it as an inert element
      app.config.compilerOptions.isCustomElement = tag => tag === 'user-lookup';
      const vm = app.mount(el) as unknown as { $refs: { link: { linkTools: LinkTool[] } } };
      vm.$refs.link.linkTools = tools;
      await nextTick();
      return { el, accounts };
    }

    test('renders a checkbox per tool in each row, and ticking one makes its link', async () => {
      const { el, accounts } = await mount([builtin('interleaved'), builtin('cuwiki')]);
      // The first cell is the row selection checkbox
      const bodyCheckboxes = el.querySelectorAll<HTMLInputElement>('tbody td:not(:first-child) input[type="checkbox"]');
      expect(bodyCheckboxes.length).toBe(2);

      bodyCheckboxes[1]?.click();
      await nextTick();

      expect(accounts[0]?.link.cuwiki).toBe(true);
      expect([...el.querySelectorAll('ul a')].map(a => a.textContent)).toEqual(['CU wiki']);
    });
  });
});
