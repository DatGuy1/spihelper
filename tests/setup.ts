// Minimal stubs for browser globals required at module load time.
// mw.* calls inside function bodies don't need to be exhaustive here —
// only the ones that run during import (e.g. in const initialisers) matter.

import jQuery from 'jquery';
import { reactive } from 'vue';

(globalThis as Record<string, unknown>).window = globalThis;
(globalThis as Record<string, unknown>).__VERSION__ = '0.0.0-test';
(globalThis as Record<string, unknown>).__MODE__ = 'dev';

(globalThis as Record<string, unknown>).$ = jQuery;

(globalThis as Record<string, unknown>).mw = {
  Title: class Title {
    private title: string;
    constructor(title: string) { this.title = title; }
    getMainText() { return this.title.split(':').pop() ?? this.title; }
    toString() { return this.title; }
  },
  config: {
    get: (key: string) => {
      if (key === 'wgServer') return '//en.wikipedia.org';
      if (key === 'wgPageParseReport') {
        return { limitreport: { postexpandincludesize: { limit: 2097152 } } };
      }
      return null;
    },
  },
  util: {
    isIPAddress: () => false,
    isIPv6Address: () => false,
    isTemporaryUser: (name?: string | null) => !!name?.startsWith('~'),
    isInfinity: () => false,
    getUrl: (title: string) => `/wiki/${encodeURIComponent(title)}`,
  },
  Api: class Api {
    get() { return Promise.resolve({}); }
    post() { return Promise.resolve({}); }
  },
  ForeignApi: class ForeignApi {
    get() { return Promise.resolve({}); }
    post() { return Promise.resolve({}); }
  },
  user: { options: { get: () => null } },
  loader: {
    // Real Vue.reactive() (not an identity stub) so modules like ui/messages.ts that rely
    // on mw.loader.using(['vue'], ...) to make module-level state reactive actually get
    // working reactivity under tests, instead of a silent no-op.
    using: (_modules: unknown, callback: (require: (mod: string) => unknown) => void) => {
      callback((_mod: string) => ({ reactive, defineComponent: () => ({}) }));
    },
  },
};
