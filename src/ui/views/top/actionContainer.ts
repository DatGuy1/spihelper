import { defineComponent } from 'vue';

export const ActionContainerComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    empty: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:enabled'],
  data() {
    return { built: this.enabled };
  },
  watch: {
    enabled(newValue: boolean) {
      if (!newValue || this.built) {
        return;
      }
      // Hand the switch a frame to repaint before building
      requestAnimationFrame(() => {
        this.built = this.enabled;
      });
    },
  },
  template: `
    <cdx-toggle-switch class="enableSwitch" :disabled="disabled" :model-value="enabled" @update:model-value="$emit('update:enabled', $event)">
      Enabled
    </cdx-toggle-switch>
    <div v-if="!empty && built" v-show="enabled">
      <slot />
    </div>
  `,
});
