import { defineComponent } from 'vue';
import { spiHelperGetPages } from '../../api.ts';
import { type MenuItemData, type ValidationStatusType } from '@wikimedia/codex';
import { spiHelperSettings } from '../../options';

const ITEM_LIMIT = 10;

interface Data {
  lookupStatus: ValidationStatusType;
  messages: { success: string; warning: string };
  selection: string | number | null;
  pageSuggestions: MenuItemData[];
  menuConfig: { visibleItemLimit: number; searchQuery: string };
  useLookup: boolean;
}

export const PageLookupComponent = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    placeholder: { type: String, default: 'Page' },
    label: { type: String, default: null },
    description: { type: String, default: null },
    namespace: { type: Number, required: true },
    prefix: { type: String, default: '' },
    validateMessage: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  data(): Data {
    const menuConfig = {
      visibleItemLimit: 6,
      searchQuery: '',
    };
    const messages = {
      success: 'Page exists',
      warning: 'Page not found',
    };

    return {
      lookupStatus: 'default',
      messages: messages,
      pageSuggestions: [],
      useLookup: spiHelperSettings.useLookup,
      selection: null,
      menuConfig,
    };
  },
  computed: {
    pagename: {
      get() {
        return this.modelValue;
      },
      set(value: string) {
        this.$emit('update:modelValue', value);
      },
    },
    fullPagename() {
      return `${this.prefix}${this.pagename}`;
    },
  },
  methods: {
    async onUpdateInputValue(value: string) {
      this.menuConfig.searchQuery = value;
      // Clear menu items if there is no input.
      if (!value) {
        this.pageSuggestions = [];
        return;
      }

      await this.$nextTick();
      spiHelperGetPages(this.fullPagename, this.namespace, ITEM_LIMIT)
        .then((pages) => {
          // Make sure this data is still relevant first.
          if (this.pagename !== value) {
            return;
          }

          // Reset the menu items if there are no results.
          if (pages.length === 0) {
            this.pageSuggestions = [];
            return;
          }

          // Update the suggestions
          this.pageSuggestions = pages
            .filter(page => !page.title.includes('/Archive'))
            .map(page => ({
              label: this.stripTitle(page.title),
              value: page.pageid.toString(),
            }));
        })
        .catch(() => {
          // On error, set results to empty.
          this.pageSuggestions = [];
        });
    },
    onLoadMore() {
      if (!this.pagename) {
        return;
      }

      spiHelperGetPages(this.fullPagename, this.namespace, this.pageSuggestions.length + ITEM_LIMIT)
        .then((pages) => {
          if (pages.length === 0) {
            return;
          }

          this.pageSuggestions = pages
            .filter(page => !page.title.includes('/Archive'))
            .map(page => ({
              label: this.stripTitle(page.title),
              value: page.pageid.toString(),
            }));
        },
        () => { /* empty */ },
        );
    },
    async validateInstantly() {
      await this.$nextTick();
      if (this.pagename.length === 0) {
        this.lookupStatus = 'default';
        return;
      }
      const selection = this.pageSuggestions.find(item => item.label === this.pagename) ?? null;
      if (selection !== null) {
        (this.selection) = selection.value;
      }
      this.lookupStatus = this.selection === null ? 'warning' : 'success';
    },
    onSelection(newSelection: string | number | null) {
      if (newSelection !== null) {
        this.lookupStatus = 'success';
      }
    },
    stripTitle(fullTitle: string): string {
      if (this.prefix) {
        return fullTitle.split(this.prefix)[1] ?? fullTitle;
      }
      if (this.namespace === 0) {
        return fullTitle;
      }
      return fullTitle.split(':')[1] ?? fullTitle;
    },
  },
  template: `
    <cdx-field :status="lookupStatus" :messages="validateMessage ? messages : {}" :hide-label="!label">
      <template v-if="label" #label>
        {{ label }}
      </template>
      <template v-if="description" #description>
        {{ description }}
      </template>
      <cdx-lookup
          v-if="useLookup"
          v-model:selected="selection"
          v-model:input-value="pagename"
          :menu-items="pageSuggestions"
          :menu-config="menuConfig"
          :placeholder="placeholder"
          @update:input-value="onUpdateInputValue"
          @load-more="onLoadMore"
          @focus="onLoadMore"
          @update:selected="onSelection"
          @blur="validateInstantly"
          @keydown.enter="validateInstantly"
          @clear="validateInstantly"
          clearable
      >
        <template #no-results>
          No pages found
        </template>
      </cdx-lookup>
      <cdx-text-input v-else v-model="pagename" :placeholder="placeholder" clearable />
    </cdx-field>
  `,
});
