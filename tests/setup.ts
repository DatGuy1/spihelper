// Minimal stubs for browser globals required at module load time.
// mw.* calls inside function bodies don't need to be exhaustive here —
// only the ones that run during import (e.g. in const initialisers) matter.

(globalThis as Record<string, unknown>).window = globalThis;
(globalThis as Record<string, unknown>).__VERSION__ = '0.0.0-test';
(globalThis as Record<string, unknown>).__MODE__ = 'dev';

(globalThis as Record<string, unknown>).mw = {
  Title: class Title {
    private title: string;
    constructor(title: string) { this.title = title; }
    getMainText() { return this.title.split(':').pop() ?? this.title; }
    toString() { return this.title; }
  },
  config: {
    get: (_key: string) => null,
  },
  util: {
    isIPAddress: () => false,
    isIPv6Address: () => false,
    isTemporaryUser: () => false,
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
    using: (_modules: unknown, callback: (require: (mod: string) => unknown) => void) => {
      callback((_mod: string) => ({ reactive: (x: unknown) => x, defineComponent: () => ({}) }));
    },
  },
};
