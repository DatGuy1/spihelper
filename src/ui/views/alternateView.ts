import { type PropType, defineComponent } from 'vue';
import type { CaseState } from '../../state.ts';
import {
  type AllUser,
  type BlockActionData,
  type FeedbackDialog,
  ParsedArchiveNotice,
  type SubmitFormActions,
  type UserRow,
} from '../../types';
import { spiHelperSettings } from '../../options';
import { VueMessage, dismissMessage, messages } from '../messages.ts';
import { cdxIconFeedback, cdxIconPushPin } from '@wikimedia/codex-icons';
import { OpState, finishOp, getOpState, isOpRunning, startOp } from '../../operations.ts';
import { UpdateUserAllUserData } from './userLookup.ts';
import {
  generateUserRow,
  getDefaultUserRow,
  getSockEntries,
  setUserRowBlockData,
  updateUserBlockDataSettings,
} from '../utils.ts';
import { spiHelperHandleBlocks } from '../../caseActions.ts';
import { spiHelperLog } from '../../actions';
import { context, setContext } from '../../context.ts';
import { buildUserActionLogMessage, setupBlockActionData, spiHelperNormalizeUsername } from '../../utils.ts';
import { spiHelperParseArchiveNotice } from '../../archivenotice.ts';
import { spiHelperGetCategoryMembers, spiHelperGetPageText, spiHelperGetUserBlockSettings } from '../../api.ts';
import { prefetchSockRows } from './top/utils';
import { MODE, VERSION } from '../../constants';

interface Data {
  open: boolean;
  openHandler: ((e: Event) => void) | null;
  beforeUnloadHandler: ((e: Event) => void) | null;
  caseLoaded: boolean;
  caseLoading: boolean;
  accountsLoading: boolean;
  targetCase: string;
  blockData: BlockActionData;
  accounts: UserRow[];
  actionsRunning: boolean;
  cdxIconFeedback: typeof cdxIconFeedback;
  cdxIconPushPin: typeof cdxIconPushPin;
  unpinned: boolean;
  messages: VueMessage[];
}

const SPI_CASE_REGEX = /\[\[(?:Wikipedia|WP):(?:Sockpuppet investigations|SPI)\/([^\]]+)/i;

export const AlternateViewComponent = defineComponent({
  props: {
    state: { type: Object as PropType<CaseState>, required: true },
    feedbackDialog: { type: Object as PropType<FeedbackDialog>, required: true },
    openButton: { type: Object as PropType<HTMLElement>, required: true },
    defaultCase: { type: String, required: false, default: '' },
    view: { type: String as PropType<'category' | 'checkuser' | 'si'>, required: true },
  },
  data(): Data {
    return {
      open: false,
      openHandler: null,
      beforeUnloadHandler: null,
      caseLoaded: false,
      caseLoading: false,
      accountsLoading: false,
      targetCase: this.defaultCase,
      blockData: setupBlockActionData(),
      accounts: [],
      actionsRunning: false,
      unpinned: !spiHelperSettings.interface.pinned,
      messages,
      cdxIconFeedback,
      cdxIconPushPin,
    };
  },
  computed: {
    mountPoint() {
      return (this.$el as HTMLElement).parentElement;
    },
    pageName() {
      return `Wikipedia:Sockpuppet investigations/${this.targetCase}`;
    },
    // What submit-form takes. This view has no case text, so block is the only action
    caseActions(): SubmitFormActions {
      return {
        block: {
          enabled: true,
          data: this.blockData,
        },
      };
    },
  },
  watch: {
    unpinned(newVal) {
      if (!this.mountPoint) {
        console.error('AlternateView unpinned: Could not find mountPoint');
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
  mounted() {
    // Access the parent mount element
    if (!this.mountPoint) {
      console.error('AlternateViewComponent mounted: Could not find mountPoint');
      return;
    }
    if (this.unpinned) {
      this.mountPoint.classList.add('unpinned');
    }
    else {
      this.mountPoint.classList.remove('unpinned');
    }

    this.beforeUnloadHandler = (e) => {
      const opState = getOpState('alternateActions');
      // If we have the form open, and we haven't completed successfully, warn the user
      if (opState !== OpState.Success) {
        e.preventDefault();
      }
    };

    this.openHandler = () => {
      this.open = !this.open;
      if (this.open) {
        mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'open', type: 'alternate' });
        if (!this.caseLoaded) {
          switch (this.view) {
            case 'category':
              void this.initialiseCategoryView();
              break;
            case 'checkuser':
              void this.initialiseCheckUserView();
              break;
            case 'si':
              void this.initialiseSIView();
              break;
          }
        }
      }
      if (this.beforeUnloadHandler) {
        if (this.open) {
          window.addEventListener('beforeunload', this.beforeUnloadHandler);
        }
        else {
          window.removeEventListener('beforeunload', this.beforeUnloadHandler);
        }
      }
    };
    this.openButton.addEventListener('click', this.openHandler);
  },
  beforeUnmount() {
    if (this.openHandler) {
      this.openButton.removeEventListener('click', this.openHandler);
    }
    if (this.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  },
  methods: {
    dismissMessage,
    handleUserSelected(data: AllUser, rowId: string) {
      const userRow = this.accounts.find(r => r.id === rowId);
      if (!userRow) {
        return;
      }
      if (data.blockid !== undefined
        && !this.blockData.userBlocks.has(userRow.username)) {
        const ABAO = mw.util.isIPAddress(data.name) ? data.blockanononly : data.blockautoblocking;
        this.blockData.userBlocks.set(userRow.username, {
          username: userRow.username,
          duration: data.blockexpiry ?? '',
          abao: ABAO ?? false,
          acb: data.blocknocreate ?? false,
          ntp: data.blockowntalk ?? false,
          nem: data.blockemail ?? false,
          reason: '',
        });
      }
      UpdateUserAllUserData(data, userRow);
    },
    handleAddRow(row?: UserRow) {
      row ??= getDefaultUserRow(this.state.archiveNotice);
      this.accounts.push(row);
    },
    handleRemoveRows(rowIds: string[]) {
      this.accounts = this.accounts.filter(row => !rowIds.includes(row.id));
    },
    async handleFetchRows() {
      let clipboardText: string;
      try {
        clipboardText = await navigator.clipboard.readText();
      }
      catch (err) {
        console.error('handleFetchRows failed to read clipboard:', err);
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          new VueMessage({ type: 'warning', content: 'Failed to read clipboard. You may need to press \'paste\' in the confirmation popup' }).show();
        }
        return;
      }
      const [likelySocks, possibleSocks] = getSockEntries({
        text: clipboardText,
        fullSearch: false,
        state: this.state,
      });
      const likelySet = new Set(likelySocks);

      const allRows = [...likelySocks, ...possibleSocks].map(sock => updateUserBlockDataSettings({
        userRow: sock,
        defaultBlock: likelySet.has(sock),
      }));
      this.massAddUserRows(allRows);
    },
    massAddUserRows(newRows: UserRow[]) {
      const existingUsernames = new Set(this.accounts.map(s => s.username));
      newRows.forEach((newRow) => {
        if (!existingUsernames.has(newRow.username)) {
          this.handleAddRow(newRow);
        }
      });
    },
    async loadCase(addRow: boolean) {
      this.caseLoading = true;

      // Set context
      setContext(this.pageName, 'alternate');
      if (this.targetCase) {
        // Load archivenotice params
        const archiveNoticeResult = await spiHelperParseArchiveNotice({
          page: this.pageName,
          state: this.state,
        });
        context.valid = archiveNoticeResult !== null;
        if (archiveNoticeResult === null) {
          // No archive notice was found, initialise default
          this.state.archiveNotice = new ParsedArchiveNotice({ username: this.targetCase });
        }
        else {
          this.state.archiveNotice = archiveNoticeResult;
        }

        if (addRow) {
          const [userBlock, userPageText] = await Promise.all([
            spiHelperGetUserBlockSettings(this.targetCase),
            spiHelperGetPageText(`User:${this.targetCase}`, false),
          ]);
          if (userBlock !== null) {
            this.blockData.userBlocks.set(this.targetCase, userBlock);
          }
          const { userRow, isLocked } = setUserRowBlockData({
            userRow: generateUserRow(this.targetCase, this.state),
            block: userBlock ?? undefined,
            userPage: userPageText,
            defaultBlock: true,
            globalUser: undefined,
            globalBlock: undefined,
            state: this.state,
          });
          if (isLocked !== null) {
            this.blockData.userLocks.set(this.targetCase, isLocked);
          }
          // Add or replace
          const oldIndex = this.accounts.findIndex(user => user.username === userRow.username);
          if (oldIndex === -1) {
            this.accounts.splice(0, 0, userRow);
          }
          else {
            this.accounts.splice(oldIndex, 1, userRow);
          }
        }
      }
      else {
        context.valid = false;
      }
      this.blockData.master = spiHelperNormalizeUsername(this.targetCase);

      this.caseLoading = false;
      this.caseLoaded = true;
    },
    async onSubmitActions() {
      if (isOpRunning('alternateActions')) {
        return;
      }
      mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'submit', type: 'alternate' });
      startOp('alternateActions');
      this.actionsRunning = true;
      try {
        const {
          blockPromises, tagPromises, talkNoticePromises, globalRequestPromise,
        } = await spiHelperHandleBlocks({
          accounts: this.accounts,
          blockData: this.blockData,
        });
        const userActionsPromise = Promise.all([
          Promise.all(blockPromises),
          Promise.all(tagPromises),
          globalRequestPromise,
        ]);
        const talkNoticePromise = Promise.all(talkNoticePromises);

        const [blockedUsers, taggedUsers, globalRequests] = await userActionsPromise;
        await talkNoticePromise;
        if (spiHelperSettings.log.enabled) {
          const logMessage = `* [[:User:${context.userName}]]` + buildUserActionLogMessage({
            blockedUsers,
            taggedUsers,
            lockedUsers: globalRequests.lockedUsers,
            globalBlockedUsers: globalRequests.globalBlockedUsers,
          });
          await spiHelperLog(logMessage);
        }

        new VueMessage({ type: 'success', content: 'Done!' }).show();
        finishOp('alternateActions', OpState.Success);
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        new VueMessage({
          type: 'error',
          content: `Actions stopped: ${message}. Reload and try again. If the issue persists, file a bug report`,
        }).show();
        finishOp('alternateActions', OpState.Failed);
      }
      finally {
        this.blockData.fetchedUsers.clear();
        this.actionsRunning = false;
      }
    },
    async initialiseCategoryView() {
      if (this.defaultCase === '' || this.caseLoading || this.caseLoaded) {
        return;
      }

      const [, suspectedMembers, confirmedMembers] = await Promise.all([
        this.loadCase(false),
        spiHelperGetCategoryMembers(`Category:Suspected Wikipedia sockpuppets of ${this.targetCase}`),
        spiHelperGetCategoryMembers(`Category:Wikipedia sockpuppets of ${this.targetCase}`),
      ]);

      const BuildUserRow = (member: string, likely: boolean): UserRow => {
        const userRow = { ...generateUserRow(member.replace('User:', ''), this.state) };
        userRow.block.block = likely;
        return userRow;
      };
      const likelySocks = [...confirmedMembers, `User:${this.targetCase}`].map(
        member => BuildUserRow(member, true),
      );
      const possibleSocks = suspectedMembers.map(
        member => BuildUserRow(member, false),
      );
      const allUsernames = new Set([...likelySocks, ...possibleSocks].map(sock => sock.username));
      // loadCase has already cleared caseLoading, so without this the form sits there
      // looking finished while the account lookups are still in flight
      this.accountsLoading = true;
      try {
        const allRows = await prefetchSockRows({
          likelySocks,
          possibleSocks,
          allUsernames,
          userBlocks: this.blockData.userBlocks,
          userLocks: this.blockData.userLocks,
          userGlobalBlocks: this.blockData.userGlobalBlocks,
          fetchedUsers: this.blockData.fetchedUsers,
          state: this.state,
        });
        this.massAddUserRows(allRows);
      }
      finally {
        this.accountsLoading = false;
      }
    },
    async initialiseCheckUserView() {
      // First check for SPI in reason box. If not found, fallback to search target
      const $reasonSearchOrigin: JQuery = $('form#checkuserform', document);
      const searchReason = $('#checkreason input', $reasonSearchOrigin).val();

      if (typeof searchReason === 'string') {
        const caseName = SPI_CASE_REGEX.exec(searchReason)?.[1];
        if (caseName) {
          this.targetCase = caseName;
          return;
        }
      }

      const searchTarget = $('#checktarget input', $reasonSearchOrigin).val();
      if (typeof searchTarget === 'string') {
        // So people don't accidentally leak IPs. Unsure if necessary.
        if (!mw.util.isIPAddress(searchTarget, true)) {
          this.targetCase = searchTarget;
        }
      }

      const $userSearchOrigin: JQuery<Element> | JQuery<Document> = $('table.mw-checkuser-helper-table', document);
      const sockList = $userSearchOrigin.find('td > a.mw-userlink > bdi');
      await this.populateUserRows(sockList);
    },
    async initialiseSIView() {
      const $searchOrigin: JQuery<Element> | JQuery<Document> = $('ul.mw-checkuser-suggestedinvestigations-users', document);
      const sockList = $searchOrigin.find('li > a.mw-userlink > bdi');
      await this.populateUserRows(sockList);
    },
    async populateUserRows(sockElementList: JQuery<Element>) {
      const allSocks: UserRow[] = [];
      const allUsernames = new Set<string>();
      for (const entryElement of sockElementList) {
        const username = spiHelperNormalizeUsername($(entryElement).text());
        if (allUsernames.has(username)) {
          continue;
        }
        allSocks.push(generateUserRow(username, this.state));
        allUsernames.add(username);
      }
      if (allSocks.length > 0 && allSocks[0]) {
        this.targetCase = allSocks[0].username;
      }
      this.accountsLoading = true;
      try {
        const allRows = await prefetchSockRows({
          likelySocks: allSocks,
          possibleSocks: [],
          allUsernames,
          userBlocks: this.blockData.userBlocks,
          userLocks: this.blockData.userLocks,
          userGlobalBlocks: this.blockData.userGlobalBlocks,
          fetchedUsers: this.blockData.fetchedUsers,
          state: this.state,
        });
        this.massAddUserRows(allRows);
      }
      finally {
        this.accountsLoading = false;
      }
    },
    launchFeedback() {
      const viewPretty = this.view.charAt(0).toUpperCase() + this.view.slice(1);
      this.feedbackDialog.launch({
        subject: `Feedback from ${mw.config.get('wgUserName')}`,
        message: `${viewPretty} form v${VERSION}-${MODE}`,
      });
    },
  },
  template: `
    <div id="spiHelper-alternateView" class="spiHelper-mainCard" v-if="open" @keydown.ctrl.enter.capture.prevent="$refs.submitForm?.onSubmit?.()">
      <div id="spiHelper-alternateView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="launchFeedback">
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
                     placeholder="Case" label="Case title" description="Optional but recommended" />
        <div style="display: flex; gap: 10px;">
          <cdx-button weight="primary" action="progressive" :disabled="caseLoading"
                      @click="loadCase(true)">Load</cdx-button>
          <cdx-progress-indicator v-if="caseLoading">Loading case</cdx-progress-indicator>
          <cdx-progress-indicator v-else-if="accountsLoading">Loading accounts</cdx-progress-indicator>
        </div>
      </div>
      <div id="spiHelper-alternateView-Content" v-if="caseLoaded">
        <div>
          <h4>Link</h4>
          <link-action :enabled="true" :case-name="targetCase"
                       :accounts="accounts"
                       @user-selected="handleUserSelected"
                       @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
        <div>
          <h4>Block</h4>
          <block-action :enabled="true" fetch-type="clipboard"
                        :accounts="accounts" v-model:block-options="blockData.options"
                        :user-locks="blockData.userLocks"
                        :user-global-blocks="blockData.userGlobalBlocks"
                        :user-blocks="blockData.userBlocks"
                        :default-master="blockData.master"
                        @user-selected="handleUserSelected" @fetch-rows="handleFetchRows"
                        @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
        </div>
      </div>
      <div v-if="caseLoaded">
        <submit-form :accounts="accounts"
                     v-model:lock-comment="blockData.lockcomment" v-model:skipCUVerifyUsers="blockData.skipCUVerifyUsers"
                     :case-actions="caseActions" :state="state"
                     :all-disabled="false" :action-name="'alternateActions'" :check-conflict="false"
                     @on-submit="onSubmitActions" ref="submitForm" />
      </div>
      <cdx-progress-bar v-if="actionsRunning" aria-label="Actions in progress" style="margin-top: 20px;" />
      <div id="messageRow">
        <cdx-message v-for="message in messages" :key="message.id" :type="message.type" :fade-in="true"
                     :allow-user-dismiss="true" @user-dismissed="dismissMessage(message.id)">
          <span v-if="message.isHtml" v-html="message.content" />
          <span v-else>
            {{ message.content }}
          </span>
        </cdx-message>
      </div>
    </div>
  `,
});
