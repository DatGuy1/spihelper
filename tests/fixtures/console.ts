import { spyOn } from 'bun:test';

/**
 * Silences console.error for tests that deliberately exercise a failure path, so the
 * expected log doesn't make a passing run look broken. Returns the spy, so the test can
 * still assert that the failure was reported.
 *
 * Relies on the suite restoring spies (mock.restore() in afterEach).
 */
export function silenceConsoleError() {
  return spyOn(console, 'error').mockImplementation(() => { /* suppress expected error log */ });
}
