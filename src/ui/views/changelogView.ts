import { type PropType, defineComponent } from 'vue';
import type { ChangelogEntry } from '../../changelog.ts';

export const ChangelogViewComponent = defineComponent({
  props: {
    unseenChanges: { type: Array as PropType<[string, ChangelogEntry ][]>, required: true },
    openState: { type: Object as PropType<{ isOpen: boolean }>, required: true },
  },
  methods: {
    onClose() {
      this.openState.isOpen = false;
      this.$emit('dismissed');
    },
  },
  template: `
    <cdx-dialog
        v-model:open="openState.isOpen"
        title="What's new"
        @update:open="onClose"
    >
      <div v-for="[version, entry] in unseenChanges" :key="version">
        <h3 style="display: inline;">{{ version }}</h3> · <span class="cdx-muted-text">{{ entry.date }}</span>
        <ul>
          <li v-for="change in entry.changes" :key="change">{{ change }}</li>
        </ul>
      </div>

      <template #footer>
        <cdx-button action="progressive" @click="onClose">Got it</cdx-button>
      </template>
    </cdx-dialog>`,
});
