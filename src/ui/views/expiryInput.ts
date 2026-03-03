import { defineComponent } from 'vue';
import { parseExpiry } from '../../utils.ts';

interface Data {
  messages: { warning: string; success: string };
  showSuccess: boolean;
  internalTouched: boolean;
  successTimeout: number | null;
}

export const ExpiryInputComponent = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: { type: String, required: false, default: '' },
    label: { type: String, required: false, default: '' },
    touched: { type: Boolean, default: false },
    shortened: { type: Boolean, default: false },
    autoDismiss: { type: Boolean, default: false },
  },
  emits: ['update:touched'],
  data(): Data {
    return {
      messages: {
        warning: this.shortened ? 'Invalid' : 'Expiry option is invalid',
        success: this.shortened ? 'Valid' : 'Valid expiry option',
      },
      showSuccess: !this.autoDismiss,
      internalTouched: this.touched,
      successTimeout: null,
    };
  },
  computed: {
    valid() {
      return parseExpiry(this.modelValue) !== null;
    },
    status() {
      if (!this.internalTouched || this.modelValue.length === 0) return 'default';
      if (this.valid) {
        return this.showSuccess ? 'success' : 'default';
      }
      else {
        return 'warning';
      }
    },
  },
  watch: {
    modelValue() {
      // Update internal state
      this.internalTouched = true;

      if (!this.autoDismiss) {
        return;
      }
      if (this.successTimeout) {
        clearTimeout(this.successTimeout);
      }

      if (this.valid) {
        this.showSuccess = true;
        this.successTimeout = window.setTimeout(() => {
          this.showSuccess = false;
        }, 3000);
      }
    },
    internalTouched(newValue: boolean) {
      this.$emit('update:touched', newValue);
    },
  },
  beforeUnmount() {
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  },
  template: `
    <cdx-field :status="status" :messages="messages" class="spihelper-expiry-input" :hide-label="!label">
      <template #label>{{ label }}</template>
      <cdx-text-input v-model="modelValue" v-bind="$attrs" />
    </cdx-field>
  `,
});
