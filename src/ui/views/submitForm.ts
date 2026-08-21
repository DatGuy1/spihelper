import { type ComponentPublicInstance, type PropType, defineComponent } from 'vue';
import type { SubmitFormActions, UserRow } from '../../types';
import { isNonRegisteredAccount, parseExpiry } from '../../utils.ts';
import { isSockpuppetTag } from '../../tags.ts';
import { isInputDisabled } from '../utils.ts';
import { isOpRunning } from '../../operations.ts';
import { spiHelperGetPageRev } from '../../api.ts';
import { context } from '../../context.ts';
import { cdxIconUpdate } from '@wikimedia/codex-icons';
import type { ModalAction, PrimaryModalAction } from '@wikimedia/codex';
import { type CaseState, loadCaseText, loadSectionText } from '../../state.ts';
import { spiHelperIsCheckuser } from '../../role.ts';
import { spiHelperCUBlockRegex } from '../../constants';
import { type UnfulfilledClaim, findBlockLeniency, findCommentClaims } from './top/utils';

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
    // These are v-models
    lockComment: { type: String, required: true },
    skipCUVerifyUsers: { type: Set as PropType<Set<string>>, required: true },
    // These are static
    actionName: { type: String, required: true },
    checkConflict: { type: Boolean, required: true },
    state: { type: Object as PropType<CaseState>, required: true },
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    caseActions: { type: Object as PropType<SubmitFormActions>, required: true },
    allDisabled: { type: Boolean, required: true },
  },
  emits: ['update:lockComment', 'update:skipCUVerifyUsers', 'onSubmit'],
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
    effectiveStatus() {
      const status = this.caseActions.status;
      if (!status) {
        return '';
      }
      return status.enabled && status.data.new !== 'nochange'
        ? status.data.new
        : status.data.old;
    },
    /** Rows that will produce an SRG request, whether that's a lock or a global block */
    globalRequestTargets(): UserRow[] {
      const blockAction = this.caseActions.block;
      if (!blockAction.enabled) {
        return [];
      }
      // Also check that our user isn't already actioned because we'd skip them eventually
      return this.accounts.filter(sock =>
        sock.block.lock
        && (isNonRegisteredAccount(sock.username)
          ? blockAction.data.userGlobalBlocks.get(sock.username) !== true
          : blockAction.data.userLocks.get(sock.username) !== true),
      );
    },
    needsLockComment(): boolean {
      return this.globalRequestTargets.length > 0;
    },
    hasInvalidTag() {
      const blockAction = this.caseActions.block;
      if (!blockAction.enabled) {
        return false;
      }
      return this.accounts.some(user =>
        user.block.tags.some(tag =>
          isSockpuppetTag(tag) && !tag.master,
        ),
      );
    },
    hasInvalidMove() {
      const moveAction = this.caseActions.move;
      return moveAction?.enabled === true && !moveAction.data.target;
    },
    hasInvalidDuration() {
      const blockAction = this.caseActions.block;
      if (!blockAction.enabled) return false;
      const { options, userBlocks, userLocks, userGlobalBlocks } = blockAction.data;
      return this.accounts.some(user =>
        !isInputDisabled(user, 'duration', options, userBlocks, userLocks, userGlobalBlocks, this.accounts)
        && parseExpiry(user.block.duration) === null,
      );
    },
    // Claims the comment makes that the submission won't actually carry out
    commentClaims(): UnfulfilledClaim[] {
      const comment = this.caseActions.comment;
      if (!comment?.enabled) {
        return [];
      }
      const blockAction = this.caseActions.block;
      return findCommentClaims(comment.data.text, {
        effectiveStatus: this.effectiveStatus,
        blockPlanned: blockAction.enabled && this.accounts.some(user => user.block.block),
        globalRequestPlanned: this.globalRequestTargets.length > 0,
      });
    },
    // Blocks we're set to override with settings that are less restrictive
    // than the block the user is already under
    lenientOverrides(): { username: string; reasons: string[] }[] {
      const blockAction = this.caseActions.block;
      const { options, userBlocks } = blockAction.data;
      if (!blockAction.enabled || !options.override || options.noBlock) {
        return [];
      }
      const now = new Date();
      return this.accounts.flatMap((user) => {
        const existing = userBlocks.get(user.username);
        if (!user.block.block || !existing) {
          return [];
        }
        const reasons = findBlockLeniency({
          username: user.username,
          existing,
          intended: user.block,
          now,
        });
        return reasons.length > 0 ? [{ username: user.username, reasons }] : [];
      });
    },
    cuBlockConfirmationsNeeded(): Set<string> {
      // If you're not a checkuser, we've asked to overwrite existing blocks, and the block
      // target has a CU block on them, check whether that was intended
      const blockData = this.caseActions.block.data;
      const neededUsers = new Set<string>();
      if (spiHelperIsCheckuser()
        || !this.caseActions.block.enabled
        || !blockData.options.override
        || !blockData.options.noBlock) {
        return neededUsers;
      }

      for (const userRow of this.accounts) {
        if (!userRow.block.block) {
          continue;
        }
        const blockReason = blockData.userBlocks.get(userRow.username)?.reason;
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
      return isOpRunning(this.actionName) || this.allDisabled
        || this.hasInvalidTag || this.hasInvalidMove || this.hasInvalidDuration;
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
      if (this.disableButton) {
        return;
      }
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
      void (this.state.selectedSection?.type === 'single'
        ? loadSectionText(this.state.selectedSection.section, { purge: true })
        : loadCaseText(this.state, { purge: true }));
      this.$emit('onSubmit');
    },
  },
  template: `
    <div class="spiHelper-submitForm">
      <cdx-field v-if="needsLockComment">
        <template #label>Global request comment</template>
        <template #description>Optional comment to include in the global lock/block request</template>
        <cdx-text-area v-model="lockCommentValue" placeholder="Comment" :autosize="true" />
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
        <cdx-message v-if="hasInvalidMove" type="error" :inline="true"><b>Move</b> is enabled but has no target</cdx-message>
        <cdx-message v-if="hasInvalidDuration" type="error" :inline="true">A user has an invalid block duration</cdx-message>
        <cdx-message v-for="claim in commentClaims" :key="claim.quoted + claim.reason"
                     type="warning" :inline="true">
          The comment includes {{ claim.quoted }}, but {{ claim.reason }}
        </cdx-message>
        <cdx-message v-for="override in lenientOverrides" :key="override.username"
                     type="warning" :inline="true">
          Overriding <b>{{ override.username }}</b>'s existing block with a more lenient one:
          {{ override.reasons.join(', ') }}
        </cdx-message>
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
