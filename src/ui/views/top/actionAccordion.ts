import { type PropType, defineComponent } from 'vue';
import type { SelectionType } from '../../../types/vue.ts';
import type { ActionLabel, CaseActionName, CaseActionSection } from '../../../types/spi.ts';
import { context } from '../../../context.ts';
import { NonArchiveActions } from './utils/setup.ts';

export const ActionAccordionComponent = defineComponent({
  props: {
    selection: { type: Object as PropType<CaseActionSection>, required: true },
    name: { type: String as PropType<CaseActionName>, required: true },
    label: { type: [String, Object] as PropType<string | ActionLabel>, required: true },
    selectionType: { type: String as PropType<SelectionType>, required: true },
    displayedForms: { type: Array as PropType<CaseActionName[]>, required: true },
    actionEnabled: { type: Boolean, required: true },
  },
  emits: ['actionToggled'],
  data() {
    return {
      accordionModel: true,
    };
  },
  computed: {
    allSelected(): boolean {
      return this.selection === 'all';
    },
    showAccordion(): boolean {
      if (context.isArchive) {
        return !NonArchiveActions.has(this.name);
      }
      if (this.name === 'sections') return true;
      if (this.selection === null) return false;
      if (this.selectionType === 'both') return true;
      return (this.selectionType === 'case') === this.allSelected;
    },
    text(): string {
      if (typeof this.label === 'string') {
        return this.label;
      }

      if (this.selectionType === 'both') {
        return this.allSelected
          ? (this.label.case)
          : (this.label.section);
      }

      return 'Unexpected configuration';
    },
    showEnabledClass(): boolean {
      return this.name !== 'sections' && this.actionEnabled;
    },
  },

  template: `
    <cdx-accordion
        v-if="showAccordion"
        :name="name"
        :model-value="displayedForms.includes(name)"
        @click.prevent="$emit('actionToggled')"
        :class="{'action-enabled': showEnabledClass}"
    >
      <template #title>{{ text }}</template>
      <slot />
    </cdx-accordion>
  `,
});
