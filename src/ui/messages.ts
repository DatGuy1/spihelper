import type { StatusType } from '@wikimedia/codex';
import type { reactive as ReactiveFn } from 'vue';

// How long Codex takes to fade a dismissed message out (.cdx-message-leave-active-user)
const DISMISS_FADE_MS = 250;

let nextMessageId = 0;

export class VueMessage {
  type: StatusType;
  content: string;
  isHtml?: boolean;

  readonly id = nextMessageId++;
  _shown = false;

  constructor(opts: { type: StatusType; content: string; isHtml?: boolean }) {
    this.type = opts.type;
    this.content = opts.content;
    this.isHtml = opts.isHtml;
  }

  show() {
    this._shown = true;
    messages.push(this);
    return this;
  }

  /**
   * Show unless an identical message is already on screen.
   */
  showOnce() {
    const alreadyShown = messages.some(message => message.type === this.type
      && message.content === this.content
      && message.isHtml === this.isHtml);
    return alreadyShown ? this : this.show();
  }

  update(opts: { type?: StatusType; content?: string; isHtml?: boolean }) {
    // If we didn't already show, show it
    if (!this._shown) {
      Object.assign(this, opts);
      this.show();
      return this;
    }
    // Reading the array back gives a reactive proxy around this instance rather than the
    // instance itself, so match on id. Assign through the proxy before touching the raw
    // instance, doing it the other way round leaves the proxy's setter with nothing
    // changed, and the update never reaches the DOM
    const current = messages.find(message => message.id === this.id);
    if (current) {
      Object.assign(current, opts);
    }
    Object.assign(this, opts);
    return this;
  }
}

/*
 * Drops a message the user dismissed. Codex emits as the fade begins rather than when it
 * ends, so wait it out to avoid cutting the animation short
 */
export function dismissMessage(id: number) {
  setTimeout(() => {
    const index = messages.findIndex(message => message.id === id);
    if (index !== -1) {
      messages.splice(index, 1);
    }
  }, DISMISS_FADE_MS);
}

// Vue isn't loaded when this module is evaluated, so the array starts out plain and
// bootstrap swaps it for a reactive one. The wiring has to stay out of module scope:
// api.ts imports this file, so a top-level mw.loader.using(['vue']) would fetch Vue on
// every page the user visits, including all the ones where spihelper bails out
export let messages: VueMessage[] = [];
export function setMessagesReactive(reactive: typeof ReactiveFn) {
  messages = reactive(messages);
}
