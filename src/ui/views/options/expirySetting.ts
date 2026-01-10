import { defineComponent } from 'vue';
import { parseExpiry } from '../../../utils.ts';

export const ExpirySettingComponent = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: true },
    resetTrigger: { type: Number, default: 0 }, // Watch for reset signal
  },
  data() {
    return {
      internalValue: this.modelValue,
      touched: false,
      isResetting: false, // Flag to track reset state
    };
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
    <expiry-input :label="label" :touched="touched" v-model="internalValue" />
  `,
});
