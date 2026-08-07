import { type PropType, defineComponent } from 'vue';
import type { ActionLabel, CaseActionName, CaseActionSection, SelectionType } from '../../../types';
import { actionLabelText, shouldShowAction } from './utils';

export const ActionAccordionComponent = defineComponent({
  props: {
    selection: {
      type: [Number, Array, String, null] as PropType<CaseActionSection>,
      required: true,
    },
    name: { type: String as PropType<CaseActionName>, required: true },
    label: { type: [String, Object] as PropType<string | ActionLabel>, required: true },
    selectionType: { type: String as PropType<SelectionType>, required: true },
    displayedForms: { type: Set as PropType<Set<CaseActionName>>, required: true },
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
      return shouldShowAction({
        name: this.name, selection: this.selection, selectionType: this.selectionType,
      });
    },
    text(): string {
      return actionLabelText({
        label: this.label, selectionType: this.selectionType, allSelected: this.allSelected,
      });
    },
    showEnabledClass(): boolean {
      return this.name !== 'sections' && this.actionEnabled;
    },
  },

  template: `
    <cdx-accordion
        v-if="showAccordion"
        :name="name"
        :model-value="displayedForms.has(name)"
        @click.prevent="$emit('actionToggled')"
        :class="{'action-enabled': showEnabledClass}"
    >
      <template #title>{{ text }}</template>
      <slot />
    </cdx-accordion>
  `,
});
