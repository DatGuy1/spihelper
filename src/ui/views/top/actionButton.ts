import { type PropType, defineComponent } from 'vue';
import type { SelectionType } from '../../../types/vue.ts';
import type { ActionLabel, CaseActionName, CaseActionSection } from '../../../types/spi.ts';
import { context } from '../../../context.ts';
import { ClerkOnlyActions, NonArchiveActions } from './utils/setup.ts';
import { spiHelperIsClerk } from '../../../role.ts';

export const ActionButtonComponent = defineComponent({
  props: {
    selection: { type: Object as PropType<CaseActionSection>, required: true },
    name: { type: String as PropType<CaseActionName>, required: true },
    label: { type: [String, Object] as PropType<string | ActionLabel>, required: true },
    selectionType: { type: String as PropType<SelectionType>, required: true },
    displayedForms: { type: Set as PropType<Set<CaseActionName>>, required: true },
    actionEnabled: { type: Boolean, required: true },
  },
  computed: {
    buttonEnabled(): boolean {
      return this.displayedForms.has(this.name) || this.actionEnabled;
    },

    allSelected(): boolean {
      return this.selection === 'all';
    },
    showButton(): boolean {
      if (context.isArchive) {
        return !NonArchiveActions.has(this.name);
      }
      if (!spiHelperIsClerk() && ClerkOnlyActions.has(this.name)) {
        return false;
      }
      if (this.name === 'sections') return true;
      if (this.selection === null) return false;
      if (this.selectionType === 'both') return true;
      return (this.selectionType === 'case') === this.allSelected;
    },

    buttonAction(): 'progressive' | 'normal' {
      return this.buttonEnabled ? 'progressive' : 'normal';
    },

    buttonStyle(): Record<string, string | number> {
      return {
        opacity: this.buttonEnabled ? 1 : 0.7,
        color: this.displayedForms.has(this.name)
          ? 'var(--color-base)'
          : '',
      };
    },

    text(): string {
      if (typeof this.label === 'string') {
        return this.label;
      }

      if (this.selectionType === 'both') {
        return this.allSelected
          ? this.label.case
          : this.label.section;
      }

      return 'Unexpected configuration';
    },
  },

  template: `
    <cdx-button
        v-if="showButton"
        :name="name"
        :action="buttonAction"
        :style="buttonStyle"
    >
      {{ text }}
    </cdx-button>
  `,
});
