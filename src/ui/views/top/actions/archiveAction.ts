import { type PropType, defineComponent } from 'vue';
import type { SectionSelection } from '../../../../state.ts';
import type { CaseActions, CaseStatus } from '../../../../types';
import { resolveEffectiveStatus } from '../utils';

export const ArchiveActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    selection: { type: [Object, null] as PropType<SectionSelection | null>, required: true },
    statusAction: { type: Object as PropType<CaseActions['status']>, required: true },
  },
  emits: ['update:enabled'],
  computed: {
    isMultiSelectMode(): boolean {
      return this.selection?.type === 'multiple';
    },
    // Sections in the selection whose current/pending status isn't 'closed', paired
    // with that status, so the warning can say what each one actually is
    skippedSections(): { name: string; status: string }[] {
      if (this.selection?.type !== 'multiple') {
        return [];
      }
      return this.selection.sections
        .map(section => ({ name: section.name, status: this.effectiveSectionStatus(section.id) }))
        .filter(entry => entry.status !== 'closed');
    },
    badStatus(): boolean {
      if (!this.selection || this.selection.type === 'all') {
        return false;
      }
      if (this.selection.type === 'multiple') {
        return this.skippedSections.length === this.selection.sections.length;
      }
      return this.status !== 'closed';
    },
    status(): CaseStatus {
      const { enabled, data } = this.statusAction;
      return resolveEffectiveStatus({ enabled, old: data.old, new: data.new });
    },
  },
  methods: {
    // Each section in a multi-select carries its own toggle, so the entry is the whole change
    effectiveSectionStatus(sectionId: number): CaseStatus | '' {
      const entry = this.statusAction.data.bySection.get(sectionId);
      return entry ? resolveEffectiveStatus(entry) : '';
    },
  },
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);" :empty="true" :disabled="badStatus" />
    <cdx-message v-if="badStatus && !isMultiSelectMode" type="warning" :inline="true">
      The selected section's status is '{{ status }}'. If you'd like to archive, please change it to 'closed'
    </cdx-message>
    <cdx-message v-if="isMultiSelectMode && skippedSections.length > 0" type="warning">
      <p>These sections aren't set to 'closed' and will be skipped:</p>
      <ul>
        <li v-for="section in skippedSections" :key="section.name">
          {{ section.name }} is set to '{{ section.status }}'
        </li>
      </ul>
      <p>If you'd like to archive them, change their status to 'closed'.</p>
    </cdx-message>
  `,
});
