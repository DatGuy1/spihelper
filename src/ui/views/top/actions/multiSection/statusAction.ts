import { type PropType, defineComponent } from 'vue';
import type { CaseActions, CaseStatusChoice, SectionEntry, SectionStatusChange } from '../../../../../types';

type StatusBySection = CaseActions['status']['data']['bySection'];

const defaultEntry: SectionStatusChange = { old: 'new', new: 'nochange', enabled: false };

// One independent change-status-action per section selected in multi-select mode. Each
// section gets its own enabled flag - they must not share caseActions.status.enabled, or
// toggling one section's status would toggle all of them.
export const MultiSectionStatusActionComponent = defineComponent({
  props: {
    sections: { type: Array as PropType<SectionEntry[]>, required: true },
    bySection: { type: Object as PropType<StatusBySection>, required: true },
  },
  // Bubbled up so topView can auto-update that section's own comment text to match,
  // same as the single-section status -> comment sync
  emits: ['update-section-status'],
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
    onUpdateNewStatus(sectionId: number, newStatus: CaseStatusChoice) {
      const existing = this.bySection.get(sectionId);
      if (existing) {
        existing.new = newStatus;
      }
      this.$emit('update-section-status', sectionId, newStatus);
    },
  },
  template: `
    <div v-for="section in sections" :key="section.id" class="spiHelper-multi-section-entry">
      <h4>{{ section.name }}</h4>
      <change-status-action :enabled="entry(section.id).enabled"
                            @update:enabled="onUpdateEnabled(section.id, $event)"
                            :old-status="entry(section.id).old" :new-status="entry(section.id).new"
                            @update:new-status="onUpdateNewStatus(section.id, $event)" />
    </div>
  `,
});
