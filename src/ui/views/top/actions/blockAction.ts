import { type PropType, defineComponent } from 'vue';
import { cdxIconCopy, cdxIconDownload, cdxIconTrash } from '@wikimedia/codex-icons';
import type { AllUser } from '../../../../types/api.ts';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from '../../../../role.ts';
import { HandleUserSelected } from '../../userLookup.ts';
import type { AltmasterTag, BlockOptions, SockRow, Tag } from '../../../../types/spi.ts';
import { isNonRegisteredAccount } from '../../../../utils.ts';

interface TagOption { value: Tag; label: string }
type TagOptions = (TagOption | { label: string; items: TagOption[] })[];

export const BlockActionComponent = defineComponent({
  props: {
    modelValue: { type: Array as PropType<SockRow[]>, required: true },
    blockOptions: { type: Object as PropType<BlockOptions>, required: true },
    userLocks: { type: Map as PropType<Map<string, boolean>>, required: true },
    enabled: { type: Boolean, required: true },
  },
  data() {
    const columns = [
      { id: 'username', label: 'Username' },
      { id: 'tag', label: 'Tag' },
      { id: 'altmaster', label: 'Alternate Master Tag' },
      { id: 'lock', label: 'Request Lock' },
    ];
    const isAdmin = spiHelperIsAdmin();
    const isCheckuser = spiHelperIsCheckuser();
    const isClerk = spiHelperIsClerk();
    if (isAdmin) {
      columns.splice(1, 0, ...[
        { id: 'block', label: 'Block' },
        { id: 'duration', label: 'Duration' },
        { id: 'acb', label: 'ACB' },
        { id: 'abao', label: 'AB/AO' },
        { id: 'ntp', label: 'NTP' },
        { id: 'nem', label: 'NEM' },
      ]);
    }

    const tagOptions: TagOptions = [
      { value: 'none', label: 'None' },
      {
        label: 'Sock',
        items: [
          { value: 'Ssuspected', label: 'S-Suspected' },
          { value: 'Sproven', label: 'S-Proven' },
          { value: 'Sconfirmed', label: 'S-Confirmed' },
        ],
      }, {
        label: 'Master',
        items: [
          { value: 'Mblocked', label: 'M-Blocked' },
          { value: 'Mconfirmed', label: 'M-Confirmed' },
          { value: 'Mbanned', label: 'M-3X Banned' },
        ],
      },
    ];

    const altmasterOptions: { value: AltmasterTag; label: string }[] = [
      { value: 'none', label: 'None' },
      { value: 'suspected', label: 'Suspected' },
      { value: 'proven', label: 'Proven' },
    ];

    const allTagSelections = {
      tag: 'none',
      altmaster: 'none',
    };

    // An array of selected row indices
    const selectedRows: number[] = [];

    const topButtonActions = { copied: false, fetched: false };

    return {
      columns,
      tagOptions,
      altmasterOptions,
      allTagSelections,
      selectedRows,
      topButtonActions,
      isAdmin,
      isCheckuser,
      isClerk,
      cdxIconCopy,
      cdxIconDownload,
      cdxIconTrash,
    };
  },
  emits: ['update:enabled', 'update:modelValue', 'update:blockOptions', 'removeRows', 'addRow', 'userSelected', 'usernameChanged', 'fetchRows'],
  template: `
    <!--suppress VueUnrecognizedDirective, VueUnrecognizedSlot -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <div role="group" aria-labelledby="spiHelper-blockoptions-group-label" class="spiHelper-blockoptions-group">
        <cdx-label id="spiHelper-blockoptions-group-label">
          {{ isAdmin ? 'Block Options' : 'Tag Options' }}
        </cdx-label>

        <cdx-checkbox v-model="blockOptions.noBlock" v-if="isAdmin">
          Do not make any blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.override" v-if="isAdmin" :disabled="blockOptions.noBlock">
          Override any existing blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.tagUnattached" v-if="isClerk">
          Tag accounts without an attached local account
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.cuBlock" v-if="isCheckuser">
          Mark blocks as Checkuser blocks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.cuBlockOnly" v-if="isCheckuser" :disabled="!blockOptions.cuBlock">
          <span v-pre>
            Suppress the usual block summary and only use {{checkuserblock-account}} and {{checkuserblock}}
          </span>
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.addMasterNotice" v-if="isAdmin">
          Add talk page notice when (re)blocking the sockmaster
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.addSockNotice" v-if="isAdmin">
          Add talk page notice when blocking socks
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.blankTalk" v-if="isAdmin">
          Blank the talk page when adding talk notices
        </cdx-checkbox>
        <cdx-checkbox v-model="blockOptions.lockHideNames">
          Hide usernames when requesting global locks
        </cdx-checkbox>
      </div>
      <cdx-table caption="Socks" :show-vertical-borders="true" :use-row-selection="true"
                 :columns="columns" :data="modelValue" v-model:selected-rows="selectedRows"
                 class="spiHelper-sockTable">
        <template #header>
          <div class="header-content">
            <span>
              {{ selectedRows.length }} sock{{ selectedRows.length === 1 ? '' : 's' }} selected
            </span>
            <span class="header-content-buttons">
              <cdx-button @click="copySocks" aria-label="Copy socks">
                <cdx-icon :icon="cdxIconCopy" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.copied" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('copied')" @auto-dismissed="onMessageDismissed('copied')"
                           :inline="true">Copied!</cdx-message>
              <cdx-button @click="fetchSocks" aria-label="Fetch socks from comment">
                <cdx-icon :icon="cdxIconDownload" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.fetched" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('fetched')"
                           @auto-dismissed="onMessageDismissed('fetched')"
                           :inline="true">Fetched from comment!</cdx-message>
              <cdx-button @click="removeSocks" action="destructive" aria-label="Remove selected rows">
                <cdx-icon :icon="cdxIconTrash" />
              </cdx-button>
            </span>
          </div>
        </template>
        <template #thead>
          <thead>
          <tr>
            <th class="cdx-table__table__select-rows" :rowspan="isAdmin ? 2 : 1">
              <cdx-checkbox
                  v-model="selectAll"
                  :hide-label="true"
                  :indeterminate="selectAllIndeterminate"
                  @update:model-value="handleSelectAll"
              >
                Select all
              </cdx-checkbox>
            </th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1">Username</th>
            <th scope="col" rowspan="2" v-if="isAdmin" class="checkboxHeader">Block</th>
            <th scope="col" rowspan="2" v-if="isAdmin" style="width: 300px;">Duration</th>
            <th scope="colgroup" colspan="4" v-if="isAdmin">Block Settings</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="selectHeader">Tag</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="selectHeader">Alternate Master Tag</th>
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="checkboxHeader">Lock</th>
          </tr>
          <tr v-if="isAdmin" class="blockSettingsRow">
            <th scope="col" v-tooltip="'Account Creation Blocked'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              ACB
            </th>
            <th scope="col" class="spihelper-hovertext cdx-table__table__cell--align-center">
              <span v-tooltip="'Autoblock (for logged-in users)'">AB</span>
              /
              <span v-tooltip="'Anonymous-only (for IPs)'">AO</span>
            </th>
            <th scope="col" v-tooltip="'Disable talkpage access'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              NTP
            </th>
            <th scope="col" v-tooltip="'Disable email'"
                class="spihelper-hovertext cdx-table__table__cell--align-center">
              NEM
            </th>
          </tr>
          <tr class="setAllRow">
            <th scope="col" style="border-right: none;" />
            <!-- Do this instead of rowspan="2" to align it properly -->
            <th scope="col" style="min-width: 150px;">(all users)</th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('block', $event)">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAll('duration', $event)" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('acb', $event)">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('abao', $event)">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('ntp', $event)">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('nem', $event)">
                Set all no email
              </cdx-checkbox>
            </th>

            <th scope="col" class="selectTagOptions">
              <cdx-select :menu-items="tagOptions" v-model:selected="allTagSelections.tag"
                          @update:selected="setAll('tag', $event)" />
            </th>
            <th scope="col" class="selectTagOptions">
              <cdx-select :menu-items="altmasterOptions" v-model:selected="allTagSelections.altmaster"
                          @update:selected="setAll('altmaster', $event)" />
            </th>

            <th scope="col">
              <cdx-checkbox :hide-label="true" @update:model-value="setAll('lock', $event)">
                Set all request locks
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)"
                       @update:model-value="handleUsernameChange($event, row)" />
        </template>

        <template #item-block="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block" :disabled="blockOptions.noBlock">Block</cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.duration" :shortened="true" :auto-dismiss="true" placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.acb">Account creation blocked</cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.abao">Autoblock/Anon-only</cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.ntp">No talk page</cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.nem">No email</cdx-checkbox>
        </template>

        <template #item-tag="{ item, row }">
          <cdx-select :menu-items="tagOptions" v-model:selected="row.tag"
                      :disabled="isNonRegisteredAccount(row.username)" class="tagOptions" />
        </template>

        <template #item-altmaster="{ item, row }">
          <cdx-select :menu-items="altmasterOptions" v-model:selected="row.altmaster"
                      :disabled="isNonRegisteredAccount(row.username)" />
        </template>

        <template #item-lock="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.lock"
                        :disabled="isNonRegisteredAccount(row.username) || userLocks.get(row.username) === true">
            Request lock
          </cdx-checkbox>
        </template>

        <template #footer>
          <cdx-button @click="addDefaultRow">Add Row</cdx-button>
        </template>
      </cdx-table>
    </action-container>
  `,
  computed: {
    selectAll(): boolean {
      return this.selectedRows.length === this.modelValue.length;
    },
    selectAllIndeterminate(): boolean {
      if (this.selectedRows.length === this.modelValue.length) {
        return false;
      }
      else return this.selectedRows.length !== 0;
    },
  },
  methods: {
    isNonRegisteredAccount,
    async copySocks() {
      if (this.selectedRows.length === 0) {
        return;
      }
      let text = '{{sock list';
      this.selectedRows.forEach((row, index) => {
        const rowData = this.modelValue[row];
        if (!rowData) return;
        text += `|${index + 1}=${rowData.username}`;
      });
      text += '}}';
      await navigator.clipboard.writeText(text);
      this.topButtonActions.copied = true;
    },
    onMessageDismissed(actionType: 'copied' | 'fetched') {
      // I feel like this is bad practice. Why doesn't Codex expose onFadedOut?
      setTimeout(() => {
        this.topButtonActions[actionType] = false;
      }, 200);
    },
    removeSocks() {
      this.$emit('removeRows', this.selectedRows);
      this.selectedRows = [];
    },
    addDefaultRow() {
      this.$emit('addRow');
    },
    // Taken from https://github.com/wikimedia/design-codex/blob/main/packages/codex/src/components/table/Table.vue
    /**
     * Handle "select all" changes.
     *
     * @param newValue Whether the "select all" box is checked.
     */
    handleSelectAll(newValue: boolean) {
      // Always remove indeterminate status.
      this.selectAllIndeterminate = false;

      if (newValue) {
        this.selectedRows = this.modelValue.map((_row, index) => index);
      }
      else {
        this.selectedRows = [];
      }
    },
    handleUserSelected(data: AllUser, row: SockRow) {
      HandleUserSelected(data, row);
    },
    handleUsernameChange(username: string, row: SockRow) {
      this.$emit('usernameChanged', username, this.modelValue.findIndex((item: SockRow) => item.username === row.username));
    },
    setAll<K extends keyof SockRow>(key: K, value: SockRow[K]) {
      for (const row of this.modelValue) {
        if (key === 'lock' && this.userLocks.get(row.username) === true) {
          continue;
        }
        row[key] = value;
      }
    },
    fetchSocks() {
      this.topButtonActions.fetched = true;
      this.$emit('fetchRows');
    },
  },
});
