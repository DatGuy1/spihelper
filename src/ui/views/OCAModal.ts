import { type PropType, defineComponent } from 'vue';
import { VueMessage, messages } from '../messages.ts';
import { spiHelperOneClickArchive } from '../../caseActions.ts';
import type { CaseState } from '../../state.ts';

interface Data {
  _activateHandler: ((e: Event) => void) | null;
  open: boolean;
  archiving: boolean;
  messages: VueMessage[];
}

export const OneClickArchivalComponent = defineComponent({
  props: {
    state: { type: Object as PropType<CaseState>, required: true },
    activateButton: { type: Object as PropType<HTMLElement>, required: true },
  },
  data(): Data {
    return {
      _activateHandler: null,
      open: false,
      archiving: false,
      messages,
    };
  },
  template: `
    <cdx-dialog v-model:open="open" title="One Click Archival">
      <cdx-progress-bar v-if="archiving" aria-label="Archival in progress" />
      <div style="margin-top: 12px;">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </cdx-dialog>
  `,
  mounted() {
    this._activateHandler = () => {
      // Clear any messages we have in-place to maintain reactivity
      messages.length = 0;
      this.open = true;
      this.archiving = true;
      mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'submit_oca' });
      spiHelperOneClickArchive(this.state).then(
        () => { this.archiving = false; },
        () => { /* empty */ },
      );
    };
    this.activateButton.addEventListener('click', this._activateHandler);
  },
  beforeUnmount() {
    if (this._activateHandler) {
      this.activateButton.removeEventListener('click', this._activateHandler);
    }
  },
});
