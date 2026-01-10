import { defineComponent } from 'vue';
import { spiHelperGetPages } from '../../api.ts';
import { type MenuItemData } from '@wikimedia/codex';
import { spiHelperSettings } from '../../options';

const ITEM_LIMIT = 10;

export const PageLookupComponent = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    placeholder: { type: String, default: 'Page' },
    label: { type: String, default: null },
    namespace: { type: Number, required: true },
    prefix: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  data() {
    const menuConfig = {
      visibleItemLimit: 6,
      searchQuery: '',
    };
    const pageSuggestions: MenuItemData[] = [];
    const messages = {
      success: 'Page exists',
      warning: 'Page not found',
    };
    const selection: string | number | null = null;

    return {
      lookupStatus: 'default',
      messages: messages,
      selection: selection,
      pageSuggestions: pageSuggestions,
      menuConfig: menuConfig,
      useLookup: spiHelperSettings.useLookup,
    };
  },
  template: `
    <cdx-field :status="lookupStatus" :messages="messages" :hide-label="!label">
      <template v-if="label" #label>
        {{ label }}
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
  methods: {
    async onUpdateInputValue(value: string) {
      this.menuConfig.searchQuery = value;
      // Clear menu items if there is no input.
      if (!value) {
        this.pageSuggestions = [];
        return;
      }

      await this.$nextTick(() => {
        spiHelperGetPages(this.fullPagename, 4, ITEM_LIMIT)
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
      });
    },
    onLoadMore() {
      if (!this.pagename) {
        return;
      }

      spiHelperGetPages(this.fullPagename, 4, this.pageSuggestions.length + ITEM_LIMIT)
        .then((pages) => {
          if (!pages || pages.length === 0) {
            return;
          }

          this.pageSuggestions = pages
            .filter(page => !page.title.includes('/Archive'))
            .map(page => ({
              label: this.stripTitle(page.title),
              value: page.pageid.toString(),
            }));
        })
        .catch(() => {
        });
    },
    async validateInstantly() {
      await this.$nextTick(() => {
        if (this.pagename.length === 0) {
          this.lookupStatus = 'default';
          return;
        }
        const selection = this.pageSuggestions.find(item => item.label === this.pagename) ?? null;
        if (selection !== null) {
          (this.selection as string | number | null) = selection.value;
        }
        this.lookupStatus = this.selection === null ? 'warning' : 'success';
      });
    },
    onSelection(newSelection: string) {
      if (newSelection !== null) {
        this.lookupStatus = 'success';
      }
    },
    stripTitle(fullTitle: string): string {
      return fullTitle.split(this.prefix)[1] || fullTitle;
    },
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
});
