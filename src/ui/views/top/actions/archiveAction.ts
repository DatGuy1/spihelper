import { type PropType, defineComponent } from 'vue';
import type { CaseActionSection } from '../../../../types/spi.ts';

export const ArchiveActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    status: { type: String, required: true },
    selection: { type: Object as PropType<CaseActionSection>, required: true },
  },
  emits: ['update:enabled'],
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus" type="warning" :inline="true">
      The selected section status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
  `,
  computed: {
    badStatus(): boolean {
      return this.selection !== 'all' && this.status !== 'closed';
    },
  },
});
