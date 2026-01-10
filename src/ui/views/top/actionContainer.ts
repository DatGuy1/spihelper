import { defineComponent } from 'vue';

export const ActionContainerComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    empty: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:enabled'],
  template: `
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="enabled && !empty">
      <slot />
    </div>
  `,
});
