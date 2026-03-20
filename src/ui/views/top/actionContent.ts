import { type PropType, defineComponent } from 'vue';
import type { CaseActionName, CaseActions, UserRow } from '../../../types/spi.ts';
import { type CdxSelect, type MenuItemData } from '@wikimedia/codex';
import type { CaseState } from '../../../state.ts';
import type { AllUser } from '../../../types/api.ts';
import { context } from '../../../context.ts';
import {
  type SectionOverlayType,
  createSectionOverlay,
  getSectionIdByMenuItem,
  renderSectionOverlay,
  scrollToSection,
} from '../../dom.ts';
import { spiHelperSettings } from '../../../options';

export const ActionContentComponent = defineComponent({
  props: {
    name: { type: String as PropType<CaseActionName>, required: true },
    caseActions: { type: Object as PropType<CaseActions>, required: true },
    // "As a best practice, you should avoid such mutations
    // unless the parent and child are tightly coupled by design"
    // https://vuejs.org/guide/components/props.html#one-way-data-flow
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    state: { type: Object as PropType<CaseState>, required: true },
    menuItems: { type: Array as PropType<MenuItemData[]>, required: true },
  },
  emits: [
    'update-section-selection',
    'jump-to-selected-section',
    'update-status',
    'user-selected',
    'remove-rows',
    'add-row',
    'fetch-rows',
  ],
  data() {
    return {
      menuPointerOverHandler: null as ((e: Event) => void) | null,
      menuPointerLeaveHandler: null as (() => void) | null,
      menuFocusInHandler: null as ((e: Event) => void) | null,
      activeSectionId: null as number | null,
      overlayType: null as SectionOverlayType | null,
      sectionOverlayEl: null as HTMLElement | null,
    };
  },
  computed: {
    caseName(): string {
      return context.caseName;
    },
    canJumpToSelectedSection(): boolean {
      const selected = this.caseActions.sections.data.section;
      return selected !== null && selected !== 'all';
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
    sectionSelectElement(): HTMLElement {
      const sectionSelect = this.$refs.sectionSelect as InstanceType<typeof CdxSelect>;
      return sectionSelect.$el as HTMLElement;
    },
  },
  mounted() {
    if (this.name !== 'sections' || !spiHelperSettings.highlightSection) {
      return;
    }
    this.menuPointerOverHandler = (event: Event) => {
      this.handlePreviewEvent(event);
    };
    this.menuPointerLeaveHandler = () => {
      if (this.overlayType === 'preview') {
        this.clearSectionHighlight();
      }
    };
    this.menuFocusInHandler = (event: Event) => {
      this.handlePreviewEvent(event);
    };

    // pointX is for mouse, focusX is for keyboard (accessibility)
    this.sectionSelectElement.addEventListener('pointerover', this.menuPointerOverHandler);
    this.sectionSelectElement.addEventListener('pointerleave', this.menuPointerLeaveHandler);
    this.sectionSelectElement.addEventListener('focusin', this.menuFocusInHandler);
  },
  beforeUnmount() {
    if (this.menuPointerOverHandler) {
      this.sectionSelectElement.removeEventListener('pointerover', this.menuPointerOverHandler);
    }
    if (this.menuPointerLeaveHandler) {
      this.sectionSelectElement.removeEventListener('pointerleave', this.menuPointerLeaveHandler);
    }
    if (this.menuFocusInHandler) {
      this.sectionSelectElement.removeEventListener('focusin', this.menuFocusInHandler);
    }
    this.clearSectionHighlight();
  },
  methods: {
    /* Forward to parent */
    handleUpdateSectionSelection(selection: number | 'all' | null) {
      if (this.name === 'sections' && spiHelperSettings.highlightSection) {
        if (selection === 'all') {
          this.clearSectionHighlight();
        }
        else if (typeof selection === 'number') {
          this.renderSectionOverlay(selection, 'selected');
        }
      }
      this.$emit('update-section-selection', selection);
    },
    handleUpdateStatus(newStatus: string) {
      this.$emit('update-status', newStatus);
    },
    handleUserSelected(data: AllUser, rowId: string) {
      this.$emit('user-selected', data, rowId);
    },
    handleRemoveRows(rowIds: string[]) {
      this.$emit('remove-rows', rowIds);
    },
    handleAddRow(row?: UserRow) {
      this.$emit('add-row', row);
    },
    handleFetchRows() {
      this.$emit('fetch-rows');
    },
    /* Local methods */
    jumpToSelectedSection() {
      if (!this.canJumpToSelectedSection) {
        return;
      }
      const selected = this.caseActions.sections.data.section;
      if (selected === null || selected === 'all') {
        return;
      }
      scrollToSection(selected);
    },
    getOrCreateSectionOverlay(): HTMLElement | null {
      this.sectionOverlayEl ??= createSectionOverlay();
      return this.sectionOverlayEl;
    },
    renderSectionOverlay(sectionId: number, type: SectionOverlayType) {
      const overlay = this.getOrCreateSectionOverlay();
      this.overlayType = type;
      renderSectionOverlay(overlay, sectionId, type);
    },
    clearSectionHighlight() {
      if (this.sectionOverlayEl) {
        this.sectionOverlayEl.style.display = 'none';
      }
    },
    handlePreviewEvent(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      // Obtuse way to get our section ID
      const menuItem = target.closest('.cdx-menu-item');
      if (!menuItem) {
        return;
      }
      const sectionId = getSectionIdByMenuItem(menuItem, this.menuItems);
      if (sectionId === null) {
        this.activeSectionId = null;
        this.clearSectionHighlight();
        return;
      }
      if (sectionId !== this.activeSectionId) {
        this.renderSectionOverlay(sectionId, 'preview');
      }
    },
  },
  template: `
    <!-- Sections special case -->
    <div v-if="name === 'sections'" class="spiHelper-section-selector">
      <cdx-select :menu-items="menuItems" v-model:selected="caseActions.sections.data.section"
                  @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
      <cdx-button weight="normal" :disabled="!canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
    </div>

    <!-- Other actions -->
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" :selected-section="state.selectedSection" />
    <change-status-action v-else-if="name === 'status'" v-model:enabled="caseActions.status.enabled"
                          :old-status="caseActions.status.data.old" v-model:new-status="caseActions.status.data.new"
                          @update:new-status="handleUpdateStatus" />
    <block-action v-else-if="name === 'block'" v-model:enabled="caseActions.block.enabled" fetch-type="comment"
                  v-model:block-options="caseActions.block.data.options" :accounts="accounts"
                  :default-master="caseActions.block.data.master"
                  :user-locks="caseActions.block.data.userLocks" :user-blocks="caseActions.block.data.userBlocks"
                  @user-selected="handleUserSelected"
                  @remove-rows="handleRemoveRows" @add-row="handleAddRow"
                  @fetch-rows="handleFetchRows" />
    <link-action v-else-if="name === 'link'" v-model:enabled="caseActions.link.enabled"
                 :accounts="accounts" :case-name="caseName"
                 @user-selected="handleUserSelected"
                 @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target" v-model:suppress="caseActions.move.data.suppress"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="caseActions.sections.data.section"
                    :status="currentStatus" />
  `,
});
