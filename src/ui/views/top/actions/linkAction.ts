import { type PropType, defineComponent } from 'vue';
import { cdxIconAdd, cdxIconTrash } from '@wikimedia/codex-icons';
import type { AllUser } from '../../../../types/api.ts';
import { spiHelperLinkViewURLFormats } from '../../../../constants/linkview.ts';
import type { LinkRow, SockRow } from '../../../../types/spi.ts';

type ColumnId = 'analyser' | 'timeline' | 'timecard' | 'pages' | 'summary' | 'cuwiki';
type LinkRecord = Record<ColumnId, { url: URL; label: string }>;

// noinspection DuplicatedCode
export const LinkActionComponent = defineComponent({
  props: {
    modelValue: { type: Array as PropType<LinkRow[]>, required: true },
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
                 :columns="columns" :data="modelValue" v-model:selected-rows="selectedRows"
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
          <user-lookup v-model="row.username" @user-selected="handleUserSelected($event, row)"
                       @update:model-value="handleUsernameChange($event, row)" />
        </template>

        <template #item-analyser="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.analyser">Editor interaction analyser</cdx-checkbox>
        </template>
        <template #item-timeline="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.timeline">Consolidated timeline</cdx-checkbox>
        </template>
        <template #item-timecard="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.timecard">Timecard</cdx-checkbox>
        </template>
        <template #item-pages="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.pages">Pages</cdx-checkbox>
        </template>
        <template #item-summary="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.summary">Summaries</cdx-checkbox>
        </template>
        <template #item-cuwiki="{ item, row }">
          <cdx-checkbox :hide-label="true" v-model="row.cuwiki">CheckUser wiki</cdx-checkbox>
        </template>
      </cdx-table>
      <ul>
        <li v-for="linkItem in linkItems" :key="linkItem.label">
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
        const row = this.modelValue[index];
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
    // Taken from https://github.com/wikimedia/design-codex/blob/main/packages/codex/src/components/table/Table.vue
    /**
     * Handle "select all" changes.
     *
     * @param newValue Whether the "select all" box is checked.
     */
    handleSelectAll(newValue: boolean) {
      if (newValue) {
        this.selectedRows = this.modelValue.map((_row, index) => index);
      }
      else {
        this.selectedRows = [];
      }
    },
    handleUserSelected(data: AllUser, row: SockRow) {
      this.$emit('userSelected', data, this.modelValue.findIndex((item: LinkRow) => item.username === row.username));
    },
    handleUsernameChange(username: string, row: SockRow) {
      this.$emit('usernameChanged', username, this.modelValue.findIndex((item: LinkRow) => item.username === row.username));
    },
    addDefaultRow() {
      this.$emit('addRow');
    },
    removeRows() {
      this.$emit('removeRows', this.selectedRows);
      this.selectedRows = [];
    },
    toggleColumn(key: ColumnId, value: boolean) {
      for (const row of this.modelValue) {
        row[key] = value;
      }
    },
    toggleAllColumns(value: boolean) {
      for (const column of this.optionColumns) {
        this.toggleColumn(column.id, value);
      }
    },
    toggleRow(row: LinkRow, value: boolean) {
      for (const col of this.optionColumns) {
        row[col.id] = value;
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
      const rows = this.modelValue;
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

        const values = rows.map(r => r[column.id]);
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
      return this.modelValue.length > 0
        && this.optionColumns.every(k => this.columnState[k.id].checked);
    },
    allColumnsIndeterminate(): boolean {
      const checkedCount = this.optionColumns.filter(
        k => this.columnState[k.id].checked,
      ).length;

      return checkedCount > 0 && checkedCount < this.optionColumns.length;
    },
    linkItems(): Partial<LinkRecord> {
      // We could ask them if they want to use spitools or sandals in the settings
      const result: Partial<LinkRecord> = {};
      for (const linkColumn of this.optionColumns) {
        const linkFormat = this.getLinkFormat(linkColumn.id);
        if (linkFormat === null) {
          console.error('Couldn\'t find link format for', linkColumn.id);
          continue;
        }

        const resultUrl = new URL(linkFormat.baseUrl.href);
        const includedUsers: string[] = this.modelValue.reduce((accumulator: string[], row) => {
          if (row[linkColumn.id]) {
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
      return this.modelValue.length > 0 && this.selectedRows.length === this.modelValue.length;
    },
    selectAllIndeterminate(): boolean {
      if (this.selectedRows.length === this.modelValue.length) {
        return false;
      }
      else return this.selectedRows.length !== 0;
    },
  },
});
