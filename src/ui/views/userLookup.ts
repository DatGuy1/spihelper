import { defineComponent } from 'vue';
import { spiHelperGetUsers } from '../../api.ts';
import type { MenuItemData, ValidationStatusType } from '@wikimedia/codex';
import type { AllUser, UserRow } from '../../types';
import { abortableDelay, isAborted } from '../utils.ts';
import { spiHelperSettings } from '../../options';

type UserMenuItem = MenuItemData & { customData: AllUser };

const ITEM_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 250;

function toMenuItem(user: AllUser): UserMenuItem {
  return {
    label: user.name,
    value: user.userid.toString(),
    customData: user,
  };
}

export function UpdateUserAllUserData(data: AllUser, row: UserRow) {
  if (data.blockid !== undefined) {
    row.block.block = true;
  }
  if (data.blocknocreate !== undefined) {
    row.block.acb = data.blocknocreate;
  }
  if (data.blockemail !== undefined) {
    row.block.nem = data.blockemail;
  }
  if (mw.util.isIPAddress(data.name)) {
    if (data.blockanononly !== undefined) {
      row.block.abao = data.blockanononly;
    }
  }
  else {
    if (data.blockautoblocking !== undefined) {
      row.block.abao = data.blockautoblocking;
    }
  }
  if (data.blockowntalk !== undefined) {
    row.block.ntp = data.blockowntalk;
  }
  if (data.blockexpiry) {
    row.block.duration = data.blockexpiry;
  }
}

interface Data {
  lookupStatus: ValidationStatusType;
  messages: { success: string; warning: string };
  selection: string | number | null;
  userSuggestions: UserMenuItem[];
  menuConfig: { visibleItemLimit: number; searchQuery: string };
  useLookup: boolean;
  searchController: AbortController | null;
}

export const UserLookupComponent = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: false, default: '' },
    allowEmpty: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'user-selected'],
  data(): Data {
    const menuConfig = {
      visibleItemLimit: 6,
      searchQuery: '',
    };
    const messages = {
      success: 'Valid user',
      warning: 'User not found',
      error: 'Field must not be empty',
    };

    return {
      lookupStatus: 'default',
      messages,
      selection: null,
      userSuggestions: [],
      menuConfig,
      useLookup: spiHelperSettings.useLookup,
      searchController: null,
    };
  },
  computed: {
    username: {
      get() {
        return this.modelValue;
      },
      set(value: string) {
        this.$emit('update:modelValue', value);
      },
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
      const trimmedValue = value.trim();
      this.menuConfig.searchQuery = trimmedValue;
      const signal = this.startSearch();
      // Clear menu items if there is no input.
      if (!trimmedValue) {
        this.userSuggestions = [];
        return;
      }

      await abortableDelay(SEARCH_DEBOUNCE_MS, signal);
      if (isAborted(signal)) {
        return;
      }

      const users = await spiHelperGetUsers({ from: trimmedValue, limit: ITEM_LIMIT, signal });
      // An aborted request resolves to an empty list too, so check before clearing
      if (isAborted(signal)) {
        return;
      }

      this.userSuggestions = users.map(toMenuItem);
    },
    // Focusing a field that already has suggestions doesn't need to re-ask for them
    onFocus() {
      if (this.userSuggestions.length === 0) {
        void this.onLoadMore();
      }
    },
    async onLoadMore() {
      if (!this.username) {
        return;
      }

      const signal = this.startSearch();
      const users = await spiHelperGetUsers({
        from: this.username.trim(),
        limit: this.userSuggestions.length + ITEM_LIMIT,
        signal,
      });
      if (isAborted(signal) || users.length === 0) {
        return;
      }

      this.userSuggestions = users.map(toMenuItem);
    },
    async validateInstantly() {
      // Await nextTick in case the user has selected a menu item via the Enter key - this
      // will ensure the selection ref has been updated.
      await this.$nextTick();
      // Set 'warning' status if there's input but no selection. This might happen if a
      // user types something but doesn't select an item from the menu.
      if (this.username.length === 0) {
        this.lookupStatus = this.allowEmpty ? 'default' : 'error';
        return;
      }
      if (mw.util.isIPAddress(this.username)) {
        this.lookupStatus = 'default';
        return;
      }
      const selection = this.userSuggestions.find(item =>
        item.label === this.username
        || item.label?.trim() === this.username.trim(),
      ) ?? null;
      if (selection !== null) {
        this.$emit('user-selected', selection.customData);
        (this.selection) = selection.value;
      }
      this.lookupStatus = this.selection === null ? 'warning' : 'success';
    },
    onSelection(newSelection: string | null) {
      if (newSelection !== null) {
        const selection = this.userSuggestions.find(item => item.value === newSelection) ?? null;
        if (selection) {
          this.$emit('user-selected', selection.customData);
        }
        this.lookupStatus = 'success';
      }
    },
  },
  template: `
    <cdx-field :status="lookupStatus" :messages="messages" :hide-label="!label">
      <cdx-lookup
          v-if="useLookup"
          v-model:selected="selection"
          v-model:input-value="username"
          :menu-items="userSuggestions"
          :menu-config="menuConfig"
          placeholder="Sock"
          @update:input-value="onUpdateInputValue"
          @load-more="onLoadMore"
          @focus="onFocus"
          @update:selected="onSelection"
          @blur="validateInstantly"
          @keydown.enter="validateInstantly"
          @clear="validateInstantly"
          clearable
          class="user-lookup"
      >
        <template #no-results>
          No users found
        </template>
      </cdx-lookup>
      <cdx-text-input v-else v-model="username" placeholder="Sock" clearable class="user-lookup" />
      <template v-if="label" #label>
        {{ label }}
      </template>
    </cdx-field>
  `,
});
