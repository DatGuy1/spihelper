import type { ComponentOptions } from 'vue';
import { WatchOptions, WatchOptionsSelect } from '../types/vue.ts';

export const WatchSettingComponent: ComponentOptions = {
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
  },
  data() {
    return {
      watchSetting: this.modelValue,
      watchOptions: WatchOptionsSelect,
      messages: { error: 'Watch option is invalid' },
    };
  },
  computed: {
    status() {
      return WatchOptions.includes(this.watchSetting) ? 'default' : 'error';
    },
  },
  watch: {
    watchSetting(newValue) {
      this.$emit('update:modelValue', newValue);
    },
  },
  template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ this.label }}</template>
      <cdx-select
          :menu-items="watchOptions"
          v-model:selected="watchSetting"
      />
    </cdx-field>
  `,
};
