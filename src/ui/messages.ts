import type { StatusType } from '@wikimedia/codex';

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
    const { type, content, isHtml } = opts;
    if (type !== undefined) {
      this.type = type;
    }
    if (content !== undefined) {
      this.content = content;
    }
    if (isHtml !== undefined) {
      this.isHtml = isHtml;
    }
    if (!this._index) {
      this.show();
    }
    messages[this._index!] = this;
    return this;
  }
}

// This is scuffed as fuck.
export let messages: VueMessage[] = [];
mw.loader.using(['vue'], (require) => {
  const Vue = require('vue');
  messages = Vue.reactive(messages);
});
