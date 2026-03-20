import { type PropType, defineComponent } from 'vue';
import {
  type SectionOverlayType,
  createSectionOverlay,
  getSectionIdByMenuItem,
  renderSectionOverlay,
  scrollToSection,
} from '../../../dom.ts';
import type { CdxSelect, MenuItemData } from '@wikimedia/codex';
import { spiHelperSettings } from '../../../../options';
import type { CaseActionSection } from '../../../../types/spi.ts';
import type { SectionEntry } from '../../../../state.ts';

export const SectionActionComponent = defineComponent({
  props: {
    allSections: { type: Array as PropType<SectionEntry[]>, required: true },
    selectedSection: { type: Object as PropType<CaseActionSection>, required: true },
  },
  emits: [
    'update-section-selection',
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
    canJumpToSelectedSection(): boolean {
      return this.selectedSection !== null && this.selectedSection !== 'all';
    },
    sectionSelectElement(): HTMLElement {
      const sectionSelect = this.$refs.sectionSelect as InstanceType<typeof CdxSelect>;
      return sectionSelect.$el as HTMLElement;
    },
    menuItems(): MenuItemData[] {
      const items: MenuItemData[] = this.allSections.map((s: SectionEntry) => ({
        value: s.id,
        label: s.name,
      }));
      items.push({ value: 'all', label: 'All Sections' });
      return items;
    },
  },
  mounted() {
    if (!spiHelperSettings.highlightSection) {
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
      if (spiHelperSettings.highlightSection) {
        if (selection === 'all') {
          this.clearSectionHighlight();
        }
        else if (typeof selection === 'number') {
          this.renderSectionOverlay(selection, 'selected');
        }
      }

      this.$emit('update-section-selection', selection);
    },
    /* Local methods */
    jumpToSelectedSection() {
      if (!this.canJumpToSelectedSection) {
        return;
      }
      if (this.selectedSection === null || this.selectedSection === 'all') {
        return;
      }
      scrollToSection(this.selectedSection);
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
    <div class="spiHelper-section-selector">
      <cdx-select :menu-items="menuItems" :selected="selectedSection"
                  @update:selected="handleUpdateSectionSelection" ref="sectionSelect" />
      <cdx-button weight="normal" :disabled="!canJumpToSelectedSection" @click="jumpToSelectedSection">
        Jump to section
      </cdx-button>
    </div>
  `,
});
