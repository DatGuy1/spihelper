import { type PropType, defineComponent } from 'vue';
import type { SectionSelection } from '../../../../state.ts';
import { spiHelperCanSuppressRedirect } from '../../../../role.ts';

export const MoveActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    target: { type: String, required: true },
    suppress: { type: Boolean, required: true },
    addNote: { type: Boolean, required: true },
    selection: { type: [Object, null] as PropType<SectionSelection | null>, required: true },
    archiveEnabled: { type: Boolean, required: true },
  },
  emits: ['update:enabled', 'update:target', 'update:suppress', 'update:addNote', 'moveEntireCase'],
  data() {
    return {
      canSuppressRedirect: spiHelperCanSuppressRedirect(),
    };
  },
  computed: {
    isSectionMove(): boolean {
      return this.selectionType === 'single';
    },
    moveTitle(): string {
      if (!this.selection) {
        return 'ERROR';
      }
      if (this.selection.type === 'all') {
        return 'entire case';
      }
      if (this.selection.type === 'multiple') {
        return `${this.selection.sections.length} sections`;
      }
      return 'section ' + this.selection.section.name;
    },
    disabled(): boolean {
      return this.archiveEnabled || this.selectionType === 'multiple';
    },
    selectionType() {
      return this.selection?.type ?? null;
    },
  },
  watch: {
    archiveEnabled: {
      handler(enabled: boolean) {
        if (enabled) {
          this.$emit('update:enabled', false);
        }
      },
      immediate: true,
    },
  },
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event);"
                      :disabled="disabled">
      <h3>Moving {{ moveTitle }}</h3>
      <page-lookup :model-value="target" @update:model-value="$emit('update:target', $event)"
                   :namespace="4" prefix="Sockpuppet investigations/"
                   placeholder="Title" label="New Case Name" />
      <cdx-message v-if="isSectionMove" type="notice" :allow-user-dismiss="true" style="margin-top: 16px;">
        <p><strong>You are moving a section</strong></p>
        <p>
          Make sure you are expecting to move only the section and not the entire case.
          If you wish to move the entire case, <a @click="$emit('moveEntireCase')">click here</a>
        </p>
      </cdx-message>
      <cdx-checkbox style="margin-top: 16px;" v-if="!isSectionMove" :model-value="suppress"
                    @update:model-value="$emit('update:suppress', $event)">
        {{ canSuppressRedirect ? 'Suppress redirect' : 'Request redirect deletion' }}
        <template #description>
          <template v-if="canSuppressRedirect">
            Delete the old case page
          </template>
          <template v-else>
            Request <a href="//en.wikipedia.org/wiki/Wikipedia:Speedy_deletion#G6._Technical_deletions">G6</a> deletion
            of the old case page
          </template>
          (one you're on right now)
        </template>
      </cdx-checkbox>
      <cdx-checkbox v-if="!isSectionMove" :model-value="addNote" @update:model-value="$emit('update:addNote', $event)">
        Add old case note in archives
        <template #description>
          Adds a note for the original case name in merged archives to help distinguish them
        </template>
      </cdx-checkbox>
    </action-container>
    <cdx-message v-if="archiveEnabled" type="warning" :inline="true">
      Archival is enabled, which overrides moving.
    </cdx-message>
    <cdx-message v-if="selectionType === 'multiple'" type="warning" :inline="true">
      Moving isn't currently supported while multiple sections are selected.
    </cdx-message>
  `,
});
