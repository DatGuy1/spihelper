import { type PropType, defineComponent } from 'vue';
import { cdxIconAdd, cdxIconTrash } from '@wikimedia/codex-icons';
import type { AllUser, LinkTool, UserRow } from '../../../../types';
import {
  spiHelperPaginationSizeOptions,
  spiHelperPaginationThreshold,
} from '../../../../constants';
import { spiHelperSettings } from '../../../../options';
import { buildLinkToolUrl, getLinkTools, linkToolNeedsCase } from '../../../../links.ts';

export type LinkRecord = Record<string, { url: URL; label: string }>;

export interface LinkColumn {
  id: string;
  label: string;
  // The cdx-table slot the column's cells render through
  slot: string;
  tool: LinkTool;
}

export const LinkActionComponent = defineComponent({
  props: {
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    caseName: { type: String, required: true },
  },
  emits: ['update:modelValue', 'removeRows', 'addRow', 'userSelected', 'usernameChanged'],
  data() {
    // An array of selected row IDs
    const selectedRows: string[] = [];

    return {
      linkTools: getLinkTools(spiHelperSettings.linkTools),
      selectedRows,
      cdxIconAdd,
      cdxIconTrash,
      spiHelperPaginationSizeOptions,
    };
  },
  computed: {
    optionColumns(): LinkColumn[] {
      // A tool that needs the case name has nothing to link to without one
      return this.linkTools
        .filter(tool => this.caseName || !linkToolNeedsCase(tool))
        .map(tool => ({ id: tool.id, label: tool.label, slot: `item-${tool.id}`, tool }));
    },
    columns(): { id: string; label: string }[] {
      return [
        { id: 'username', label: 'Username' },
        ...this.optionColumns.map(({ id, label }) => ({ id, label })),
      ];
    },
    paginate(): boolean {
      return this.accounts.length > spiHelperPaginationThreshold;
    },
    columnState() {
      const rows = this.accounts;
      const state: Record<string, {
        checked: boolean;
        indeterminate: boolean;
      }> = {};

      for (const column of this.optionColumns) {
        if (rows.length === 0) {
          state[column.id] = {
            checked: false,
            indeterminate: false,
          };
          continue;
        }

        const values = rows.map(r => r.link[column.id]);
        const all = values.every(Boolean);
        const none = values.every(v => !v);

        state[column.id] = {
          checked: all,
          indeterminate: !all && !none,
        };
      }

      return state;
    },
    allColumnsChecked(): boolean {
      return this.accounts.length > 0
        && this.optionColumns.every(k => this.columnState[k.id]?.checked);
    },
    allColumnsIndeterminate(): boolean {
      const checkedCount = this.optionColumns.filter(
        k => this.columnState[k.id]?.checked,
      ).length;

      return checkedCount > 0 && checkedCount < this.optionColumns.length;
    },
    linkItems(): LinkRecord {
      const result: LinkRecord = {};
      for (const linkColumn of this.optionColumns) {
        const includedUsers = this.accounts
          .filter(row => row.link[linkColumn.id])
          .map(row => row.username);
        if (includedUsers.length === 0) {
          continue;
        }

        const resultUrl = buildLinkToolUrl(linkColumn.tool, this.caseName, includedUsers);
        if (resultUrl) {
          result[linkColumn.id] = { url: resultUrl, label: linkColumn.label };
        }
      }
      return result;
    },
    selectAll(): boolean {
      return this.accounts.length > 0 && this.selectedRows.length === this.accounts.length;
    },
    selectAllIndeterminate(): boolean {
      if (this.selectedRows.length === this.accounts.length) {
        return false;
      }
      else return this.selectedRows.length !== 0;
    },
  },
  watch: {
    selectedRows(newValue: string[], oldValue: string[]) {
      const oldSet = new Set(oldValue);
      const newSet = new Set(newValue);
      const rowsById = new Map(this.accounts.map(row => [row.id, row]));

      const toggle = (id: string, enabled: boolean) => {
        const row = rowsById.get(id);
        if (row) this.toggleRow(row, enabled);
      };

      for (const id of newSet) {
        if (!oldSet.has(id)) toggle(id, true);
      }

      for (const id of oldSet) {
        if (!newSet.has(id)) toggle(id, false);
      }
    },
  },
  methods: {
    /**
     * Handle "select all" changes.
     *
     * @param newValue Whether the "select all" box is checked.
     */
    handleSelectAll(newValue: boolean) {
      if (newValue) {
        this.selectedRows = this.accounts.map(row => row.id);
      }
      else {
        this.selectedRows = [];
      }
    },
    handleUserSelected(data: AllUser, row: UserRow) {
      this.$emit('userSelected', data, row.id);
    },
    addDefaultRow() {
      this.$emit('addRow');
    },
    removeRows() {
      this.$emit('removeRows', [...this.selectedRows]);
      this.selectedRows = [];
    },
    toggleColumn(key: string, value: boolean) {
      for (const row of this.accounts) {
        row.link[key] = value;
      }
    },
    toggleAllColumns(value: boolean) {
      for (const column of this.optionColumns) {
        this.toggleColumn(column.id, value);
      }
    },
    toggleRow(row: UserRow, value: boolean) {
      for (const col of this.optionColumns) {
        row.link[col.id] = value;
      }
    },
  },
  template: `
    <!--suppress VueUnrecognizedDirective -->
    <cdx-table :hide-caption="false" caption="Links" :use-row-selection="true"
               :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
               :paginate="paginate" :pagination-size-options="spiHelperPaginationSizeOptions"
               class="spiHelper-sockTable linkTable">
      <template #header>
        <div class="header-content">
          <span>
            {{ selectedRows.length }} row{{ selectedRows.length === 1 ? '' : 's' }} selected
          </span>
          <span class="header-content-buttons">
            <cdx-button action="progressive" @click="addDefaultRow" aria-label="Add row">
              <cdx-icon :icon="cdxIconAdd" />
            </cdx-button>
            <cdx-button @click="removeRows" action="destructive" aria-label="Remove selected rows">
              <cdx-icon :icon="cdxIconTrash" />
            </cdx-button>
          </span>
        </div>
      </template>
      <template #thead>
        <thead>
        <tr>
          <th class="cdx-table__table__select-rows">
            <cdx-checkbox
                v-model="selectAll"
                :hide-label="true"
                :indeterminate="selectAllIndeterminate"
                @update:model-value="handleSelectAll"
            >
              Select all rows
            </cdx-checkbox>
          </th>
          <th scope="col">Username</th>
          <th v-for="column in optionColumns" :key="column.id">
            {{ column.label }}
          </th>
        </tr>
        <tr class="setAllRow">
          <th scope="col">
            <cdx-checkbox
                :hide-label="true" :model-value="allColumnsChecked"
                :indeterminate="allColumnsIndeterminate" @update:model-value="toggleAllColumns">
              Select all columns
            </cdx-checkbox>
          </th>
          <th scope="col" style="padding-left: 12px; min-width: 155px;">(all users)</th>
          <th v-for="column in optionColumns" :key="column.id">
            <cdx-checkbox
                :hide-label="true" :model-value="columnState[column.id].checked"
                :indeterminate="columnState[column.id].indeterminate"
                @update:model-value="toggleColumn(column.id, $event)">
              Toggle all rows for {{ column.label }}
            </cdx-checkbox>
          </th>
        </tr>
        </thead>
      </template>
      <template #item-username="{ item, row }">
        <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)" />
      </template>

      <template v-for="column in optionColumns" :key="column.id" #[column.slot]="{ row }">
        <cdx-checkbox :hide-label="true" v-model="row.link[column.id]">{{ column.label }}</cdx-checkbox>
      </template>
    </cdx-table>
    <ul>
      <li v-for="[columnId, linkItem] in Object.entries(linkItems)" :key="columnId">
        <a :href="linkItem.url.href">{{ linkItem.label }}</a>
      </li>
    </ul>
  `,
});
