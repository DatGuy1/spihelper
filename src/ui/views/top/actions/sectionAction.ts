import { type PropType, defineComponent } from 'vue';
import {
  type SectionOverlayType,
  getSectionIdByMenuItem,
  hideSectionOverlay,
  scrollToSection,
  showSectionOverlay,
} from '../../../dom.ts';
import {
  CdxMultiselectLookup,
  type CdxSelect,
  type ChipInputItem,
  type MenuItemData,
  type MenuItemValue,
} from '@wikimedia/codex';
import { spiHelperSettings } from '../../../../options';
import type { CaseActionSection } from '../../../../types';
import type { SectionEntry } from '../../../../state.ts';

export const SectionActionComponent = defineComponent({
  props: {
    allSections: { type: Array as PropType<SectionEntry[]>, required: true },
    selectedSection: { type: Object as PropType<CaseActionSection>, required: true },
    multiSelectMode: { type: Boolean, required: true },
    selectedSections: { type: Array as PropType<SectionEntry[]>, required: true },
  },
  emits: [
    'update-section-selection',
    'update:multiSelectMode',
    'update-multi-select-sections',
  ],
  data() {
    return {
      menuPointerOverHandler: null as ((e: Event) => void) | null,
      menuPointerLeaveHandler: null as (() => void) | null,
      menuFocusInHandler: null as ((e: Event) => void) | null,
      activeSectionId: null as number | null,
      overlayType: null as SectionOverlayType | null,
      hoverPreviewTarget: null as HTMLElement | null,
      hoverPreviewMenuItems: [] as MenuItemData[],
    };
  },
  computed: {
    canJumpToSelectedSection(): boolean {
      return !this.multiSelectMode && typeof this.selectedSection === 'number';
    },
    sectionSelectElement(): HTMLElement | null {
      const sectionSelect = this.$refs.sectionSelect as InstanceType<typeof CdxSelect> | undefined;
      return sectionSelect ? (sectionSelect.$el as HTMLElement) : null;
    },
    multiselectLookupElement(): HTMLElement | null {
      const lookup = this.$refs.multiselectLookup as
        InstanceType<typeof CdxMultiselectLookup> | undefined;
      return lookup ? (lookup.$el as HTMLElement) : null;
    },
    menuItems(): MenuItemData[] {
      const items: MenuItemData[] = this.allSections.map((s: SectionEntry) => ({
        value: s.id,
        label: s.name,
      }));
      items.push({ value: 'all', label: 'All Sections' });
      return items;
    },
    multiSelectMenuItems(): MenuItemData[] {
      return this.allSections.map((s: SectionEntry) => ({ value: s.id, label: s.name }));
    },
    multiSelectChips: {
      get(): ChipInputItem[] {
        return this.selectedSections.map(section => ({ value: section.id, label: section.name }));
      },
      set(chips: ChipInputItem[]) {
        this.emitMultiSelectIds(chips.map(chip => chip.value));
      },
    },
    multiSelectSelected: {
      get(): MenuItemValue[] {
        return this.selectedSections.map(section => section.id);
      },
      set(values: MenuItemValue[]) {
        this.emitMultiSelectIds(values);
      },
    },
  },
  watch: {
    // The section dropdown and the multiselect lookup are swapped via v-if/v-else, so
    // hover-preview listeners need detaching/reattaching to whichever is now mounted
    async multiSelectMode() {
      this.detachHoverPreviewListeners();
      await this.$nextTick();
      this.attachHoverPreviewListeners();
    },
  },
  mounted() {
    this.attachHoverPreviewListeners();
  },
  beforeUnmount() {
    this.detachHoverPreviewListeners();
  },
  methods: {
    /* Forward to parent */
    handleUpdateSectionSelection(selection: number | 'all' | null) {
      this.$emit('update-section-selection', selection);
    },
    emitMultiSelectIds(values: MenuItemValue[]) {
      const newIds = values.filter((value): value is number => typeof value === 'number');
      const currentIds = this.selectedSections.map(section => section.id);
      // Guard against no-op round trips which will cause recursion
      const idSet = new Set(currentIds);
      const unchanged = newIds.length === currentIds.length && newIds.every(id => idSet.has(id));
      if (unchanged) {
        return;
      }
      this.$emit('update-multi-select-sections', newIds);
    },
    /* Local methods */
    jumpToSelectedSection() {
      if (!this.canJumpToSelectedSection) {
        return;
      }
      if (this.selectedSection === null || this.selectedSection === 'all' || Array.isArray(this.selectedSection)) {
        return;
      }
      scrollToSection(this.selectedSection);
    },
    renderSectionOverlay(sectionId: number, type: SectionOverlayType) {
      this.overlayType = type;
      showSectionOverlay(sectionId, type);
    },
    clearSectionHighlight() {
      hideSectionOverlay();
    },
    attachHoverPreviewListeners() {
      if (!spiHelperSettings.highlightSection) {
        return;
      }
      const element = this.multiSelectMode
        ? this.multiselectLookupElement
        : this.sectionSelectElement;
      if (!element) {
        return;
      }
      this.hoverPreviewTarget = element;
      this.hoverPreviewMenuItems = this.multiSelectMode
        ? this.multiSelectMenuItems
        : this.menuItems;

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
      element.addEventListener('pointerover', this.menuPointerOverHandler);
      element.addEventListener('pointerleave', this.menuPointerLeaveHandler);
      element.addEventListener('focusin', this.menuFocusInHandler);
    },
    detachHoverPreviewListeners() {
      if (this.menuPointerOverHandler) {
        this.hoverPreviewTarget?.removeEventListener('pointerover', this.menuPointerOverHandler);
      }
      if (this.menuPointerLeaveHandler) {
        this.hoverPreviewTarget?.removeEventListener('pointerleave', this.menuPointerLeaveHandler);
      }
      if (this.menuFocusInHandler) {
        this.hoverPreviewTarget?.removeEventListener('focusin', this.menuFocusInHandler);
      }
      this.menuPointerOverHandler = null;
      this.menuPointerLeaveHandler = null;
      this.menuFocusInHandler = null;
      this.hoverPreviewTarget = null;
      this.hoverPreviewMenuItems = [];
      this.clearSectionHighlight();
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
      const sectionId = getSectionIdByMenuItem(menuItem, this.hoverPreviewMenuItems);
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
    <div class="spiHelper-section-selector">
      <div class="spiHelper-section-input" :class="{ 'spiHelper-section-input--multi': multiSelectMode }">
        <cdx-select v-if="!multiSelectMode" :menu-items="menuItems" :selected="selectedSection"
                    @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
        <cdx-multiselect-lookup v-else class="spiHelper-multi-select-lookup" ref="multiselectLookup"
            v-model:input-chips="multiSelectChips" v-model:selected="multiSelectSelected"
            :menu-items="multiSelectMenuItems" :keep-input-on-selection="true" />
      </div>
      <cdx-button weight="normal" :disabled="multiSelectMode || !canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
      <cdx-toggle-switch :model-value="multiSelectMode" @update:model-value="$emit('update:multiSelectMode', $event)">
        Multi-action
      </cdx-toggle-switch>
    </div>
  `,
});
