import type { ComponentOptions } from 'vue';
import { parseExpiry } from './utils.ts';

export const ExpirySettingComponent: ComponentOptions = {
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
    resetTrigger: { type: Number, default: 0 }, // Watch for reset signal
  },
  data() {
    return {
      internalValue: this.modelValue,
      messages: { warning: 'Expiry option is invalid', success: 'Valid expiry option' },
      touched: false,
      isResetting: false, // Flag to track reset state
    };
  },
  computed: {
    valid() {
      return parseExpiry(this.internalValue) !== null;
    },
    status() {
      if (!this.touched) return 'default';
      return this.valid ? 'success' : 'warning';
    },
  },
  watch: {
    resetTrigger() {
      this.isResetting = true;
      this.internalValue = this.modelValue;
      this.touched = false;
      void this.$nextTick(() => {
        this.isResetting = false;
      });
    },
    internalValue(newValue) {
      if (!this.isResetting) {
        this.touched = true;
      }
      if (parseExpiry(newValue) !== null) {
        this.$emit('update:modelValue', newValue);
      }
    },
  },
  template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="internalValue"/>
    </cdx-field>
  `,
};
