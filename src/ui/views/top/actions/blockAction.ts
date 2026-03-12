import { type PropType, defineComponent } from 'vue';
import {
  cdxIconCopy,
  cdxIconDownload,
  cdxIconTrash,
  cdxIconUserAvatar,
  cdxIconUserAvatarOutline,
} from '@wikimedia/codex-icons';
import type { AllUser, BlockEntry } from '../../../../types/api.ts';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from '../../../../role.ts';
import { type BlockOptions, type BlockRowData, SockpuppetTag, type Tag, type UserRow } from '../../../../types/spi.ts';
import { isNonRegisteredAccount, isSockmasterTag, isSockpuppetTag } from '../../../../utils.ts';

export const BlockActionComponent = defineComponent({
  props: {
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    blockOptions: { type: Object as PropType<BlockOptions>, required: true },
    userLocks: { type: Map as PropType<Map<string, boolean>>, required: true },
    userBlocks: { type: Map as PropType<Map<string, BlockEntry>>, required: true },
    defaultMaster: { type: String, required: true },
    fetchType: { type: String as PropType<'comment' | 'clipboard'>, required: true },
    enabled: { type: Boolean, required: true },
  },
  emits: ['update:enabled', 'update:modelValue', 'update:blockOptions', 'removeRows', 'addRow', 'userSelected', 'usernameChanged', 'fetchRows'],
  data() {
    const columns = [
      { id: 'username', label: 'Username' },
      { id: 'tag', label: 'Tag' },
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

    // An array of selected row indices
    const selectedRows: number[] = [];

    const topButtonActions = { copied: false, fetched: false };
    const popovers = {
      all: {
        open: false,
        tag: null as Tag | null,
      },
      row: {
        anchor: null as HTMLElement | null,
        open: false,
        tag: null as Tag | null,
        tagIndex: 0,
        rowId: null as string | null,
      },
      clipboardTag: null as Tag | null,
    };

    return {
      columns,
      selectedRows,
      topButtonActions,
      isAdmin,
      isCheckuser,
      isClerk,
      popovers,
      cdxIconCopy,
      cdxIconDownload,
      cdxIconTrash,
      cdxIconUserAvatar,
      cdxIconUserAvatarOutline,
    };
  },
  computed: {
    selectAll(): boolean {
      return this.selectedRows.length === this.accounts.length;
    },
    selectAllIndeterminate(): boolean {
      if (this.selectedRows.length === this.accounts.length) {
        return false;
      }
      else return this.selectedRows.length !== 0;
    },
    selectedRowIDs(): string[] {
      return this.selectedRows
        .map(index => this.accounts[index]?.id)
        .filter((id): id is string => !!id);
    },
  },
  methods: {
    isNonRegisteredAccount,
    isSockmasterTag,
    async copySocks() {
      if (this.selectedRows.length === 0) {
        return;
      }
      let text = '{{sock list';
      let i = 0;
      this.selectedRows.forEach((row) => {
        const rowData = this.accounts[row];
        if (!rowData) return;
        text += `|${++i}=${rowData.username}`;
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
      this.$emit('removeRows', this.selectedRowIDs);
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
        this.selectedRows = [...this.accounts.keys()];
      }
      else {
        this.selectedRows = [];
      }
    },
    handleUserSelected(data: AllUser, row: UserRow) {
      this.$emit('userSelected', data, row.id);
    },
    setAllBlockFields<K extends keyof BlockRowData>(key: K, value: BlockRowData[K]) {
      for (const row of this.getTargetRows()) {
        // Check if we should ignore
        if (key === 'lock' && this.userLocks.get(row.username) === true) {
          continue;
        }
        else if (key === 'block' && this.userBlocks.get(row.username) !== undefined) {
          continue;
        }
        else if (key === 'acb' && this.userBlocks.get(row.username)?.acb) {
          continue;
        }
        else if (key === 'abao' && this.userBlocks.get(row.username)?.abao) {
          continue;
        }
        else if (key === 'ntp' && this.userBlocks.get(row.username)?.ntp) {
          continue;
        }
        else if (key === 'nem' && this.userBlocks.get(row.username)?.nem) {
          continue;
        }
        row.block[key] = value;
      }
    },
    setAllTags(tag: Tag) {
      for (const row of this.getTargetRows()) {
        row.block.tags = [tag.clone()];
      }
    },
    getTargetRows() {
      if (this.selectedRows.length === 0) return this.accounts;
      const selected = new Set(this.selectedRows);
      return this.accounts.filter((_, i) => selected.has(i));
    },
    fetchSocks() {
      this.topButtonActions.fetched = true;
      this.$emit('fetchRows');
    },
    showTagPopover(
      tag: Tag | null,
      tagIndex: number,
      rowId: string,
      $event: MouseEvent,
    ) {
      this.popovers.row.tag = tag;
      this.popovers.row.tagIndex = tagIndex;
      this.popovers.row.rowId = rowId;
      this.popovers.row.anchor = $event.currentTarget as HTMLElement;
      this.popovers.row.open = true;
    },
    handleTagUpdate(updatedTag: Tag) {
      const targetRow = this.accounts.find(row => row.id === this.popovers.row.rowId);
      if (!targetRow) {
        console.error('Could not find target row for tag update', this.popovers.row.rowId);
        return;
      }
      targetRow.block.tags.splice(this.popovers.row.tagIndex, 1, updatedTag);
    },
    handleTagDelete() {
      const targetRow = this.accounts.find(row => row.id === this.popovers.row.rowId);
      if (!targetRow) {
        console.error('Could not find target row for tag delete', this.popovers.row.rowId);
        return;
      }
      targetRow.block.tags.splice(this.popovers.row.tagIndex, 1);
    },
    handleTagAdd(rowId: string): Tag | null {
      const targetRow = this.accounts.find(row => row.id === rowId);
      if (!targetRow) {
        console.error('Could not find target row for tag add', rowId);
        return null;
      }
      const newTag = new SockpuppetTag({ master: this.defaultMaster, status: 'blocked' });
      targetRow.block.tags.push(newTag);
      return newTag;
    },
    getRowTagsWithDefault(tags: Tag[]): (Tag | null)[] {
      if (tags.length === 0) {
        return [null];
      }
      else {
        return tags;
      }
    },
    handleTagAddAll() {
      for (const row of this.accounts) {
        row.block.tags.push(new SockpuppetTag({ master: this.defaultMaster, status: 'blocked' }));
      }
    },
    handleTagDeleteAll() {
      for (const row of this.accounts) {
        row.block.tags.length = 0;
      }
    },
    validateTag(tag: Tag) {
      // Ensure it isn't a sockpuppet tag without a master
      return !(isSockpuppetTag(tag) && !tag.master);
    },
  },
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
                 :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
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
              <cdx-button @click="fetchSocks" :aria-label="'Fetch socks from ' + fetchType">
                <cdx-icon :icon="cdxIconDownload" />
              </cdx-button>
              <cdx-message v-if="topButtonActions.fetched" type="success" :fade-in="true" :auto-dismiss="2000"
                           @user-dismissed="onMessageDismissed('fetched')"
                           @auto-dismissed="onMessageDismissed('fetched')"
                           :inline="true">Fetched from {{ fetchType }}!</cdx-message>
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
            <th scope="col" :rowspan="isAdmin ? 2 : 1" class="tagHeader">Tag</th>
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
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('block', $event)">
                Set all block
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <expiry-input placeholder="Duration" @update:model-value="setAllBlockFields('duration', $event)" />
            </th>

            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('acb', $event)">
                Set all account creation blocked
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('abao', $event)">
                Set all autoblock/anon-only
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('ntp', $event)">
                Set all no talk page
              </cdx-checkbox>
            </th>
            <th scope="col" v-if="isAdmin">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('nem', $event)">
                Set all no email
              </cdx-checkbox>
            </th>

            <th scope="col" class="selectTagOptions">
              <cdx-button ref="selectAllTagButton" @click="popovers.all.open = true">
                Set all tags
              </cdx-button>
              <tag-popover :anchor="$refs.selectAllTagButton" :default-master="defaultMaster"
                           v-model:open="popovers.all.open" :tag="popovers.all.tag"
                           :clipboard-tag="popovers.clipboardTag" @update:tag="setAllTags"
                           @deleteTag="handleTagDeleteAll" @addTag="handleTagAddAll"
                           @copyTag="popovers.clipboardTag = $event" />
            </th>

            <th scope="col">
              <cdx-checkbox :hide-label="true" @update:model-value="setAllBlockFields('lock', $event)">
                Set all request locks
              </cdx-checkbox>
            </th>
          </tr>
          </thead>
        </template>
        <template #item-username="{ item, row }">
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)" />
        </template>

        <template #item-block="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.block"
                        :disabled="blockOptions.noBlock || userBlocks.get(row.username) !== undefined">
            Block
          </cdx-checkbox>
        </template>

        <template #item-duration="{ item, row }">
          <expiry-input v-model="row.block.duration" :shortened="true" :auto-dismiss="true" placeholder="Duration" />
        </template>

        <template #item-acb="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.acb"
                        :disabled="!blockOptions.override && userBlocks.get(row.username)?.acb">
            Account creation blocked
          </cdx-checkbox>
        </template>
        <template #item-abao="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.abao"
                        :disabled="!blockOptions.override && userBlocks.get(row.username)?.abao">
            Autoblock/Anon-only
          </cdx-checkbox>
        </template>
        <template #item-ntp="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.ntp"
                        :disabled="!blockOptions.override && userBlocks.get(row.username)?.ntp">
            No talk page
          </cdx-checkbox>
        </template>
        <template #item-nem="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.nem"
                        :disabled="!blockOptions.override && userBlocks.get(row.username)?.nem">
            No email
          </cdx-checkbox>
        </template>

        <template #item-tag="{ item, row }">
          <cdx-button v-for="(tag, index) in getRowTagsWithDefault(row.block.tags)" class="userTag"
                      @click="showTagPopover(tag, index, row.id, $event)" :action="validateTag(tag) ? 'default' : 'destructive'">
            <cdx-icon v-if="tag !== null"
                      :icon="isSockmasterTag(tag) ? cdxIconUserAvatar : cdxIconUserAvatarOutline"
                      :title="isSockmasterTag(tag) ? 'Master' : 'Sockpuppet'" />
            {{ tag === null ? 'None' : isSockmasterTag(tag) ? tag.status.charAt(0).toUpperCase() + tag.status.slice(1) : tag.master }}
          </cdx-button>
        </template>

        <template #item-lock="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.block.lock"
                        :disabled="isNonRegisteredAccount(row.username) || userLocks.get(row.username) === true">
            Request lock
          </cdx-checkbox>
        </template>

        <template #footer>
          <cdx-button @click="addDefaultRow">Add Row</cdx-button>
        </template>
      </cdx-table>
      <tag-popover :anchor="popovers.row.anchor" v-model:open="popovers.row.open" :default-master="defaultMaster"
                   :tag="popovers.row.tag" :clipboard-tag="popovers.clipboardTag" @update:tag="handleTagUpdate"
                   @deleteTag="handleTagDelete" @addTag="handleTagAdd(popovers.row.rowId)"
                   @copyTag="popovers.clipboardTag = $event" />
    </action-container>
  `,
});
