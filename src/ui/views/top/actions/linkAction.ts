import { type PropType, defineComponent } from 'vue';
import { cdxIconAdd, cdxIconTrash } from '@wikimedia/codex-icons';
import type { AllUser } from '../../../../types/api.ts';
import { spiHelperLinkViewURLFormats } from '../../../../constants/linkview.ts';
import type { UserRow } from '../../../../types/spi.ts';

type ColumnId = 'analyser' | 'timeline' | 'timecard' | 'pages' | 'summary' | 'cuwiki';
type LinkRecord = Record<ColumnId, { url: URL; label: string }>;

// noinspection DuplicatedCode
export const LinkActionComponent = defineComponent({
  props: {
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    caseName: { type: String, required: true },
    enabled: { type: Boolean, required: true },
  },
  data() {
    const columns: { id: ColumnId | 'username'; label: string }[] = [
      { id: 'username', label: 'Username' },
      { id: 'analyser', label: 'Interaction Analyser' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'timecard', label: 'Timecard' },
      { id: 'pages', label: 'Pages' },
      { id: 'summary', label: 'Summaries' },
      { id: 'cuwiki', label: 'CU wiki' },
    ];
    const optionColumns = columns.slice(1) as { id: ColumnId; label: string }[];

    // An array of selected row indices
    const selectedRows: number[] = [];

    return {
      columns,
      optionColumns,
      selectedRows,
      cdxIconAdd,
      cdxIconTrash,
    };
  },
  emits: ['update:enabled', 'update:modelValue', 'removeRows', 'addRow', 'userSelected', 'usernameChanged'],
  template: `
    <!--suppress VueUnrecognizedDirective -->
    <action-container v-model:enabled="enabled" @update:enabled="$emit('update:enabled', $event)">
      <cdx-table :hide-caption="false" caption="Links" :use-row-selection="true"
                 :columns="columns" :data="accounts" v-model:selected-rows="selectedRows"
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

        <template #item-analyser="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.analyser">Editor interaction analyser</cdx-checkbox>
        </template>
        <template #item-timeline="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.timeline">Consolidated timeline</cdx-checkbox>
        </template>
        <template #item-timecard="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.timecard">Timecard</cdx-checkbox>
        </template>
        <template #item-pages="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.pages">Pages</cdx-checkbox>
        </template>
        <template #item-summary="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.summary">Summaries</cdx-checkbox>
        </template>
        <template #item-cuwiki="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.link.cuwiki">CheckUser wiki</cdx-checkbox>
        </template>
      </cdx-table>
      <ul>
        <li v-for="[columnId, linkItem] in Object.entries(linkItems)" :key="columnId">
          <a :href="linkItem.url.href">{{ linkItem.label }}</a>
        </li>
      </ul>
    </action-container>
  `,
  watch: {
    selectedRows(newValue: number[], oldValue: number[]) {
      // Probably not best practice!
      const oldSet = new Set(oldValue);
      const newSet = new Set(newValue);

      const toggle = (index: number, enabled: boolean) => {
        const row = this.accounts[index];
        if (row) this.toggleRow(row, enabled);
      };

      for (const index of newSet) {
        if (!oldSet.has(index)) toggle(index, true);
      }

      for (const index of oldSet) {
        if (!newSet.has(index)) toggle(index, false);
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
        this.selectedRows = [...this.accounts.keys()];
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
      this.$emit('removeRows', this.selectedRowIDs);
      this.selectedRows = [];
    },
    toggleColumn(key: ColumnId, value: boolean) {
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
    getLinkFormat(columnId: ColumnId) {
      switch (columnId) {
        case 'analyser':
          return spiHelperLinkViewURLFormats.editorInteractionAnalyser;
        case 'cuwiki':
          return spiHelperLinkViewURLFormats.checkUserWikiSearch;
        case 'pages':
          return spiHelperLinkViewURLFormats.sandals.pages;
        case 'summary':
          return spiHelperLinkViewURLFormats.sandals.summaries;
        case 'timecard':
          return spiHelperLinkViewURLFormats.sandals.timecard;
        case 'timeline':
          return spiHelperLinkViewURLFormats.sandals.consolidatedTimeline;
        default:
          return null;
      }
    },
  },
  computed: {
    columnState() {
      const rows = this.accounts;
      const state: Record<ColumnId, {
        checked: boolean;
        indeterminate: boolean;
      }> = {} as never;

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
        && this.optionColumns.every(k => this.columnState[k.id].checked);
    },
    allColumnsIndeterminate(): boolean {
      const checkedCount = this.optionColumns.filter(
        k => this.columnState[k.id].checked,
      ).length;

      return checkedCount > 0 && checkedCount < this.optionColumns.length;
    },
    linkItems(): Partial<LinkRecord> {
      const result: Partial<LinkRecord> = {};
      for (const linkColumn of this.optionColumns) {
        const linkFormat = this.getLinkFormat(linkColumn.id);
        if (linkFormat === null) {
          console.error('Couldn\'t find link format for', linkColumn.id);
          continue;
        }

        const resultUrl = linkFormat.baseUrl(this.caseName);
        const includedUsers: string[] = this.accounts.reduce((accumulator: string[], row) => {
          if (row.link[linkColumn.id]) {
            accumulator.push(
              linkFormat.userQueryStringWrapper + row.username + linkFormat.userQueryStringWrapper,
            );
          }
          return accumulator;
        }, []);
        if (includedUsers.length === 0) {
          continue;
        }

        if (linkFormat.multipleUserQueryStringKeys) {
          for (const username of includedUsers) {
            resultUrl.searchParams.append(linkFormat.userQueryStringKey, username);
          }
        }
        else {
          resultUrl.searchParams.set(
            linkFormat.userQueryStringKey, includedUsers.join(linkFormat.userQueryStringSeparator),
          );
        }
        result[linkColumn.id] = { url: resultUrl, label: linkColumn.label };
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
    selectedRowIDs(): string[] {
      return this.selectedRows
        .map(index => this.accounts[index]?.id)
        .filter((id): id is string => !!id);
    },
  },
});
