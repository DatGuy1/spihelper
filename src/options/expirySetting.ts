import type { ComponentOptions } from 'vue';
import { parseExpiry } from './utils.ts';

export const ExpirySettingComponent: ComponentOptions = {
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
  },
  data() {
    return {
      expirySetting: this.modelValue,
      messages: { error: 'Expiry option is invalid', success: 'Valid expiry option' },
      touched: false,
    };
  },
  computed: {
    valid() {
      return parseExpiry(this.expirySetting) !== null;
    },
    status() {
      if (!this.touched) return 'default';
      return this.valid ? 'success' : 'warning';
    },
  },
  watch: {
    expirySetting(newValue) {
      this.touched = true;
      if (this.valid) {
        this.$emit('update:modelValue', newValue);
      }
    },
  },
  template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="expirySetting" />
    </cdx-field>
  `,
};
