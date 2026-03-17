import { type PropType, defineComponent } from 'vue';
import { spiHelperSettings } from '../../../../options';
import type { SectionSelection } from '../../../../state.ts';
import { spiHelperCanSuppressRedirect } from '../../../../role.ts';

export const MoveActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    target: { type: String, required: true },
    suppress: { type: Boolean, required: true },
    selection: { type: Object as PropType<SectionSelection | null>, required: true },
    archiveEnabled: { type: Boolean, required: true },
  },
  emits: ['update:enabled', 'update:target', 'update:suppress'],
  data() {
    return {
      canSuppressRedirect: spiHelperCanSuppressRedirect(),
    };
  },
  computed: {
    allowSectionMoves(): boolean {
      return this.selectionType === 'all'
        || (this.isSectionMove && spiHelperSettings.iUnderstandSectionMoves);
    },
    isSectionMove(): boolean {
      return this.selectionType === 'specific';
    },
    moveTitle(): string {
      if (!this.selection) {
        return 'ERROR';
      }
      if (this.selection.type === 'all') {
        return 'entire case';
      }
      return 'section ' + this.selection.section.name;
    },
    disabled(): boolean {
      return this.archiveEnabled || (this.isSectionMove && !this.allowSectionMoves);
    },
    selectionType() {
      return this.selection?.type ?? null;
    },
  },
  watch: {
    selectionType: {
      handler(newType: 'all' | 'specific' | null) {
        if (newType === 'specific') {
          if (!this.allowSectionMoves) {
            this.$emit('update:enabled', false);
          }
        }
      },
      immediate: true,
    },
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
        <p>Make sure you are expecting to only move the section and not the entire case.</p>
      </cdx-message>
      <cdx-checkbox style="margin-top: 16px;" v-if="!isSectionMove" :model-value="suppress" @update:model-value="$emit('update:suppress', $event)">
        {{ canSuppressRedirect ? 'Suppress redirect' : 'Request redirect deletion' }}
        <template #description>
          <template v-if="canSuppressRedirect">
            Delete the old case page
          </template>
          <template v-else>
            Request <a href="//en.wikipedia.org/wiki/Wikipedia:Speedy_deletion#G6._Technical_deletions">G6</a> deletion of the old case page
          </template>
          (one you're on right now)
        </template>
      </cdx-checkbox>
    </action-container>
    <cdx-message v-if="isSectionMove && !allowSectionMoves" type="error" :inline="true">
      You do not yet understand section moves. You probably want to move the entire case.
    </cdx-message>
    <cdx-message v-if="archiveEnabled" type="warning" :inline="true">
      Archival is enabled, which overrides moving.
    </cdx-message>
  `,
});
