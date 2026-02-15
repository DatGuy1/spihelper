import { type PropType, defineComponent } from 'vue';
import { type CaseState } from '../../state.ts';
import { DefaultLinkRow, type FeedbackDialog } from '../../types/vue.ts';
import { spiHelperSettings } from '../../options';
import { VueMessage, messages } from '../messages.ts';
import { cdxIconFeedback, cdxIconPushPin } from '@wikimedia/codex-icons';
import { type BlockActionData, type LinkRow, ParsedArchiveNotice, type SockRow } from '../../types/spi.ts';
import { OpState, finishOp, getOpState, isOpRunning, startOp } from '../../operations.ts';
import type { AllUser } from '../../types/api.ts';
import { HandleUserSelected } from './userLookup.ts';
import { generateSockRow, getDefaultSockRow, setSockRowBlock } from '../utils.ts';
import { spiHelperHandleBlocks } from '../../caseActions.ts';
import { spiHelperLog } from '../../actions/log.ts';
import { context, setContext } from '../../context.ts';
import { buildUserActionLogMessage } from '../../utils.ts';
import { spiHelperParseArchiveNotice } from '../../archivenotice.ts';
import { spiHelperGetPageText, spiHelperGetUserBlockSettings } from '../../api.ts';

interface Data {
  open: boolean;
  _openHandler: ((e: Event) => void) | null;
  _beforeUnloadHandler: ((e: Event) => void) | null;
  caseLoaded: boolean;
  caseLoading: boolean;
  targetCase: string;
  blockData: BlockActionData;
  linkRows: LinkRow[];
  actionsRunning: boolean;
  cdxIconFeedback: typeof cdxIconFeedback;
  cdxIconPushPin: typeof cdxIconPushPin;
  unpinned: boolean;
  messages: VueMessage[];
}

export const CheckUserViewComponent = defineComponent({
  props: {
    state: { type: Object as PropType<CaseState>, required: true },
    feedbackDialog: { type: Object as PropType<FeedbackDialog>, required: true },
    openButton: { type: Object as PropType<HTMLElement>, required: true },
  },
  data(): Data {
    const blockData: BlockActionData = {
      options: {
        noBlock: false,
        override: false,
        tagUnattached: true,
        cuBlock: false,
        cuBlockOnly: false,
        addMasterNotice: true,
        addSockNotice: true,
        blankTalk: false,
        lockHideNames: false,
      },
      accounts: [],
      userLocks: new Map(),
      userBlocks: new Map(),
      master: '',
      altmaster: '',
      lockcomment: '',
    };
    return {
      open: false,
      _openHandler: null,
      _beforeUnloadHandler: null,
      caseLoaded: false,
      caseLoading: false,
      targetCase: '',
      blockData,
      linkRows: [],
      actionsRunning: false,
      unpinned: !spiHelperSettings.interface.pinned,
      messages,
      cdxIconFeedback,
      cdxIconPushPin,
    };
  },
  template: `
    <div id="spiHelper-checkuserView" class="spiHelper-mainCard" v-if="open">
      <div id="spiHelper-checkuserView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="feedbackDialog.launch()">
            <cdx-icon :icon="cdxIconFeedback" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-CaseLoader">
        <page-lookup v-model="targetCase"
                     :namespace="4" prefix="Sockpuppet investigations/"
                     placeholder="Case" label="Case title" />
        <div style="display: flex; gap: 10px;">
          <cdx-button weight="primary" action="progressive" @click="loadCase">Load</cdx-button>
          <cdx-progress-indicator v-show="caseLoading">Loading case</cdx-progress-indicator>
        </div>
      </div>
      <div id="spiHelper-checkuserView-Content" v-if="caseLoaded">
        <div>
          <h4>Link</h4>
          <link-action :enabled="true" :case-name="targetCase"
                       v-model="linkRows"
                       @user-selected="handleLinkUsernameSelected" @username-changed="handleLinkUsernameChange"
                       @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
        <div>
          <h4>Block</h4>
          <block-action :enabled="true" :allow-fetch="false"
                        v-model="blockData.accounts" v-model:block-options="blockData.options"
                        :user-locks="blockData.userLocks" :user-blocks="blockData.userBlocks"
                        @username-changed="handleBlockUsernameChange"
                        @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
      </div>
      <div v-if="caseLoaded">
        <submit-form v-model:socks="blockData.accounts" v-model:master="blockData.master"
                     v-model:altmaster="blockData.altmaster" v-model:lock-comment="blockData.lockcomment"
                     :locks="blockData.userLocks" :state="state" :action-name="'checkuserActions'"
                     :check-conflict="false" :all-disabled="false"
                     @on-submit="onSubmitActions" />
      </div>
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div id="messageRow">
        <cdx-message v-for="(message, index) in messages" :key="index" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `,
  computed: {
    mountPoint() {
      return (this.$el as HTMLElement).parentElement;
    },
    pageName() {
      return `Wikipedia:Sockpuppet investigations/${this.targetCase}`;
    },
  },
  watch: {
    unpinned(newVal) {
      if (!this.mountPoint) {
        console.error('CheckUserView unpinned: Could not find mountPoint');
        return;
      }
      if (newVal) {
        this.mountPoint.classList.add('unpinned');
      }
      else {
        this.mountPoint.classList.remove('unpinned');
      }
      spiHelperSettings.interface.pinned = !newVal;
    },
  },
  methods: {
    handleBlockUsernameChange(newUsername: string, index: number) {
      if (this.linkRows.length < index + 1) {
        console.error('handleBlockUsernameChange: Index', index, 'doesn\'t exist in table');
        return;
      }
      (this.linkRows[index] as LinkRow).username = newUsername;
    },
    handleLinkUsernameChange(newUsername: string, index: number) {
      if (this.blockData.accounts.length < index + 1) {
        console.error('handleLinkUsernameChange: Index', index, 'doesn\'t exist in table');
        return;
      }
      (this.blockData.accounts[index] as SockRow).username = newUsername;
    },
    handleLinkUsernameSelected(data: AllUser, index: number) {
      if (this.blockData.accounts.length < index + 1) {
        console.error('handleLinkUsernameSelected: Index', index, 'doesn\'t exist in table');
        return;
      }
      HandleUserSelected(data, (this.blockData.accounts[index] as SockRow));
    },
    handleAddRow(row?: SockRow) {
      row ??= getDefaultSockRow(this.state.archiveNotice);
      this.blockData.accounts = [
        ...this.blockData.accounts,
        row,
      ];
      this.linkRows = [
        ...this.linkRows,
        { ...DefaultLinkRow, username: row.username },
      ];
    },
    handleRemoveRows(indexes: number[]) {
      this.blockData.accounts = this.blockData.accounts.filter(
        (_row, index) => !indexes.includes(index),
      );
      this.linkRows = this.linkRows.filter(
        (_row, index) => !indexes.includes(index),
      );
    },
    async loadCase() {
      this.caseLoading = true;

      // Set context
      setContext(this.pageName);
      // Load archivenotice params
      const archiveNoticeResult = await spiHelperParseArchiveNotice(this.pageName, this.state);
      if (archiveNoticeResult === null) {
        // No archive notice was found, initialise default
        this.state.archiveNotice = new ParsedArchiveNotice({ username: this.targetCase });
      }
      else {
        this.state.archiveNotice = archiveNoticeResult;
      }

      const userBlock = await spiHelperGetUserBlockSettings(this.targetCase);
      if (userBlock !== null) {
        this.blockData.userBlocks.set(this.targetCase, userBlock);
      }
      const userPageText = await spiHelperGetPageText(this.targetCase, false);
      const { row, isLocked } = await setSockRowBlock({
        sock: generateSockRow(this.targetCase, this.state),
        block: userBlock,
        userPage: userPageText,
        defaultBlock: true,
        state: this.state,
      });
      if (isLocked !== null) {
        this.blockData.userLocks.set(this.targetCase, isLocked);
      }
      this.handleAddRow(row);
      this.blockData.master = this.targetCase;
      this.blockData.altmaster = this.targetCase;

      this.caseLoading = false;
      this.caseLoaded = true;
    },
    async onSubmitActions() {
      if (isOpRunning('checkuserActions')) {
        return;
      }
      mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'submit_checkuser' });
      startOp('checkuserActions');
      this.actionsRunning = true;
      let blockPromises: Promise<string | null>[] = [];
      let tagPromises: Promise<string | null>[] = [];
      let lockPromise: Promise<string[]> = Promise.resolve([]);
      ({ blockPromises, tagPromises, lockPromise } = await spiHelperHandleBlocks(this.blockData));
      const userActionsPromise = Promise.all([
        Promise.all(blockPromises),
        Promise.all(tagPromises),
        lockPromise,
      ]);

      const [blockedUsers, taggedUsers, lockedUsers] = await userActionsPromise;
      if (spiHelperSettings.log.enabled) {
        const logMessage = `* [[:User:${context.userName}]]` + buildUserActionLogMessage({ blockedUsers, taggedUsers, lockedUsers });
        await spiHelperLog(logMessage);
      }

      new VueMessage({ type: 'success', content: 'Done!' }).show();
      finishOp('checkuserActions', OpState.Success);
      this.actionsRunning = false;
    },
  },
  mounted() {
    // Access the parent mount element
    if (!this.mountPoint) {
      console.error('CheckUserViewComponent mounted: Could not find mountPoint');
      return;
    }
    if (this.unpinned) {
      this.mountPoint.classList.add('unpinned');
    }
    else {
      this.mountPoint.classList.remove('unpinned');
    }

    this._beforeUnloadHandler = (e) => {
      const opState = getOpState('checkuserActions');
      // If we have the form open, and we haven't completed successfully, warn the user
      if (opState !== OpState.Success) {
        e.preventDefault();
      }
    };

    this._openHandler = () => {
      this.open = !this.open;
      if (this.open) {
        mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'open_checkuser' });
      }
      if (this._beforeUnloadHandler) {
        if (this.open) {
          window.addEventListener('beforeunload', this._beforeUnloadHandler);
        }
        else {
          window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        }
      }
    };
    this.openButton.addEventListener('click', this._openHandler);
  },
  beforeUnmount() {
    if (this._openHandler) {
      this.openButton.removeEventListener('click', this._openHandler);
    }
    if (this._beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this._beforeUnloadHandler);
    }
  },
});
