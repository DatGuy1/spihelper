import { defineComponent } from 'vue';
import { WatchOptions, WatchOptionsSelect } from '../../../types/vue.ts';

export const WatchSettingComponent = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
    resetTrigger: { type: Number, default: 0 }, // Watch for reset signal
  },
  data() {
    return {
      internalValue: this.modelValue,
      watchOptions: WatchOptionsSelect,
      messages: { error: 'Watch option is invalid' },
    };
  },
  computed: {
    status() {
      return WatchOptions.includes(this.internalValue) ? 'default' : 'error';
    },
  },
  watch: {
    resetTrigger() {
      this.internalValue = this.modelValue;
    },
    internalValue(newValue) {
      this.$emit('update:modelValue', newValue);
    },
  },
  template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="internalValue"
      />
    </cdx-field>
  `,
});
