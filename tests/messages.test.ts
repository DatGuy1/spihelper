import { beforeEach, describe, expect, test } from 'bun:test';
import { watchEffect } from 'vue';
import { VueMessage, messages } from '../src/ui/messages.ts';

beforeEach(() => {
  messages.length = 0;
});

describe('show', () => {
  test('appends the message and records its index', () => {
    const msg = new VueMessage({ type: 'notice', content: 'Editing X' });
    msg.show();
    expect(messages).toEqual([msg]);
    expect(msg._index).toBe(0);
  });

  test('appends at the correct index when messages already exist', () => {
    new VueMessage({ type: 'notice', content: 'first' }).show();
    const second = new VueMessage({ type: 'notice', content: 'second' }).show();
    expect(second._index).toBe(1);
    // Not toBe: reading messages[1] back returns Vue's reactive-proxy wrapper around
    // the same underlying object, not the raw `second` reference itself.
    expect(messages[1]).toEqual(second);
  });
});

describe('update', () => {
  test('shows the message if it has not been shown yet', () => {
    const msg = new VueMessage({ type: 'notice', content: 'Editing X' });
    msg.update({ type: 'success', content: 'Saved X' });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ type: 'success', content: 'Saved X' });
  });

  test('changes the content of the already-shown message in place', () => {
    const msg = new VueMessage({ type: 'notice', content: 'Editing X' }).show();
    msg.update({ type: 'success', content: 'Saved X' });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ type: 'success', content: 'Saved X' });
  });

  test('does not throw if the array was reset out from under it', () => {
    const msg = new VueMessage({ type: 'notice', content: 'Editing X' }).show();
    messages.length = 0;
    expect(() => msg.update({ type: 'success', content: 'Saved X' })).not.toThrow();
  });

  // Regression test: update() used to mutate the raw instance and write that same
  // reference back into its own array slot, which Vue's reactivity never saw (see
  // src/ui/messages.ts). Confirm a reactive watcher actually re-runs after update().
  test('triggers Vue reactivity', async () => {
    const seen: string[] = [];
    watchEffect(() => {
      seen.push(messages.map(m => `${m.type}:${m.content}`).join(','));
    });

    const msg = new VueMessage({ type: 'notice', content: 'Editing X' }).show();
    await Promise.resolve();
    msg.update({ type: 'success', content: 'Saved X' });
    await Promise.resolve();

    expect(seen[seen.length - 1]).toBe('success:Saved X');
  });
});
