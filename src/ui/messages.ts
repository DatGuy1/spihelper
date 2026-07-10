import type { StatusType } from '@wikimedia/codex';
import type * as VueType from 'vue';

export class VueMessage {
  type: StatusType;
  content: string;
  isHtml?: boolean;

  _index?: number;

  constructor(opts: { type: StatusType; content: string; isHtml?: boolean }) {
    this.type = opts.type;
    this.content = opts.content;
    this.isHtml = opts.isHtml;
  }

  // Adds a message and saves the zero-index to use for updates
  show() {
    const index = messages.length;
    messages.push(this);
    this._index = index;
    return this;
  }

  update(opts: { type?: StatusType; content?: string; isHtml?: boolean }) {
    // If we didn't already show, show it
    if (this._index === undefined) {
      Object.assign(this, opts);
      this.show();
      return this;
    }
    // Otherwise, replace it
    const current = messages[this._index];
    if (current) {
      Object.assign(current, opts);
    }
    Object.assign(this, opts);
    return this;
  }
}

// This is scuffed as fuck.
export let messages: VueMessage[] = [];
mw.loader.using(['vue'], (require) => {
  const Vue = require('vue') as typeof VueType;
  messages = Vue.reactive(messages);
});
