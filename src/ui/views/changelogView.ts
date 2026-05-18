import { type PropType, defineComponent } from 'vue';
import type { ChangelogEntry, VersionDate } from '../../changelog.ts';
import { MODE } from '../../constants';

export const ChangelogViewComponent = defineComponent({
  props: {
    unseenChanges: { type: Array as PropType<[string, ChangelogEntry ][]>, required: true },
    openState: { type: Object as PropType<{ isOpen: boolean }>, required: true },
  },
  data() {
    return {
      beta: MODE !== 'production',
    };
  },
  methods: {
    onClose() {
      this.openState.isOpen = false;
      this.$emit('dismissed');
    },
    resolveDate(date: string | VersionDate): string {
      if (typeof date === 'string') return date;
      return this.beta ? date.beta : date.stable;
    },
  },
  template: `
    <cdx-dialog
        v-model:open="openState.isOpen"
        title="What's new"
        @update:open="onClose"
    >
      <div v-for="[version, entry] in unseenChanges" :key="version">
        <h3 style="display: inline;">{{ version }}</h3> · {{ resolveDate(entry.date) }}
        <ul>
          <li v-for="change in entry.changes" :key="change">{{ change }}</li>
        </ul>
      </div>

      <p style="margin-top: 12px;"><a href="//en.wikipedia.org/wiki/User:DatGuy/spihelper/changelog.json">See all change history</a></p>
      
      <cdx-message v-if="beta" style="padding: 12px; margin-top: 24px">
        <p><strong>Beta Reminder</strong></p>
        <p>You are running a beta version.</p>
        <p>It is recommended to double-check your edits, especially ones that are impacted by a recent change.</p>
      </cdx-message>

      <template #footer>
        <cdx-button action="progressive" @click="onClose">Got it</cdx-button>
      </template>
    </cdx-dialog>`,
});
