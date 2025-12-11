import type { ComponentOptions } from 'vue';

export const LogPageSettingComponent: ComponentOptions = {
  props: {
    modelValue: { type: String, required: true },
    prefix: { type: String, required: true },
  },
  data() {
    return {
      inputValue: this.modelValue,
      messages: { error: 'Page name is invalid' },
      resetValue: 'spihelper_log',
    };
  },
  computed: {
    valid() {
      return this.inputValue.length > 0
        && mw.Title.newFromText(this.prefix + this.inputValue) !== null;
    },
    status() {
      return this.valid ? 'default' : 'error';
    },
  },
  watch: {
    inputValue(newValue) {
      if (this.valid) {
        this.$emit('update:modelValue', newValue);
      }
    },
  },
  methods: {
    resetInput() {
      this.inputValue = this.resetValue;
    },
  },
  template: `
    <cdx-field :status="status" :messages="messages">
      <template #label>Page</template>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-family: monospace; color: #666">{{ this.prefix }}</span>
        <cdx-text-input v-model="inputValue" style="flex-grow: 1;"/>
      </div>
      <cdx-button @click="resetInput">
        Reset
      </cdx-button>
      <template #description>Page in your userspace to log to</template>
    </cdx-field>
  `,
};
