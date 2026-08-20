import { type PropType, defineComponent } from 'vue';
import type { CaseActions, SectionEntry } from '../../../../../types';

type CommentBySection = CaseActions['comment']['data']['bySection'];

const defaultEntry = { text: '* ', enabled: false };

// One independent comment-action per section selected in multi-select mode.
// Each section gets its own enabled flag
export const MultiSectionCommentActionComponent = defineComponent({
  props: {
    sections: { type: Array as PropType<SectionEntry[]>, required: true },
    bySection: { type: Object as PropType<CommentBySection>, required: true },
  },
  methods: {
    entry(sectionId: number) {
      return this.bySection.get(sectionId) ?? defaultEntry;
    },
    onUpdateEnabled(sectionId: number, enabled: boolean) {
      const existing = this.bySection.get(sectionId);
      if (existing) {
        existing.enabled = enabled;
      }
    },
    onUpdateText(sectionId: number, text: string) {
      const existing = this.bySection.get(sectionId);
      if (existing) {
        existing.text = text;
      }
    },
  },
  template: `
    <div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
      <h4>{{ section.name }}</h4>
      <comment-action :enabled="entry(section.id).enabled"
                      @update:enabled="onUpdateEnabled(section.id, $event)"
                      :text="entry(section.id).text"
                      @update:text="onUpdateText(section.id, $event)"
                      :selected-section="{ type: 'single', section }" />
    </div>
  `,
});
