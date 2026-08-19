// Disclaimer: this test file is AI-generated
import { afterEach, beforeEach, describe, expect, jest, spyOn, test } from 'bun:test';
import { reactive } from 'vue';
import type { MenuItemData } from '@wikimedia/codex';
import type { AllPage, AllUser } from '../../../src/types';
import { PageLookupComponent, UserLookupComponent } from '../../../src/ui/views';

interface ListParams {
  auprefix?: string; aulimit?: number;
  apprefix?: string; aplimit?: number | 'max';
}
type ApiGet = (params: ListParams, options?: { signal?: AbortSignal }) => Promise<unknown>;
const apiPrototype = (mw.Api as unknown as { prototype: { get: ApiGet } }).prototype;
let apiGet: ReturnType<typeof spyOn<{ get: ApiGet }, 'get'>>;

const request = (call: number) => apiGet.mock.calls[call]?.[0];
const requestQuery = (call: number) => request(call)?.auprefix ?? request(call)?.apprefix;
const requestLimit = (call: number) => request(call)?.aulimit ?? request(call)?.aplimit;
const requestSignal = (call: number) => apiGet.mock.calls[call]?.[1]?.signal;

/** Answer every request with these labels. */
function respond(lookup: { envelope(labels: string[]): unknown }, labels: string[]) {
  apiGet.mockImplementation(() => Promise.resolve(lookup.envelope(labels)));
}

/** Leave the next request in flight; the returned function answers it. */
function respondLater(lookup: { envelope(labels: string[]): unknown }) {
  let settle: (response: unknown) => void = () => { /* replaced below */ };
  const inFlight = new Promise<unknown>((resolve) => {
    settle = resolve;
  });
  apiGet.mockImplementationOnce(() => inFlight);
  return (labels: string[]) => {
    settle(lookup.envelope(labels));
  };
}

// The two lookups are the same component with different nouns: the search, debounce and
// abort behaviour they share is described once and run against both, while what only one
// does - trimming, prefix stripping - has its own describe at the bottom.
interface LookupCase<Ctx extends LookupCtx> {
  name: string;
  /** Hand-built `this` for the component's methods; `input` is its modelValue prop. */
  makeCtx(input?: string): Ctx;
  /** What the component should ask the API for, given typed input. */
  query(input: string): string;
  /** The API response body carrying these labels. */
  envelope(labels: string[]): unknown;
}

interface LookupCtx {
  searchController: AbortController | null;
  /** Alias for userSuggestions/pageSuggestions, so the shared tests needn't care which. */
  suggestions: MenuItemData[];
  menuConfig: { visibleItemLimit: number; searchQuery: string };
  cancelPendingSearch(): void;
  startSearch(): AbortSignal;
  onUpdateInputValue(value: string): Promise<void>;
  onFocus(): void;
  onLoadMore(): Promise<void>;
}

// defineComponent returns the options object at runtime; cast its methods to a typed shape
// so they can be called with a hand-built context object.
interface LookupMethods {
  cancelPendingSearch(this: LookupCtx): void;
  startSearch(this: LookupCtx): AbortSignal;
  onUpdateInputValue(this: LookupCtx, value: string): Promise<void>;
  onFocus(this: LookupCtx): void;
  onLoadMore(this: LookupCtx): Promise<void>;
}

const labelsOf = (ctx: LookupCtx) => ctx.suggestions.map(item => item.label);
const menuItems = (labels: string[]): MenuItemData[] =>
  labels.map((label, index) => ({ label, value: (index + 1).toString() }));

/** Binds the component's methods to a plain object, with its suggestions array aliased. */
function buildCtx<T extends LookupCtx>(
  methods: LookupMethods,
  suggestionsKey: 'userSuggestions' | 'pageSuggestions',
  state: Omit<T, keyof LookupCtx>,
): T {
  const ctx = {
    ...state,
    searchController: null,
    menuConfig: { visibleItemLimit: 6, searchQuery: '' },
    cancelPendingSearch(this: LookupCtx) { methods.cancelPendingSearch.call(this); },
    startSearch(this: LookupCtx) { return methods.startSearch.call(this); },
    onUpdateInputValue(this: LookupCtx, value: string) {
      return methods.onUpdateInputValue.call(this, value);
    },
    onFocus(this: LookupCtx) { methods.onFocus.call(this); },
    onLoadMore(this: LookupCtx) { return methods.onLoadMore.call(this); },
  };

  // Defined rather than spread in, which would call a getter instead of carrying it over
  const store = ctx as unknown as Record<string, unknown>;
  Object.defineProperty(ctx, 'suggestions', {
    enumerable: true,
    get() { return store[suggestionsKey]; },
    set(items: MenuItemData[]) { store[suggestionsKey] = items; },
  });
  return ctx as unknown as T;
}

interface UserCtx extends LookupCtx {
  username: string;
  userSuggestions: (MenuItemData & { customData: AllUser })[];
}

interface PageCtx extends LookupCtx {
  pagename: string;
  prefix: string;
  namespace: number;
  fullPagename: string;
  pageSuggestions: MenuItemData[];
  // The component calls these on itself, so the hand-built `this` has to carry them
  toMenuItems(pages: AllPage[]): MenuItemData[];
  stripTitle(fullTitle: string): string;
}

const userMethods = UserLookupComponent.methods as unknown as LookupMethods;
const pageMethods = PageLookupComponent.methods as unknown as LookupMethods & {
  toMenuItems(this: PageCtx, pages: AllPage[]): MenuItemData[];
  stripTitle(this: PageCtx, fullTitle: string): string;
};

const makeUsers = (labels: string[]): AllUser[] =>
  labels.map((name, index) => ({ name, userid: index + 1 }));
const makePages = (labels: string[]): AllPage[] =>
  labels.map((title, index) => ({
    title: `Sockpuppet investigations/${title}`, pageid: index + 1, ns: 4,
  }));

const userCase: LookupCase<UserCtx> = {
  name: 'UserLookupComponent',
  query: input => input.trim(),
  envelope: labels => ({ query: { allusers: makeUsers(labels) } }),
  makeCtx: (input = '') => buildCtx<UserCtx>(userMethods, 'userSuggestions', {
    username: input,
    userSuggestions: [],
  }),
};

const pageCase: LookupCase<PageCtx> = {
  name: 'PageLookupComponent',
  query: input => `Sockpuppet investigations/${input}`,
  envelope: labels => ({ query: { allpages: makePages(labels) } }),
  makeCtx(input = '') {
    const ctx: PageCtx = buildCtx<PageCtx>(pageMethods, 'pageSuggestions', {
      pagename: input,
      prefix: 'Sockpuppet investigations/',
      namespace: 4,
      pageSuggestions: [],
      toMenuItems: (pages: AllPage[]) => pageMethods.toMenuItems.call(ctx, pages),
      stripTitle: (fullTitle: string) => pageMethods.stripTitle.call(ctx, fullTitle),
    } as unknown as Omit<PageCtx, keyof LookupCtx>);
    // The fullPagename computed, off whatever pagename holds when it's read
    Object.defineProperty(ctx, 'fullPagename', {
      enumerable: true,
      get(this: PageCtx) { return `${this.prefix}${this.pagename}`; },
    });
    return ctx;
  },
};

beforeEach(() => {
  // Carries both list shapes, so the default suits whichever lookup is under test
  apiGet = spyOn(apiPrototype, 'get').mockImplementation(() =>
    Promise.resolve({ query: { allusers: [], allpages: [] } }));
  // The debounce is driven by hand so the tests don't wait it out, and so a search can be
  // superseded at either stage: before its timer fires, or while its request is out.
  jest.useFakeTimers();
});

afterEach(() => {
  apiGet.mockRestore();
  jest.useRealTimers();
});

function describeLookup<Ctx extends LookupCtx>(lookup: LookupCase<Ctx>) {
  describe(lookup.name, () => {
    describe('startSearch', () => {
      test('returns a live signal and stores the controller', () => {
        const ctx = lookup.makeCtx();
        const signal = ctx.startSearch();
        expect(signal.aborted).toBe(false);
        expect(ctx.searchController).not.toBeNull();
      });

      test('aborts the previous search', () => {
        const ctx = lookup.makeCtx();
        const first = ctx.startSearch();
        const second = ctx.startSearch();
        expect(first.aborted).toBe(true);
        expect(second.aborted).toBe(false);
      });

      test('works on reactive state, where the component actually runs', () => {
        // Vue leaves an AbortController unproxied (reactive() only wraps plain objects and
        // collections), which is why data() can hold one and still call abort() on it
        const ctx = reactive(lookup.makeCtx());
        const first = ctx.startSearch();
        ctx.startSearch();
        expect(first.aborted).toBe(true);
      });
    });

    describe('cancelPendingSearch', () => {
      test('aborts the current search and drops the controller', () => {
        const ctx = lookup.makeCtx();
        const signal = ctx.startSearch();
        ctx.cancelPendingSearch();
        expect(signal.aborted).toBe(true);
        expect(ctx.searchController).toBeNull();
      });

      test('is a no-op when no search is in flight', () => {
        const ctx = lookup.makeCtx();
        expect(() => {
          ctx.cancelPendingSearch();
        }).not.toThrow();
      });
    });

    describe('onUpdateInputValue', () => {
      test('waits out the debounce before requesting anything', async () => {
        const ctx = lookup.makeCtx('Foo');
        const search = ctx.onUpdateInputValue('Foo');
        expect(apiGet).not.toHaveBeenCalled();

        // Just short of SEARCH_DEBOUNCE_MS
        jest.advanceTimersByTime(249);
        expect(apiGet).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);
        await search;
        expect(apiGet).toHaveBeenCalledTimes(1);
      });

      test('populates the menu with what came back', async () => {
        respond(lookup, ['Foo']);
        const ctx = lookup.makeCtx('Foo');
        const search = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await search;

        expect(requestQuery(0)).toBe(lookup.query('Foo'));
        expect(labelsOf(ctx)).toEqual(['Foo']);
      });

      test('hands the request a signal so it can be aborted mid-flight', async () => {
        const ctx = lookup.makeCtx('Foo');
        const search = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await search;

        expect(requestSignal(0)).toBeInstanceOf(AbortSignal);
        expect(requestSignal(0)?.aborted).toBe(false);
      });

      test('empty input clears the menu and cancels the search in flight', async () => {
        const ctx = lookup.makeCtx('Foo');
        const started = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await started;
        ctx.suggestions = menuItems(['Foo']);

        await ctx.onUpdateInputValue('');
        expect(requestSignal(0)?.aborted).toBe(true);
        expect(labelsOf(ctx)).toEqual([]);
        expect(apiGet).toHaveBeenCalledTimes(1);
      });

      test('a keystroke during the debounce replaces the queued search', async () => {
        const ctx = lookup.makeCtx('Fo');
        const superseded = ctx.onUpdateInputValue('Fo');
        const current = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await Promise.all([superseded, current]);

        expect(apiGet).toHaveBeenCalledTimes(1);
        expect(requestQuery(0)).toBe(lookup.query('Foo'));
      });

      test('a slow response that lost the race does not overwrite the newer one', async () => {
        const settleSlow = respondLater(lookup);
        const ctx = lookup.makeCtx('Fo');
        const superseded = ctx.onUpdateInputValue('Fo');
        jest.runAllTimers();

        respond(lookup, ['Foo']);
        const current = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await current;

        // The first request only comes back now, after the newer one already landed
        settleSlow(['Fo']);
        await superseded;

        expect(requestSignal(0)?.aborted).toBe(true);
        expect(labelsOf(ctx)).toEqual(['Foo']);
      });

      test('an empty result from the current search clears the menu', async () => {
        respond(lookup, []);
        const ctx = lookup.makeCtx('Foo');
        ctx.suggestions = menuItems(['Stale']);
        const search = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await search;

        expect(labelsOf(ctx)).toEqual([]);
      });

      test('a superseded request coming back empty leaves the newer suggestions alone', async () => {
        const settleAborted = respondLater(lookup);
        const ctx = lookup.makeCtx('Fo');
        const superseded = ctx.onUpdateInputValue('Fo');
        jest.runAllTimers();

        respond(lookup, ['Foo']);
        const current = ctx.onUpdateInputValue('Foo');
        jest.runAllTimers();
        await current;

        // An aborted request comes back with nothing, which must not clear the menu
        settleAborted([]);
        await superseded;

        expect(labelsOf(ctx)).toEqual(['Foo']);
      });
    });

    describe('onLoadMore', () => {
      test('asks for a bigger page of the same query', async () => {
        respond(lookup, ['Foo']);
        const ctx = lookup.makeCtx('Foo');
        ctx.suggestions = menuItems(['Foo']);
        await ctx.onLoadMore();

        expect(requestQuery(0)).toBe(lookup.query('Foo'));
        expect(requestLimit(0)).toBe(11);
      });

      test('does nothing without any input', async () => {
        const ctx = lookup.makeCtx('');
        await ctx.onLoadMore();
        expect(apiGet).not.toHaveBeenCalled();
      });

      test('keeps the existing suggestions when it comes back empty', async () => {
        respond(lookup, []);
        const ctx = lookup.makeCtx('Foo');
        ctx.suggestions = menuItems(['Foo']);
        await ctx.onLoadMore();

        expect(labelsOf(ctx)).toEqual(['Foo']);
      });

      test('a typed search supersedes a load-more still in flight', async () => {
        const settleSlow = respondLater(lookup);
        const ctx = lookup.makeCtx('Foo');
        const loadMore = ctx.onLoadMore();

        respond(lookup, ['Foobar']);
        const search = ctx.onUpdateInputValue('Foobar');
        jest.runAllTimers();
        await search;

        settleSlow(['Foo', 'Foo2']);
        await loadMore;

        expect(labelsOf(ctx)).toEqual(['Foobar']);
      });

      test('load-more aborts a debounce that has not fired yet', async () => {
        const ctx = lookup.makeCtx('Foo');
        const superseded = ctx.onUpdateInputValue('Foo');
        const loadMore = ctx.onLoadMore();
        jest.runAllTimers();
        await Promise.all([superseded, loadMore]);

        // Only the load-more request went out; the queued search was dropped
        expect(apiGet).toHaveBeenCalledTimes(1);
        expect(requestLimit(0)).toBe(10);
      });
    });

    describe('onFocus', () => {
      test('loads suggestions when the menu is empty', () => {
        const ctx = lookup.makeCtx('Foo');
        ctx.onFocus();
        expect(apiGet).toHaveBeenCalledTimes(1);
      });

      test('leaves an already-populated menu alone', () => {
        const ctx = lookup.makeCtx('Foo');
        ctx.suggestions = menuItems(['Foo']);
        ctx.onFocus();
        expect(apiGet).not.toHaveBeenCalled();
      });
    });
  });
}

describeLookup(userCase);
describeLookup(pageCase);

describe('UserLookupComponent specifics', () => {
  test('searches on the trimmed value', async () => {
    const ctx = userCase.makeCtx('Foo ');
    const search = ctx.onUpdateInputValue('Foo ');
    jest.runAllTimers();
    await search;

    expect(requestQuery(0)).toBe('Foo');
    expect(ctx.menuConfig.searchQuery).toBe('Foo');
  });

  test('keeps the API record on the menu item, for the block table to read back', async () => {
    apiGet.mockImplementation(() =>
      Promise.resolve({ query: { allusers: [{ name: 'Foo', userid: 7, blockid: 3 }] } }));
    const ctx = userCase.makeCtx('Foo');
    const search = ctx.onUpdateInputValue('Foo');
    jest.runAllTimers();
    await search;

    expect(ctx.userSuggestions[0]?.customData).toMatchObject({ userid: 7, blockid: 3 });
  });
});

describe('PageLookupComponent specifics', () => {
  test('searches the typed value even if the prop has not caught up', async () => {
    // The parent hasn't emitted the update back yet, so pagename still holds the old text
    const ctx = pageCase.makeCtx('Fo');
    const search = ctx.onUpdateInputValue('Foo');
    jest.runAllTimers();
    await search;

    expect(requestQuery(0)).toBe(`Sockpuppet investigations/Foo`);
  });

  test('strips the prefix off the titles it shows', () => {
    const ctx = pageCase.makeCtx('Foo');
    expect(ctx.toMenuItems(makePages(['Foo']))).toEqual([{ label: 'Foo', value: '1' }]);
  });

  test('drops archive subpages', () => {
    const ctx = pageCase.makeCtx('Foo');
    const items = ctx.toMenuItems(makePages(['Foo', 'Foo/Archive']));
    expect(items).toEqual([{ label: 'Foo', value: '1' }]);
  });
});
