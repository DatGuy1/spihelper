import { type PropType, defineComponent } from 'vue';
import type { ManagementFlag } from '../../../../types/spi.ts';

export const ManagementActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    flags: { type: Set as PropType<Set<ManagementFlag>>, required: true },
  },
  data() {
    const archiveNoticeFlags: { value: ManagementFlag; label: string }[] = [
      { value: 'crosswiki', label: 'Cross-wiki' },
      { value: 'deny', label: 'Deny' },
      { value: 'notalk', label: 'No talkpage access' },
      { value: 'moot', label: 'Moot' },
    ];
    return {
      archiveNoticeFlags: archiveNoticeFlags,
    };
  },
  emits: ['update:enabled', 'update:flags'],
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-toggle-button-group v-model="internalFlags" :buttons="archiveNoticeFlags"/>
    </action-container>
  `,
  computed: {
    internalFlags: {
      get() {
        return Array.from(this.flags);
      },
      set(newValue: ManagementFlag[]) {
        this.$emit('update:flags', new Set(newValue));
      },
    },
  },
});
