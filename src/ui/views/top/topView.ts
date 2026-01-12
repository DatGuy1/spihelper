import { type PropType, defineComponent } from 'vue';
import { cdxIconCollapse, cdxIconExpand, cdxIconPushPin } from '@wikimedia/codex-icons';
import { DefaultLinkRow } from '../../../types/vue.ts';
import { type CaseState, type SectionEntry, type SectionSelection, loadSectionText } from '../../../state.ts';
import type { MenuItemData } from '@wikimedia/codex';
import { saveOptions, spiHelperSettings } from '../../../options';
import { HandleUserSelected } from '../userLookup.ts';
import type { AllUser } from '../../../types/api.ts';
import { spiHelperAddArchiveNotice, spiHelperParseArchiveNotice } from '../../../archivenotice.ts';
import { context } from '../../../context.ts';
import {
  type CaseActionName,
  type CaseActionSection, type CaseActions,
  type LinkRow,
  ParsedArchiveNotice,
  type SockRow,
} from '../../../types/spi.ts';
import { getDefaultSockRow, getSockEntries, updateSockRowSettings } from '../../utils.ts';
import {
  type ActionButtons,
  getActionButtons,
  getInitialCaseActions,
  getManagementFlagsFromArchiveNotice,
  prefetchSockRowsForSelection,
  updateCommentWithStatus,
} from './utils';
import { spiHelperCaseStatusRegex } from '../../../constants/regex.ts';
import { normalizeCaseStatus } from './utils/status.ts';
import { OpState, finishOp, getOpState, isOpRunning, startOp } from '../../../operations.ts';
import { spiHelperPerformActions } from '../../../caseActions.ts';
import { VueMessage, messages } from '../../messages.ts';

interface Data {
  open: boolean;
  _openHandler: ((e: Event) => void) | null;
  _beforeUnloadHandler: ((e: Event) => void) | null;
  actionsRunning: boolean;
  displayedForms: CaseActionName[];
  cdxIconPushPin: typeof cdxIconPushPin;
  cdxIconCollapse: typeof cdxIconCollapse;
  cdxIconExpand: typeof cdxIconExpand;
  unpinned: boolean;
  buttonLayout: boolean;
  actionButtons: ActionButtons;
  actionButtonKeys: CaseActionName[];
  caseActions: CaseActions;
  messages: VueMessage[];
}

export const TopViewComponent = defineComponent({
  props: {
    state: { type: Object as PropType<CaseState>, required: true },
    openButton: { type: Object as PropType<HTMLElement>, required: true },
  },
  data(): Data {
    const actionButtons = getActionButtons();
    const actionButtonKeys = Object.keys(actionButtons) as CaseActionName[];

    return {
      open: false,
      _openHandler: null,
      _beforeUnloadHandler: null,
      actionsRunning: false,
      displayedForms: ['sections'],
      unpinned: !spiHelperSettings.interface.pinned,
      buttonLayout: spiHelperSettings.interface.buttonLayout,
      actionButtons,
      actionButtonKeys,
      caseActions: getInitialCaseActions(),
      messages,
      cdxIconPushPin,
      cdxIconCollapse,
      cdxIconExpand,
    };
  },
  computed: {
    menuItems(): MenuItemData[] {
      const items: MenuItemData[] = this.state.sections.map((s: SectionEntry) => ({
        value: s.id,
        label: s.name,
      }));
      items.push({ value: 'all', label: 'All Sections' });
      return items;
    },
    currentStatus(): string {
      const statuses = this.caseActions.status.data;
      switch (statuses.new) {
        case 'nochange':
          return statuses.old;
        case 'selfendorse':
          return 'endorse';
        default:
          return statuses.new;
      }
    },
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
    mountPoint() {
      return (this.$el as HTMLElement).parentElement;
    },
  },
  template: `
    <div id="spiHelper-topView-Card" v-if="open">
      <div id="spiHelper-topView-Header">
        <div class="header-buttons">
          <cdx-button aria-label="Toggle layout" weight="quiet" @click="toggleButtonLayout">
            <cdx-icon :icon="buttonLayout ? cdxIconExpand : cdxIconCollapse" />
          </cdx-button>
          <cdx-button :action="unpinned ? 'default': 'progressive'" aria-label="Toggle pin"
                      weight="quiet" @click="unpinned = !unpinned">
            <cdx-icon :icon="cdxIconPushPin" />
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
                :state="state"
                :menu-items="menuItems"
                :current-status="currentStatus"
                @update-section-selection="onUpdateSectionSelection"
                @block-username-change="handleBlockUsernameChange"
                @link-username-change="handleLinkUsernameChange"
                @link-username-selected="handleLinkUsernameSelected"
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
            @action-toggled="onAccordionToggle(name)"
        >
          <action-content
              :name="name"
              :case-actions="caseActions"
              :state="state"
              :menu-items="menuItems"
              :current-status="currentStatus"
              @update-section-selection="onUpdateSectionSelection"
              @block-username-change="handleBlockUsernameChange"
              @link-username-change="handleLinkUsernameChange"
              @link-username-selected="handleLinkUsernameSelected"
              @remove-rows="handleRemoveRows"
              @add-row="handleAddRow"
              @fetch-rows="handleFetchRows"
          />
        </action-accordion>
      </div>
      <submit-form v-if="caseActions.sections.data.section !== null" v-model:socks="caseActions.block.data.accounts"
                   v-model:master="caseActions.block.data.master" v-model:altmaster="caseActions.block.data.altmaster"
                   v-model:lock-comment="caseActions.block.data.lockcomment" :locks="caseActions.block.data.userlocks"
                   :all-disabled="allDisabled"
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
    open(newVal: boolean) {
      if (newVal) {
        if (!this.state.archiveNotice) {
          // Load archivenotice params
          spiHelperParseArchiveNotice(context.pageName.replace(/\/Archive/, '')).then((archiveNoticeResult) => {
            if (archiveNoticeResult === null) {
              // No archive notice was found, initialise default and add it
              this.state.archiveNotice = new ParsedArchiveNotice({ username: context.caseName });
              new VueMessage({
                type: 'warning',
                content: 'Can\'t find archivenotice template! Automatically adding the archive notice to the page.',
              }).show();
              void spiHelperAddArchiveNotice(this.state);
            }
            else {
              this.state.archiveNotice = archiveNoticeResult;
            }
            this.handleAddRow();
          })
            .catch(() => {
              console.error('topView failed in spiHelperParseArchiveNotice');
            });
        }
      }
      else {
        void saveOptions();
      }
    },
    async selectedSection(selection: SectionSelection | null) {
      if (!selection) {
        return;
      }
      const allRows = await prefetchSockRowsForSelection(
        selection,
        this.state,
        this.caseActions.block.data.userlocks,
      );
      this.massAddSockRows(allRows);
    },
    archiveNotice(newNotice: ParsedArchiveNotice | null) {
      this.caseActions.management.data.flags = getManagementFlagsFromArchiveNotice(newNotice);
    },
    // Disable actions when changing section
    'caseActions.sections.data.section'(newSection: CaseActionSection, oldSection: CaseActionSection) {
      if (newSection === oldSection) {
        return;
      }
      for (const [actionName, caseAction] of Object.entries(this.caseActions)) {
        if (actionName === 'sections') {
          continue;
        }
        caseAction.enabled = false;
      }
    },
    // Changes the case status in the comment box
    'caseActions.status.data.status'(newStatus: string) {
      this.caseActions.comment.data.text = updateCommentWithStatus(
        this.caseActions.comment.data.text,
        newStatus,
      );
    },
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
        const formIndex = this.displayedForms.indexOf(formName);
        if (formIndex === -1) {
          this.displayedForms.push(formName);
        }
        else {
          this.displayedForms.splice(formIndex, 1);
        }
      }
      else {
        // Replace displayedForms
        this.displayedForms = [formName];
      }
    },
    onAccordionToggle(formNameString: string) {
      const formName = formNameString as CaseActionName;
      const index = this.displayedForms.indexOf(formName);
      if (index === -1) {
        this.displayedForms.push(formName);
      }
      else {
        this.displayedForms.splice(index, 1);
      }
    },
    isVisible(name: CaseActionName): boolean {
      return this.displayedForms.includes(name);
    },
    async onUpdateSectionSelection(newSelection: number | 'all' | null) {
      if (newSelection === null) {
        return;
      }
      // If we switch from a section to 'all' or vice versa, reset the displayed forms
      if (typeof newSelection !== typeof this.state.selectedSection?.type) {
        this.displayedForms = ['sections'];
      }
      if (newSelection === 'all') {
        this.state.selectedSection = { type: 'all' };
        return;
      }
      const targetSection = this.state.sections.find(section => section.id === newSelection);
      if (targetSection === undefined) {
        console.error('onUpdateSectionSelection: Could not find target section with ID', newSelection);
        return;
      }
      this.state.selectedSection = { type: 'specific', section: targetSection };

      const newText = await loadSectionText(targetSection);
      const result = spiHelperCaseStatusRegex.exec(newText);
      let caseStatus = '';
      if (result?.[1]) {
        caseStatus = result[1];
      }
      const normalisedStatus = normalizeCaseStatus(caseStatus);
      this.caseActions.status.data.old = normalisedStatus;
      this.caseActions.status.data.new = normalisedStatus;
      if (normalisedStatus === 'closed' && spiHelperSettings.tickArchiveWhenCaseClosed) {
        this.caseActions.archive.enabled = true;
      }
    },
    async onSubmitActions() {
      if (isOpRunning('mainActions')) {
        return;
      }
      startOp('mainActions');
      // I would have liked to use isOpRunning in the v-if, but it's messed up with Vue's reactivity
      this.actionsRunning = true;
      await spiHelperPerformActions({
        actions: this.caseActions,
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

      const allRows = [...likelySocks, ...possibleSocks].map(sock => updateSockRowSettings({
        row: sock,
        defaultBlock: likelySet.has(sock),
      }));
      this.massAddSockRows(allRows);
    },
    handleBlockUsernameChange(newUsername: string, index: number) {
      if (this.caseActions.link.data.rows.length < index + 1) {
        console.error('handleBlockUsernameChange: Index', index, 'doesn\'t exist in table');
        return;
      }
      (this.caseActions.link.data.rows[index] as LinkRow).username = newUsername;
    },
    handleLinkUsernameChange(newUsername: string, index: number) {
      if (this.caseActions.block.data.accounts.length < index + 1) {
        console.error('handleLinkUsernameChange: Index', index, 'doesn\'t exist in table');
        return;
      }
      (this.caseActions.block.data.accounts[index] as SockRow).username = newUsername;
    },
    handleLinkUsernameSelected(data: AllUser, index: number) {
      if (this.caseActions.block.data.accounts.length < index + 1) {
        console.error('handleLinkUsernameSelected: Index', index, 'doesn\'t exist in table');
        return;
      }
      HandleUserSelected(data, (this.caseActions.block.data.accounts[index] as SockRow));
    },
    handleAddRow(row?: SockRow) {
      row ??= getDefaultSockRow(this.state.archiveNotice);
      this.caseActions.block.data.accounts = [
        ...this.caseActions.block.data.accounts,
        row,
      ];
      this.caseActions.link.data.rows = [
        ...this.caseActions.link.data.rows,
        { ...DefaultLinkRow, username: row.username },
      ];
    },
    handleRemoveRows(indexes: number[]) {
      this.caseActions.block.data.accounts = this.caseActions.block.data.accounts.filter(
        (_row, index) => !indexes.includes(index),
      );
      this.caseActions.link.data.rows = this.caseActions.link.data.rows.filter(
        (_row, index) => !indexes.includes(index),
      );
    },
    massAddSockRows(newRows: SockRow[]) {
      // Aliases
      const sockRows = this.caseActions.block.data.accounts;
      const linkRows = this.caseActions.link.data.rows;

      // Check if the last row is an empty row
      const withDefault = sockRows.at(-1)?.username === '';
      // Used to filter out duplicates
      const existingUsernames = new Set(sockRows.map(s => s.username));
      newRows.forEach((newRow) => {
        if (existingUsernames.has(newRow.username)) {
          return;
        }
        // If last row is the default, insert in ^1st slot
        if (withDefault) {
          sockRows.splice(sockRows.length - 1, 0, newRow);
          linkRows.splice(linkRows.length - 1, 0, { ...DefaultLinkRow, username: newRow.username });
        }
        else {
          this.handleAddRow(newRow);
        }
      });
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

    this._beforeUnloadHandler = (e) => {
      const opState = getOpState('mainActions');
      // If we have actions enabled, and we haven't run (undefined), warn the user
      if (!this.allDisabled && opState !== OpState.Success) {
        e.preventDefault();
      }
    };

    this._openHandler = () => {
      this.open = !this.open;
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
