import { type ComponentPublicInstance, type PropType, defineComponent } from 'vue';
import type { BlockOptions, UserRow } from '../../types/spi.ts';
import { isNonRegisteredAccount, isSockpuppetTag } from '../../utils.ts';
import { isOpRunning } from '../../operations.ts';
import { spiHelperGetPageRev } from '../../api.ts';
import { context } from '../../context.ts';
import { cdxIconUpdate } from '@wikimedia/codex-icons';
import { type ModalAction, type PrimaryModalAction } from '@wikimedia/codex';
import { CaseState, loadCaseText, loadSectionText } from '../../state.ts';
import type { BlockEntry } from '../../types/api.ts';
import { spiHelperIsCheckuser } from '../../role.ts';
import { spiHelperCUBlockRegex } from '../../constants/regex.ts';

interface Data {
  popover: {
    show: boolean;
    revId: number;
    cancelAction: ModalAction;
    continueAction: PrimaryModalAction;
  };
  submitElement: ComponentPublicInstance | null;
  cdxIconUpdate: typeof cdxIconUpdate;
}

export const SubmitFormComponent = defineComponent({
  props: {
    actionName: { type: String, required: true },
    checkConflict: { type: Boolean, required: true },
    state: { type: Object as PropType<CaseState>, required: true },
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    blockOptions: { type: Object as PropType<BlockOptions>, required: true },
    blocks: { type: Map as PropType<Map<string, BlockEntry>>, required: true },
    locks: { type: Map as PropType<Map<string, boolean>>, required: true },
    lockComment: { type: String, required: true },
    skipCUVerifyUsers: { type: Set as PropType<Set<string>>, required: true },
    allDisabled: { type: Boolean, required: true },
  },
  emits: ['update:master', 'update:altmaster', 'update:lockComment', 'update:skipCUVerifyUsers', 'onSubmit'],
  data(): Data {
    const cancelAction: ModalAction = { label: 'Cancel' };
    const continueAction: PrimaryModalAction = { label: 'Continue', actionType: 'progressive' };
    return {
      popover: {
        show: false,
        revId: 0,
        cancelAction,
        continueAction,
      },
      submitElement: null,
      cdxIconUpdate,
    };
  },
  computed: {
    needsLockComment() {
      // Also check that our user isn't already locked because we'd skip them eventually
      return this.accounts.some(sock =>
        sock.block.lock
        && !isNonRegisteredAccount(sock.username)
        && this.locks.get(sock.username) !== true,
      );
    },
    hasInvalidTag() {
      return this.accounts.some(user =>
        user.block.tags.some(tag =>
          isSockpuppetTag(tag) && !tag.master,
        ),
      );
    },
    cuBlockConfirmationsNeeded(): Set<string> {
      // If you're not a checkuser, we've asked to overwrite existing blocks, and the block
      // target has a CU block on them, check whether that was intended
      const neededUsers = new Set<string>();
      if (spiHelperIsCheckuser() || !this.blockOptions.override || this.blockOptions.noBlock) {
        return neededUsers;
      }

      for (const userRow of this.accounts) {
        if (!userRow.block.block) {
          continue;
        }
        const blockReason = this.blocks.get(userRow.username)?.reason;
        if (blockReason && spiHelperCUBlockRegex.exec(blockReason)) {
          neededUsers.add(userRow.username);
        }
      }
      return neededUsers;
    },
    cuBlockOverrideChecked: {
      get() {
        return this.skipCUVerifyUsers.size === this.cuBlockConfirmationsNeeded.size;
      },
      set(newValue: boolean) {
        this.$emit('update:skipCUVerifyUsers', newValue ? this.cuBlockConfirmationsNeeded : new Set());
      },
    },
    cuBlockOverrideIndeterminate(): boolean {
      const skipCount = this.skipCUVerifyUsers.size;
      return skipCount > 0 && skipCount < this.cuBlockConfirmationsNeeded.size;
    },
    disableButton() {
      return isOpRunning(this.actionName) || this.allDisabled || this.hasInvalidTag;
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
  mounted() {
    this.submitElement = this.$refs.submitElement as ComponentPublicInstance;
  },
  methods: {
    // Should this be in topView.ts?
    async onSubmit() {
      if (this.checkConflict) {
        // Store it in order to prevent calling spiHelperGetPageRev() again
        this.popover.revId = await spiHelperGetPageRev(context.pageName);
        if (this.popover.revId === context.startingRevId) {
          this.$emit('onSubmit');
        }
        else {
          this.popover.show = true;
        }
      }
      else {
        this.$emit('onSubmit');
      }
    },
    confirmSubmit() {
      this.popover.show = false;
      context.startingRevId = this.popover.revId;
      // Refetch our content. We don't need to await it because spiHelperPerformActions
      // will get our _loadingPromise if it isn't completed
      void (this.state.selectedSection?.type === 'specific'
        ? loadSectionText(this.state.selectedSection.section, { purge: true })
        : loadCaseText(this.state, { purge: true }));
      this.$emit('onSubmit');
    },
  },
  template: `
    <div class="spiHelper-submitForm">
      <cdx-field v-if="needsLockComment">
        <template #label>Lock Comment</template>
        <template #description>Optional comment to include in the global lock request</template>
        <cdx-text-input v-model="lockCommentValue" placeholder="Comment" />
      </cdx-field>
      <cdx-checkbox v-if="cuBlockConfirmationsNeeded.size > 0"
                    v-model="cuBlockOverrideChecked" :indeterminate="cuBlockOverrideIndeterminate">
        Confirm CU-block overriding
        <template #description>You are currently set to override the following CU blocks:
          {{ [...cuBlockConfirmationsNeeded].join(', ') }}
        </template>
      </cdx-checkbox>
      <div>
        <cdx-message v-if="hasInvalidTag" type="error" :inline="true">A user has an invalid tag</cdx-message>
        <cdx-button ref="submitElement" action="progressive" weight="primary" @click="onSubmit"
                    :disabled="disableButton">
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
    </div>
  `,
});
