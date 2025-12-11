export class MessageDisplay {
  private readonly $container: JQuery<HTMLElement>;

  constructor() {
    const existing = $('#spihelper-message');
    if (existing.length) {
      this.$container = existing;
    }
    else {
      // TODO: Move the .css() to spihelper.css #spihelper-message
      this.$container = $('<div>', {
        id: 'spihelper-message',
      }).css({
        margin: '1em',
        padding: '0.5em 2.5%',
        border: '1px solid var(--border-color-interactive, #ddd)',
        backgroundColor: 'var(--background-color-interactive, #fcfcfc)',
        fontSize: '0.8em',
        display: 'none',
      });
      mw.loader.using('mediawiki.util').then(() => {
        if (mw.util.$content.length) {
          mw.util.$content.prepend(this.$container);
        }
      });
    }
  }

  show() {
    if (this.$container.is(':hidden')) {
      this.$container.slideDown();
    }
  }

  hide() {
    this.$container.empty();
    this.$container.slideUp();
  }

  set(html: string) {
    this.$container.html(html);
  }

  append(html: HTMLElement) {
    this.$container.append(html);
  }
}

// singleton instance
export const messageDisplay = new MessageDisplay();
