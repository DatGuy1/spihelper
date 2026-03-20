import { type PropType, defineComponent } from 'vue';
import { cdxIconCollapse, cdxIconExpand, cdxIconFeedback, cdxIconPushPin } from '@wikimedia/codex-icons';
import { type FeedbackDialog } from '../../../types/vue.ts';
import {
  type CaseState,
  type SectionEntry,
  type SectionSelection,
  loadCaseText,
  loadSectionText,
} from '../../../state.ts';
import { saveOptions, spiHelperSettings } from '../../../options';
import { UpdateUserAllUserData } from '../userLookup.ts';
import type { AllUser } from '../../../types/api.ts';
import { spiHelperParseArchiveNotice } from '../../../archivenotice.ts';
import { context } from '../../../context.ts';
import {
  type CaseActionName,
  type CaseActionSection, type CaseActions,
  ParsedArchiveNotice,
  type UserRow,
} from '../../../types/spi.ts';
import { getDefaultUserRow, getSockEntries, updateUserBlockDataSettings } from '../../utils.ts';
import {
  type ActionButtons,
  getActionButtons,
  getInitialCaseActions,
  getManagementFlagsFromArchiveNotice,
  prefetchSockRows,
  updateCommentWithStatus,
} from './utils';
import { spiHelperCaseStatusRegex } from '../../../constants/regex.ts';
import { normalizeCaseStatus } from './utils/status.ts';
import { OpState, finishOp, getOpState, isOpRunning, startOp } from '../../../operations.ts';
import { spiHelperPerformActions } from '../../../caseActions.ts';
import { VueMessage, messages } from '../../messages.ts';
import { AllSectionActions, AlwaysAvailableActions, SpecificSectionActions } from './utils/setup.ts';
import { MODE, VERSION } from '../../../constants/settings.ts';

interface Data {
  open: boolean;
  handlers: {
    openHandler: ((e: Event) => void) | null;
    beforeUnloadHandler: ((e: Event) => void) | null;
  };
  actionsRunning: boolean;
  displayedForms: Set<CaseActionName>;
  icons: {
    cdxIconPushPin: typeof cdxIconPushPin;
    cdxIconCollapse: typeof cdxIconCollapse;
    cdxIconExpand: typeof cdxIconExpand;
    cdxIconFeedback: typeof cdxIconFeedback;
  };
  unpinned: boolean;
  buttonLayout: boolean;
  sectionAccountNames: Set<string>;
  actionButtons: ActionButtons;
  actionButtonKeys: CaseActionName[];
  caseActions: CaseActions;
  accounts: UserRow[];
  messages: VueMessage[];
}

export const TopViewComponent = defineComponent({
  props: {
    state: { type: Object as PropType<CaseState>, required: true },
    feedbackDialog: { type: Object as PropType<FeedbackDialog>, required: true },
    openButton: { type: Object as PropType<HTMLElement>, required: true },
  },
  data(): Data {
    const actionButtons = getActionButtons();
    const actionButtonKeys = Object.keys(actionButtons) as CaseActionName[];

    return {
      open: false,
      handlers: {
        openHandler: null,
        beforeUnloadHandler: null,
      },
      actionsRunning: false,
      displayedForms: new Set(['sections']),
      unpinned: !spiHelperSettings.interface.pinned,
      buttonLayout: spiHelperSettings.interface.buttonLayout,
      actionButtons,
      actionButtonKeys,
      sectionAccountNames: new Set<string>(),
      caseActions: getInitialCaseActions(),
      accounts: [],
      messages,
      icons: {
        cdxIconPushPin,
        cdxIconCollapse,
        cdxIconExpand,
        cdxIconFeedback,
      },
    };
  },
  computed: {
    allDisabled(): boolean {
      for (const [name, action] of Object.entries(this.caseActions)) {
        // Don't count 'sections' or 'link' since they don't affect the edit
        if (name === 'sections' || name === 'link') {
          continue;
        }
        if (action.enabled) {
          return false;
        }
      }
      return true;
    },
    selectedSection() {
      return this.state.selectedSection;
    },
    archiveNotice() {
      return this.state.archiveNotice;
    },
    stateSections() {
      return this.state.sections;
    },
    mountPoint() {
      return (this.$el as HTMLElement).parentElement;
    },
  },
  watch: {
    unpinned(newVal) {
      if (!this.mountPoint) {
        console.error('TopViewComponent unpinned: Could not find mountPoint');
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
    async open(newVal: boolean) {
      if (newVal) {
        await this.ensureArchiveNotice();
      }
      else {
        void saveOptions();
      }
    },
    // Do we even want to load the section before user input?
    async stateSections(newValue: SectionEntry[]) {
      // Put it in watch in case our state loads after we open our form
      if (this.caseActions.sections.data.section === null) {
        const firstSection = newValue[0];
        if (firstSection) {
          this.caseActions.sections.data.section = firstSection.id;
          await this.ensureArchiveNotice();
          await this.loadNewSection(firstSection);
        }
        else {
          this.caseActions.sections.data.section = 'all';
        }
      }
    },
    archiveNotice(newNotice: ParsedArchiveNotice | null) {
      this.caseActions.management.data.flags = getManagementFlagsFromArchiveNotice(newNotice);
    },
    // Toggle actions when changing section
    'caseActions.sections.data.section'(newSection: CaseActionSection, oldSection: CaseActionSection) {
      // Is this even necessary?
      if (newSection === oldSection) {
        return;
      }
      for (const [actionName, caseAction] of Object.entries(this.caseActions)) {
        const caseAN = actionName as CaseActionName;
        if (caseAN === 'sections') {
          continue;
        }
        const actionDefaultEnabled = spiHelperSettings.defaultActions.includes(caseAN);
        caseAction.enabled = actionDefaultEnabled;
        // If the action is enabled by default, it's always available,
        // or we're going to 'all' and it's supported by 'all sections',
        // or we're going to specific section, and it's supported as such
        if (actionDefaultEnabled && (
          AlwaysAvailableActions.has(caseAN)
          || (newSection === 'all' && AllSectionActions.has(caseAN))
          || (typeof newSection === 'number' && SpecificSectionActions.has(caseAN))
        )) {
          this.displayedForms.add(caseAN);
        }
      }
    },
  },
  mounted() {
    // Access the parent mount element
    if (!this.mountPoint) {
      console.error('TopViewComponent mounted: Could not find mountPoint');
      return;
    }
    if (this.unpinned) {
      this.mountPoint.classList.add('unpinned');
    }
    else {
      this.mountPoint.classList.remove('unpinned');
    }

    this.handlers.beforeUnloadHandler = (e) => {
      const opState = getOpState('mainActions');
      // If we have actions enabled, and we haven't run (undefined), warn the user
      if (!this.allDisabled && opState !== OpState.Success) {
        e.preventDefault();
      }
    };

    this.handlers.openHandler = () => {
      this.open = !this.open;
      if (this.open) {
        mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'open', type: 'top' });
        if (this.handlers.beforeUnloadHandler) {
          window.addEventListener('beforeunload', this.handlers.beforeUnloadHandler);
        }
      }
      else {
        if (this.handlers.beforeUnloadHandler) {
          window.removeEventListener('beforeunload', this.handlers.beforeUnloadHandler);
        }
      }
    };
    this.openButton.addEventListener('click', this.handlers.openHandler);
  },
  beforeUnmount() {
    if (this.handlers.openHandler) {
      this.openButton.removeEventListener('click', this.handlers.openHandler);
    }
    if (this.handlers.beforeUnloadHandler) {
      window.removeEventListener('beforeunload', this.handlers.beforeUnloadHandler);
    }
  },
  methods: {
    toggleButtonLayout() {
      this.buttonLayout = !this.buttonLayout;
      spiHelperSettings.interface.buttonLayout = this.buttonLayout;
    },
    onActionClick(event: PointerEvent, formNameString: string) {
      // Not really necessary, but Object.entries expands
      const formName = formNameString as CaseActionName;
      if (event.ctrlKey || event.metaKey) {
        // Add/remove from displayedForms
        if (this.displayedForms.has(formName)) {
          this.displayedForms.delete(formName);
        }
        else {
          this.displayedForms.add(formName);
        }
      }
      else {
        // Replace displayedForms
        this.displayedForms = new Set([formName]);
      }
    },
    onAccordionToggle(formNameString: string) {
      const formName = formNameString as CaseActionName;
      if (this.displayedForms.has(formName)) {
        this.displayedForms.delete(formName);
      }
      else {
        this.displayedForms.add(formName);
      }
    },
    isVisible(name: CaseActionName): boolean {
      return this.displayedForms.has(name);
    },
    async onUpdateSectionSelection(newSelection: number | 'all' | null) {
      if (newSelection === null) {
        return;
      }
      this.caseActions.sections.data.section = newSelection;
      // If we switch from a section to 'all' or vice versa, reset the displayed forms
      const prevType = this.state.selectedSection?.type ?? null;
      const nextType = newSelection === 'all' ? 'all' : 'specific';
      if (prevType !== nextType) {
        this.displayedForms = new Set(Array.from(this.displayedForms).filter(formName =>
          AlwaysAvailableActions.has(formName),
        ));
      }

      if (newSelection === 'all') {
        this.state.selectedSection = { type: 'all' };
        void this.loadSectionAccounts(this.state.selectedSection);
        return;
      }
      const targetSection = this.state.sections.find(section => section.id === newSelection);
      if (targetSection === undefined) {
        console.error('onUpdateSectionSelection: Could not find target section with ID', newSelection);
        return;
      }
      await this.loadNewSection(targetSection);
    },
    async loadNewSection(targetSection: SectionEntry) {
      this.state.selectedSection = { type: 'specific', section: targetSection };

      const newText = await loadSectionText(targetSection);
      const result = spiHelperCaseStatusRegex.exec(newText);
      const normalisedStatus = normalizeCaseStatus(result?.[1] ?? '');
      this.caseActions.status.data.old = normalisedStatus;
      this.caseActions.status.data.new = normalisedStatus;
      if (normalisedStatus === 'closed' && spiHelperSettings.tickArchiveWhenCaseClosed) {
        this.caseActions.archive.enabled = true;
      }
      void this.loadSectionAccounts(this.state.selectedSection);
    },
    async loadSectionAccounts(selection: SectionSelection) {
      this.accounts = this.accounts.filter(row => !this.sectionAccountNames.has(row.username));
      // Prefill block and link tables
      const searchText = await (selection.type === 'all'
        ? loadCaseText(this.state)
        : loadSectionText(selection.section));

      const [likelySocks, possibleSocks, allUsernames] = getSockEntries({
        text: searchText,
        fullSearch: true,
        state: this.state,
      });
      const allRows = await prefetchSockRows({
        likelySocks,
        possibleSocks,
        allUsernames,
        userBlocks: this.caseActions.block.data.userBlocks,
        userLocks: this.caseActions.block.data.userLocks,
        userTags: this.caseActions.block.data.userTags,
        state: this.state,
      });
      this.sectionAccountNames = new Set(this.massAddUserRows(allRows).map(row => row.username));
    },
    // Changes the case status in the comment box
    onUpdateNewStatus(newStatus: string) {
      this.caseActions.comment.data.text = updateCommentWithStatus(
        this.caseActions.comment.data.text,
        newStatus,
      );
    },
    async onSubmitActions() {
      if (isOpRunning('mainActions')) {
        return;
      }
      mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'submit', type: 'top' });
      startOp('mainActions');
      // I would have liked to use isOpRunning in the v-if, but it's messed up with Vue's reactivity
      this.actionsRunning = true;
      await spiHelperPerformActions({
        actions: this.caseActions,
        accounts: this.accounts,
        state: this.state,
      });
      finishOp('mainActions', OpState.Success);
      this.actionsRunning = false;
    },
    handleFetchRows() {
      const [likelySocks, possibleSocks] = getSockEntries({
        text: this.caseActions.comment.data.text,
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
    handleUserSelected(data: AllUser, rowId: string) {
      const userRow = this.accounts.find(r => r.id === rowId);
      if (!userRow) {
        return;
      }
      if (data.blockid !== undefined
        && !this.caseActions.block.data.userBlocks.has(userRow.username)) {
        const ABAO = mw.util.isIPAddress(data.name) ? data.blockanononly : data.blockautoblocking;
        this.caseActions.block.data.userBlocks.set(userRow.username, {
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
    massAddUserRows(newRows: UserRow[]) {
      // Check if the last row is an empty row
      const withDefault = this.accounts.at(-1)?.username === '';
      // Used to filter out duplicates
      const existingUsernames = new Set(this.accounts.map(s => s.username));
      const filteredRows: UserRow[] = newRows.filter(
        newRow => !existingUsernames.has(newRow.username),
      );
      // If last row is the default, insert in ^1st slot
      if (withDefault) {
        filteredRows.forEach((newRow) => {
          this.accounts.splice(this.accounts.length - 1, 0, newRow);
        });
      }
      else {
        this.accounts = this.accounts.concat(filteredRows);
      }
      return filteredRows;
    },
    async ensureArchiveNotice() {
      if (this.state.archiveNotice) {
        return;
      }
      // Load archivenotice params
      const archiveNoticeResult = await spiHelperParseArchiveNotice({
        page: context.casePageName,
        state: this.state,
      });
      if (archiveNoticeResult === null) {
        // No archive notice was found, initialise default and add it
        this.state.archiveNotice = new ParsedArchiveNotice({ username: context.caseName });
        new VueMessage({
          type: 'warning',
          content: 'Can\'t find archivenotice template! Automatically adding the archive notice to the page.',
        }).show();
        mw.notify('Can\'t find archivenotice template! If this is incorrect, please contact DatGuy', { type: 'warn' }); // Adding the archive notice to the page
        console.warn('archivenoticeResult is null');
        // await spiHelperAddArchiveNotice(context.casePageName, this.state);
      }
      else {
        this.state.archiveNotice = archiveNoticeResult;
      }
    },
    launchFeedback() {
      this.feedbackDialog.launch({
        subject: `Feedback from ${mw.config.get('wgUserName')}`,
        message: `SPI form v${VERSION}-${MODE}`,
      });
    },
  },
  template: `
    <div id="spiHelper-topView" class="spiHelper-mainCard" v-if="open">
      <div id="spiHelper-topView-Header" class="spiHelper-mainCard-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Give feedback" weight="quiet" @click="launchFeedback">
            <cdx-icon :icon="icons.cdxIconFeedback" />
          </cdx-button>
          <cdx-button aria-label="Toggle layout" weight="quiet" @click="toggleButtonLayout">
            <cdx-icon :icon="buttonLayout ? icons.cdxIconExpand : icons.cdxIconCollapse" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="icons.cdxIconPushPin" />
          </cdx-button>
        </div>
      </div>
      <div id="spiHelper-topView-Action" v-if="buttonLayout">
        <div id="buttonRow">
          <action-button
              v-for="[name, button] of Object.entries(actionButtons)"
              :key="name"
              :name="name"
              :label="button.label"
              :selection-type="button.selectionType"
              :selection="caseActions.sections.data.section"
              :displayedForms="displayedForms"
              :actionEnabled="caseActions[name].enabled"
              @click="onActionClick($event, name)"
          />
        </div>
        <div id="contentRow">
          <div v-for="name of actionButtonKeys"
               :key="name"
               :class="{ 'is-visible': isVisible(name) }">
            <action-content
                :name="name"
                :case-actions="caseActions"
                :accounts="accounts"
                :state="state"
                @update-section-selection="onUpdateSectionSelection"
                @update-status="onUpdateNewStatus"
                @user-selected="handleUserSelected"
                @remove-rows="handleRemoveRows"
                @add-row="handleAddRow"
                @fetch-rows="handleFetchRows"
            />
          </div>
        </div>
      </div>
      <div id="spiHelper-topView-Accordion" v-else>
        <action-accordion
            v-for="[name, button] of Object.entries(actionButtons)"
            :key="name"
            :name="name"
            :label="button.label"
            :selection-type="button.selectionType"
            :selection="caseActions.sections.data.section"
            :displayedForms="displayedForms"
            :actionEnabled="caseActions[name].enabled"
            @action-toggled="onAccordionToggle(name)"
        >
          <action-content
              :name="name"
              :case-actions="caseActions"
              :accounts="accounts"
              :state="state"
              @update-section-selection="onUpdateSectionSelection"
              @update-status="onUpdateNewStatus"
              @user-selected="handleUserSelected"
              @remove-rows="handleRemoveRows"
              @add-row="handleAddRow"
              @fetch-rows="handleFetchRows"
          />
        </action-accordion>
      </div>
      <submit-form v-if="caseActions.sections.data.section !== null" :accounts="accounts"
                   v-model:lock-comment="caseActions.block.data.lockcomment"
                   v-model:skipCUVerifyUsers="caseActions.block.data.skipCUVerifyUsers"
                   :case-actions="caseActions" :state="state"
                   :all-disabled="allDisabled" :action-name="'mainActions'" :check-conflict="true"
                   @on-submit="onSubmitActions" />
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
});
