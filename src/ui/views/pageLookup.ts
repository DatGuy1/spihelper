import { defineComponent } from 'vue';
import { spiHelperGetPages } from '../../api.ts';
import { type MenuItemData, type ValidationStatusType } from '@wikimedia/codex';
import type { AllPage } from '../../types';
import { abortableDelay, isAborted } from '../utils.ts';
import { spiHelperSettings } from '../../options';

const ITEM_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 250;

interface Data {
  lookupStatus: ValidationStatusType;
  messages: { success: string; warning: string };
  selection: string | number | null;
  pageSuggestions: MenuItemData[];
  menuConfig: { visibleItemLimit: number; searchQuery: string };
  useLookup: boolean;
  searchController: AbortController | null;
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
      searchController: null,
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
  beforeUnmount() {
    this.cancelPendingSearch();
  },
  methods: {
    cancelPendingSearch() {
      this.searchController?.abort();
      this.searchController = null;
    },
    startSearch(): AbortSignal {
      this.cancelPendingSearch();
      const controller = new AbortController();
      this.searchController = controller;
      return controller.signal;
    },
    async onUpdateInputValue(value: string) {
      this.menuConfig.searchQuery = value;
      const signal = this.startSearch();
      // Clear menu items if there is no input.
      if (!value) {
        this.pageSuggestions = [];
        return;
      }

      // Built from the typed value rather than fullPagename: the prop behind that only
      // catches up once the parent has emitted it back, and nothing here needs to wait
      const query = `${this.prefix}${value}`;
      await abortableDelay(SEARCH_DEBOUNCE_MS, signal);
      if (isAborted(signal)) {
        return;
      }

      const pages = await spiHelperGetPages({
        from: query,
        namespace: this.namespace,
        limit: ITEM_LIMIT,
        signal,
      });
      // An aborted request resolves to null too, so check before clearing
      if (isAborted(signal)) {
        return;
      }

      this.pageSuggestions = this.toMenuItems(pages ?? []);
    },
    onFocus() {
      if (this.pageSuggestions.length === 0) {
        void this.onLoadMore();
      }
    },
    async onLoadMore() {
      if (!this.pagename) {
        return;
      }

      const signal = this.startSearch();
      const pages = await spiHelperGetPages({
        from: this.fullPagename,
        namespace: this.namespace,
        limit: this.pageSuggestions.length + ITEM_LIMIT,
        signal,
      });
      if (isAborted(signal) || !pages?.length) {
        return;
      }

      this.pageSuggestions = this.toMenuItems(pages);
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
    toMenuItems(pages: AllPage[]): MenuItemData[] {
      return pages
        .filter(page => !page.title.includes('/Archive'))
        .map(page => ({
          label: this.stripTitle(page.title),
          value: page.pageid.toString(),
        }));
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
          @focus="onFocus"
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
