import { afterEach, beforeEach, describe, expect, jest, test } from 'bun:test';
import { watchEffect } from 'vue';
import { VueMessage, dismissMessage, messages } from '../../src/ui/messages.ts';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('show', () => {
  test('appends the message and marks it shown', () => {
    const msg = new VueMessage({ type: 'notice', content: 'Editing X' });
    msg.show();
    expect(messages).toEqual([msg]);
    expect(msg._shown).toBe(true);
  });

  test('appends after messages that already exist', () => {
    new VueMessage({ type: 'notice', content: 'first' }).show();
    const second = new VueMessage({ type: 'notice', content: 'second' }).show();
    expect(messages).toHaveLength(2);
    // Not toBe: reading messages[1] back returns Vue's reactive-proxy wrapper around
    // the same underlying object, not the raw `second` reference itself.
    expect(messages[1]).toEqual(second);
  });

  test('gives every message its own id', () => {
    const first = new VueMessage({ type: 'notice', content: 'first' }).show();
    const second = new VueMessage({ type: 'notice', content: 'second' }).show();
    expect(first.id).not.toBe(second.id);
  });
});

describe('showOnce', () => {
  test('does not stack a second copy of a message already on screen', () => {
    new VueMessage({ type: 'warning', content: 'Unreadable tag' }).showOnce();
    const repeat = new VueMessage({ type: 'warning', content: 'Unreadable tag' }).showOnce();

    expect(messages).toHaveLength(1);
    // The suppressed copy never entered the array, so nothing should think it was shown
    expect(repeat._shown).toBe(false);
  });

  test('still shows a message that only differs by content', () => {
    new VueMessage({ type: 'warning', content: 'Unreadable tag on SockA' }).showOnce();
    new VueMessage({ type: 'warning', content: 'Unreadable tag on SockB' }).showOnce();

    expect(messages).toHaveLength(2);
  });

  test('still shows a message that only differs by type', () => {
    new VueMessage({ type: 'warning', content: 'Same words' }).showOnce();
    new VueMessage({ type: 'error', content: 'Same words' }).showOnce();

    expect(messages).toHaveLength(2);
  });

  test('shows again once the duplicate has been dismissed', () => {
    const first = new VueMessage({ type: 'warning', content: 'Unreadable tag' }).showOnce();
    dismissMessage(first.id);
    jest.advanceTimersByTime(300);

    new VueMessage({ type: 'warning', content: 'Unreadable tag' }).showOnce();

    expect(messages).toHaveLength(1);
  });
});

describe('dismissMessage', () => {
  test('removes the dismissed message once the fade has run', () => {
    const first = new VueMessage({ type: 'notice', content: 'first' }).show();
    const second = new VueMessage({ type: 'notice', content: 'second' }).show();

    dismissMessage(first.id);
    // Removal is deferred so Codex's fade-out isn't cut short
    expect(messages).toHaveLength(2);

    jest.advanceTimersByTime(300);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual(second);
  });

  test('still updates the right message after an earlier one is removed', () => {
    const first = new VueMessage({ type: 'notice', content: 'first' }).show();
    const second = new VueMessage({ type: 'notice', content: 'Editing X' }).show();

    dismissMessage(first.id);
    jest.advanceTimersByTime(300);

    // An index stored at show() time would now point past the end of the array
    second.update({ type: 'success', content: 'Saved X' });
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ type: 'success', content: 'Saved X' });
  });

  test('ignores an id that is no longer present', () => {
    const msg = new VueMessage({ type: 'notice', content: 'only' }).show();
    dismissMessage(msg.id);
    dismissMessage(msg.id);
    jest.advanceTimersByTime(300);
    expect(messages).toHaveLength(0);
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
