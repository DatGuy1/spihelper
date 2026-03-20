import { type PropType, defineComponent } from 'vue';
import type { CaseActionSection } from '../../../../types/spi.ts';

export const ArchiveActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    selection: { type: Object as PropType<CaseActionSection>, required: true },
    statusData: { type: Object as PropType<{ old: string; new: string }>, required: true },
  },
  emits: ['update:enabled'],
  computed: {
    badStatus(): boolean {
      return this.selection !== 'all' && this.status !== 'closed';
    },
    status(): string {
      switch (this.statusData.new) {
        case 'nochange':
          return this.statusData.old;
        case 'selfendorse':
          return 'endorse';
        default:
          return this.statusData.new;
      }
    },
  },
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus" type="warning" :inline="true">
      The selected section status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
  `,
});
