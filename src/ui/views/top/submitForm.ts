import { type ComponentPublicInstance, type PropType, defineComponent } from 'vue';
import type { SockRow } from '../../../types/spi.ts';
import { isNonRegisteredAccount } from '../../../utils.ts';
import { isOpRunning } from '../../../operations.ts';
import { spiHelperGetPageRev } from '../../../api.ts';
import { context } from '../../../context.ts';
import { cdxIconUpdate } from '@wikimedia/codex-icons';
import { type ModalAction, type PrimaryModalAction } from '@wikimedia/codex';

interface Data {
  popover: {
    show: boolean;
    cancelAction: ModalAction;
    continueAction: PrimaryModalAction;
  };
  submitElement: ComponentPublicInstance | null;
  cdxIconUpdate: typeof cdxIconUpdate;
}

export const SubmitFormComponent = defineComponent({
  props: {
    socks: { type: Array as PropType<SockRow[]>, required: true },
    locks: { type: Map as PropType<Map<string, boolean>>, required: true },
    master: { type: String, required: true },
    altmaster: { type: String, required: true },
    lockComment: { type: String, required: true },
    allDisabled: { type: Boolean, required: true },
  },
  data(): Data {
    const cancelAction: ModalAction = { label: 'Cancel' };
    const continueAction: PrimaryModalAction = { label: 'Continue', actionType: 'progressive' };
    return {
      popover: {
        show: false,
        cancelAction,
        continueAction,
      },
      submitElement: null,
      cdxIconUpdate,
    };
  },
  emits: ['update:master', 'update:altmaster', 'update:lockComment', 'onSubmit'],
  template: `
    <div class="spiHelper-submitForm">
      <user-lookup v-if="needsSockmaster" label="Master" v-model="masterValue" />
      <user-lookup v-if="needsAltmaster" label="Alternate master" v-model="altmasterValue" />
      <cdx-field v-if="needsLockComment">
        <template #label>Lock Comment</template>
        <template #description>Optional comment to include in the global lock request</template>
        <cdx-text-input v-model="lockCommentValue" placeholder="Comment" />
      </cdx-field>
      <cdx-button ref="submitElement" action="progressive" weight="primary" @click="onSubmit" :disabled="disableButton">
        Submit
      </cdx-button>
      <cdx-popover :anchor="submitElement"
                   v-model:open="popover.show" :icon="cdxIconUpdate" title="Edit Conflict"
                   close-button-label="Cancel"
                   :primary-action="popover.continueAction" @primary="confirmSubmit"
                   :default-action="popover.cancelAction" @default="popover.show = false">
        The page has been edited after you loaded it. Do you want to continue?
      </cdx-popover>
    </div>
  `,
  computed: {
    needsAltmaster() {
      return this.socks.some(sock => sock.altmaster !== 'none' && !isNonRegisteredAccount(sock.username));
    },
    needsSockmaster() {
      return this.socks.some(sock => sock.tag.startsWith('S') && !isNonRegisteredAccount(sock.username));
    },
    needsLockComment() {
      // Also check that our user isn't already locked because we'd skip them eventually
      return this.socks.some(sock =>
        sock.lock
        && !isNonRegisteredAccount(sock.username)
        && this.locks.get(sock.username) !== true,
      );
    },
    disableButton() {
      return isOpRunning('mainActions')
        || this.allDisabled
        || (this.needsSockmaster && !this.master)
        || (this.needsAltmaster && !this.altmaster);
    },
    masterValue: {
      get() {
        return this.master;
      },
      set(value: string) {
        this.$emit('update:master', value);
      },
    },
    altmasterValue: {
      get() {
        return this.altmaster;
      },
      set(value: string) {
        this.$emit('update:altmaster', value);
      },
    },
    lockCommentValue: {
      get() {
        return this.lockComment;
      },
      set(value: string) {
        this.$emit('update:lockComment', value);
      },
    },
  },
  methods: {
    async onSubmit() {
      // Should this be in topView.ts?
      const pageRev = await spiHelperGetPageRev(context.pageName);
      if (pageRev === context.startingRevId) {
        this.$emit('onSubmit');
      }
      else {
        this.popover.show = true;
      }
    },
    confirmSubmit() {
      this.popover.show = false;
      this.$emit('onSubmit');
    },
  },
  mounted() {
    this.submitElement = this.$refs.submitElement as ComponentPublicInstance;
  },
});
