import { afterAll, mock } from 'bun:test';

// Shapes for the api.ts stubs the action suites install with mock.module. Each suite
// declares its own mock() functions rather than importing shared instances, so call
// history and implementations stay per-file; the suite runs with --isolate, so a
// mock.module no longer reaches the next file either way.

export interface EditPageOpts { title: string; newText: string; summary?: string }

type ApiModule = typeof import('../../src/api.ts');

/**
 * Stub named api.ts exports for the file that calls this, and put the real ones back
 * afterwards
 *
 * Pass locally-declared mock() functions, sharing instances between files would share
 * their call history too. Partial<ApiModule> holds each stub to the real signature.
 */
export async function stubApi(overrides: Partial<ApiModule>): Promise<void> {
  const real = await import('../../src/api.ts');
  const original = { ...real };

  void mock.module('../../src/api.ts', () => overrides);
  afterAll(() => {
    void mock.module('../../src/api.ts', () => original);
  });
}
