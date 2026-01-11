import { defineComponent } from 'vue';
import { spiHelperGetUsers } from '../../api.ts';
import { type MenuItemData, type ValidationStatusType } from '@wikimedia/codex';
import type { AllUser } from '../../types/api.ts';
import { spiHelperSettings } from '../../options';
import type { SockRow } from '../../types/spi.ts';

const ITEM_LIMIT = 10;

export function HandleUserSelected(data: AllUser, row: SockRow) {
  if (data.blockid !== undefined) {
    row.block = true;
  }
  if (data.blocknocreate !== undefined) {
    row.acb = data.blocknocreate;
  }
  if (data.blockemail !== undefined) {
    row.nem = data.blockemail;
  }
  // TODO: Support autoblock once T413535 is merged
  if (mw.util.isIPAddress(data.name) && data.blockanononly !== undefined) {
    row.abao = data.blockanononly;
  }
  if (data.blockowntalk !== undefined) {
    row.ntp = data.blockowntalk;
  }
  if (data.blockexpiry) {
    row.duration = data.blockexpiry;
  }
}

interface Data {
  lookupStatus: ValidationStatusType;
  messages: { success: string; warning: string };
  selection: string | number | null;
  userSuggestions: (MenuItemData & { customData: AllUser })[];
  menuConfig: { visibleItemLimit: number; searchQuery: string };
  useLookup: boolean;
}

export const UserLookupComponent = defineComponent({
  props: {
    modelValue: { type: String, required: true },
    label: { type: String, required: false },
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
    };

    return {
      lookupStatus: 'default',
      messages,
      selection: null,
      userSuggestions: [],
      menuConfig,
      useLookup: spiHelperSettings.useLookup,
    };
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
          @focus="onLoadMore"
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
  methods: {
    onUpdateInputValue(value: string) {
      this.menuConfig.searchQuery = value;
      // Clear menu items if there is no input.
      if (!value) {
        this.userSuggestions = [];
        return;
      }

      spiHelperGetUsers(value, ITEM_LIMIT)
        .then((users) => {
          // Make sure this data is still relevant first.
          if (this.username !== value) {
            return;
          }

          // Reset the menu items if there are no results.
          if (users.length === 0) {
            this.userSuggestions = [];
            return;
          }

          // Update the suggestions
          this.userSuggestions = users.map(user => ({
            label: user.name,
            value: user.userid.toString(),
            customData: user,
          }));
        })
        .catch(() => {
          // On error, set results to empty.
          this.userSuggestions = [];
        });
    },
    onLoadMore() {
      if (!this.username) {
        return;
      }

      spiHelperGetUsers(this.username, this.userSuggestions.length + ITEM_LIMIT)
        .then((users) => {
          if (users.length === 0) {
            return;
          }

          this.userSuggestions = users.map(user => ({
            label: user.name,
            value: user.userid.toString(),
            customData: user,
          }));
        },
        () => { /* empty */ },
        );
    },
    async validateInstantly() {
      // Await nextTick in case the user has selected a menu item via the Enter key - this
      // will ensure the selection ref has been updated.
      await this.$nextTick(() => {
        // Set 'warning' status if there's input but no selection. This might happen if a
        // user types something but doesn't select an item from the menu.
        if (this.username.length === 0 || mw.util.isIPAddress(this.username)) {
          this.lookupStatus = 'default';
          return;
        }
        const selection = this.userSuggestions.find(item => item.label === this.username) ?? null;
        if (selection !== null) {
          this.$emit('user-selected', selection.customData);
          (this.selection) = selection.value;
        }
        this.lookupStatus = this.selection === null ? 'warning' : 'success';
      });
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
});
