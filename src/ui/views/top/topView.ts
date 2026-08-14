import { type PropType, defineComponent } from 'vue';
import { cdxIconCollapse, cdxIconExpand, cdxIconFeedback, cdxIconPushPin } from '@wikimedia/codex-icons';
import {
  type AllUser,
  type CaseActionName,
  type CaseActionSection,
  type CaseActions,
  type FeedbackDialog,
  ParsedArchiveNotice,
  type UserRow,
} from '../../../types';
import {
  type CaseState,
  type SectionEntry,
  type SectionSelection,
  getSelectedSections,
  loadCaseText,
  loadSectionText,
} from '../../../state.ts';
import { saveOptions, spiHelperSettings } from '../../../options';
import { UpdateUserAllUserData } from '../userLookup.ts';
import { spiHelperParseArchiveNotice } from '../../../archivenotice.ts';
import { context } from '../../../context.ts';
import { getDefaultUserRow, getSockEntries, updateUserBlockDataSettings } from '../../utils.ts';
import {
  type ActionButtons,
  getActionButtons,
  getInitialCaseActions,
  getManagementFlagsFromArchiveNotice,
  prefetchSockRows,
  shouldShowAction,
  updateCommentWithStatus,
} from './utils';
import { MODE, VERSION, spiHelperCaseStatusRegex } from '../../../constants';
import { normalizeCaseStatus } from './utils/status.ts';
import { OpState, finishOp, getOpState, isOpRunning, startOp } from '../../../operations.ts';
import { spiHelperPerformActions } from '../../../caseActions.ts';
import { VueMessage, messages } from '../../messages.ts';
import { AlwaysAvailableActions, SpecificSectionActions } from './utils/setup.ts';
import { addSectionButtons, clearSelectedSectionOverlays, setSelectedSectionOverlays } from '../../dom.ts';

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
  sectionClickCleanup: (() => void) | null;
  multiSelectMode: boolean;
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
      sectionClickCleanup: null,
      multiSelectMode: false,
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
      // If we're not on multi-section mode, our bySection values are irrelevant
      if (this.state.selectedSection?.type !== 'multiple') {
        return true;
      }
      return [
        ...this.caseActions.comment.data.bySection.values(),
        ...this.caseActions.status.data.bySection.values(),
      ].every(entry => !entry.enabled);
    },
    selectedSection() {
      return this.state.selectedSection;
    },
    selectedSections(): SectionEntry[] {
      return getSelectedSections(this.state.selectedSection);
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
        this.syncSelectedSectionOverlay();
      }
      else {
        this.syncSelectedSectionOverlay();
        void saveOptions();
      }
    },
    // Do we even want to load the section before user input?
    async stateSections(newValue: SectionEntry[]) {
      this.setupSectionButtons();
      // Put it in watch in case our state loads after we open our form
      if (this.caseActions.sections.data.section === null) {
        const firstSection = newValue[0];
        if (firstSection) {
          this.caseActions.sections.data.section = firstSection.id;
          await this.ensureArchiveNotice();
          await this.loadNewSection(firstSection);
        }
        else {
          await this.onUpdateSectionSelection('all');
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
        // Only enable actions the new selection can actually run
        const available = shouldShowAction({
          name: caseAN,
          selection: newSection,
          selectionType: this.actionButtons[caseAN].selectionType,
        });
        // The form still opens for these, but each section drives its own entry, so the
        // top-level flag is never shown or read while the selection holds several sections
        const perSectionDriven = Array.isArray(newSection) && SpecificSectionActions.has(caseAN);
        caseAction.enabled = actionDefaultEnabled && available && !perSectionDriven;
        if (actionDefaultEnabled && available) {
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
    this.sectionClickCleanup?.();
    this.sectionClickCleanup = null;
  },
  methods: {
    setupSectionButtons() {
      const ids = this.state.sections.map(s => s.id);
      if (ids.length === 0) {
        return;
      }
      this.sectionClickCleanup = addSectionButtons(ids, (sectionId) => {
        // Might like to await this
        if (this.multiSelectMode) {
          void this.toggleMultiSelectSection(sectionId);
        }
        else {
          void this.onUpdateSectionSelection(sectionId);
        }
        if (!this.open) {
          this.open = true;
        }
      });
    },
    syncSelectedSectionOverlay() {
      if (!spiHelperSettings.highlightSection || !this.open) {
        clearSelectedSectionOverlays();
        return;
      }

      setSelectedSectionOverlays(this.selectedSections.map(s => s.id));
    },
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
    isActionEnabled(name: CaseActionName): boolean {
      if (this.state.selectedSection?.type === 'multiple') {
        if (name === 'comment') {
          return [...this.caseActions.comment.data.bySection.values()].some(e => e.enabled);
        }
        if (name === 'status') {
          return [...this.caseActions.status.data.bySection.values()].some(e => e.enabled);
        }
      }
      return this.caseActions[name].enabled;
    },
    async onUpdateSectionSelection(newSelection: number | 'all' | null) {
      if (newSelection === null) {
        return;
      }
      this.caseActions.sections.data.section = newSelection;
      // If we switch from a section to 'all' or vice versa, reset the displayed forms
      const prevType = this.state.selectedSection?.type ?? null;
      const nextType = newSelection === 'all' ? 'all' : 'single';
      if (prevType !== nextType) {
        this.displayedForms = new Set(Array.from(this.displayedForms).filter(formName =>
          AlwaysAvailableActions.has(formName),
        ));
      }

      if (newSelection === 'all') {
        this.state.selectedSection = { type: 'all' };
        void this.loadSectionAccounts(this.state.selectedSection);
        this.syncSelectedSectionOverlay();
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
      this.state.selectedSection = { type: 'single', section: targetSection };

      const newText = await loadSectionText(targetSection);
      const result = spiHelperCaseStatusRegex.exec(newText);
      const normalisedStatus = normalizeCaseStatus(result?.[1] ?? '');
      this.caseActions.status.data.old = normalisedStatus;
      this.caseActions.status.data.new = normalisedStatus;
      if (normalisedStatus === 'closed' && spiHelperSettings.tickArchiveWhenCaseClosed) {
        this.caseActions.archive.enabled = true;
      }
      this.syncSelectedSectionOverlay();
      void this.loadSectionAccounts(this.state.selectedSection);
    },
    async toggleMultiSelectMode(newValue: boolean) {
      this.multiSelectMode = newValue;
      if (!newValue) {
        // Grab the first section from the multiple selected sections array
        const current = this.selectedSections;
        if (current.length > 1) {
          const [first] = current;
          if (first) {
            await this.applySectionSelection([first]);
          }
        }
        return;
      }
      // 'all' doesn't map to any chip in the multiselect lookup, so it'd otherwise show
      // an empty working set while secretly still targeting the whole case underneath
      if (this.state.selectedSection?.type === 'all') {
        await this.applySectionSelection([]);
      }
    },
    // Add sectionId to the multi-select selection if it isn't already selected, otherwise remove it
    async toggleMultiSelectSection(sectionId: number) {
      const current = this.selectedSections;
      const isRemoving = current.some(section => section.id === sectionId);
      if (isRemoving) {
        await this.applySectionSelection(current.filter(section => section.id !== sectionId));
        return;
      }
      const section = this.state.sections.find(s => s.id === sectionId);
      if (!section) {
        console.error('toggleMultiSelectSection: Could not find target section with ID', sectionId);
        return;
      }
      await this.applySectionSelection([...current, section]);
    },
    // The multi-select lookup always reports the full resulting set of ids, whether the change
    // came from picking a new section or removing an existing chip
    async handleUpdateMultiSelectSections(sectionIds: number[]) {
      const idSet = new Set(sectionIds);
      const sections = this.state.sections.filter(section => idSet.has(section.id));
      await this.applySectionSelection(sections);
    },
    async applySectionSelection(sections: SectionEntry[]) {
      this.pruneBySectionData(new Set(sections.map(s => s.id)));

      if (sections.length === 0) {
        this.caseActions.sections.data.section = null;
        this.state.selectedSection = null;
        this.syncSelectedSectionOverlay();
        return;
      }
      if (sections.length === 1) {
        const [only] = sections;
        if (!only) {
          return;
        }
        this.caseActions.sections.data.section = only.id;
        await this.loadNewSection(only);
        return;
      }
      this.caseActions.sections.data.section = sections.map(s => s.id);
      this.state.selectedSection = { type: 'multiple', sections };
      await Promise.all(sections.map(section => this.ensureBySectionEntry(section)));
      this.syncSelectedSectionOverlay();
      void this.loadSectionAccounts(this.state.selectedSection);
    },
    // Seed per-section comment/status data the first time a section joins the
    // multi-select selection
    async ensureBySectionEntry(section: SectionEntry) {
      if (!this.caseActions.comment.data.bySection.has(section.id)) {
        this.caseActions.comment.data.bySection.set(section.id, {
          text: '* ', enabled: spiHelperSettings.defaultActions.includes('comment'),
        });
      }
      if (!this.caseActions.status.data.bySection.has(section.id)) {
        const text = await loadSectionText(section);
        const result = spiHelperCaseStatusRegex.exec(text);
        const normalisedStatus = normalizeCaseStatus(result?.[1] ?? '');
        this.caseActions.status.data.bySection.set(section.id, {
          old: normalisedStatus,
          new: normalisedStatus,
          enabled: spiHelperSettings.defaultActions.includes('status'),
        });
      }
    },
    pruneBySectionData(keepIds: Set<number>) {
      // Should we delete or just disable the action?
      for (const id of this.caseActions.comment.data.bySection.keys()) {
        if (!keepIds.has(id)) {
          this.caseActions.comment.data.bySection.delete(id);
        }
      }
      for (const id of this.caseActions.status.data.bySection.keys()) {
        if (!keepIds.has(id)) {
          this.caseActions.status.data.bySection.delete(id);
        }
      }
    },
    async loadSectionAccounts(selection: SectionSelection) {
      this.accounts = this.accounts.filter(row => !this.sectionAccountNames.has(row.username));
      // Prefill block and link tables. For a multi-section selection, union the text of every
      // selected section so accounts from any of them are picked up in one combined pass.
      const searchText = await (async () => {
        if (selection.type === 'all') {
          return loadCaseText(this.state);
        }
        if (selection.type === 'multiple') {
          const texts = await Promise.all(
            selection.sections.map(section => loadSectionText(section)),
          );
          return texts.join('\n');
        }
        return loadSectionText(selection.section);
      })();

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
        userGlobalBlocks: this.caseActions.block.data.userGlobalBlocks,
        fetchedUsers: this.caseActions.block.data.fetchedUsers,
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
    // Same as onUpdateNewStatus, but for one section's
    // own comment box in the multi-select selection
    onUpdateSectionStatus(sectionId: number, newStatus: string) {
      const entry = this.caseActions.comment.data.bySection.get(sectionId);
      if (entry) {
        entry.text = updateCommentWithStatus(entry.text, newStatus);
      }
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
      // Blocks, locks and tags we just wrote make every cached lookup stale
      this.caseActions.block.data.fetchedUsers.clear();
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
          content: 'Can\'t find archivenotice template! Automatically adding the archive notice to the page',
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
    async handleMoveEntireCase() {
      await this.onUpdateSectionSelection('all');
      this.caseActions.move.enabled = true;
    },
  },
  template: `
    <div id="spiHelper-topView" class="spiHelper-mainCard" v-if="open" @keydown.ctrl.enter.capture.prevent="$refs.submitForm?.onSubmit?.()">
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
              :actionEnabled="isActionEnabled(name)"
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
                :multi-select-mode="multiSelectMode"
                :selected-sections="selectedSections"
                @update-section-selection="onUpdateSectionSelection"
                @update-status="onUpdateNewStatus"
                @update-section-status="onUpdateSectionStatus"
                @update:multi-select-mode="toggleMultiSelectMode"
                @update-multi-select-sections="handleUpdateMultiSelectSections"
                @user-selected="handleUserSelected"
                @remove-rows="handleRemoveRows"
                @add-row="handleAddRow"
                @fetch-rows="handleFetchRows"
                @move-entire-case="handleMoveEntireCase"
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
            :actionEnabled="isActionEnabled(name)"
            @action-toggled="onAccordionToggle(name)"
        >
          <action-content
              :name="name"
              :case-actions="caseActions"
              :accounts="accounts"
              :state="state"
              :multi-select-mode="multiSelectMode"
              :selected-sections="selectedSections"
              @update-section-selection="onUpdateSectionSelection"
              @update-status="onUpdateNewStatus"
              @update-section-status="onUpdateSectionStatus"
              @update:multi-select-mode="toggleMultiSelectMode"
              @update-multi-select-sections="handleUpdateMultiSelectSections"
              @user-selected="handleUserSelected"
              @remove-rows="handleRemoveRows"
              @add-row="handleAddRow"
              @fetch-rows="handleFetchRows"
              @move-entire-case="handleMoveEntireCase"
          />
        </action-accordion>
      </div>
      <submit-form v-if="caseActions.sections.data.section !== null" :accounts="accounts"
                   v-model:lock-comment="caseActions.block.data.lockcomment"
                   v-model:skipCUVerifyUsers="caseActions.block.data.skipCUVerifyUsers"
                   :case-actions="caseActions" :state="state"
                   :all-disabled="allDisabled" :action-name="'mainActions'" :check-conflict="true"
                   @on-submit="onSubmitActions" ref="submitForm" />
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
