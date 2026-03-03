import { type PropType, defineComponent } from 'vue';
import type { CaseActionName, CaseActions, UserRow } from '../../../types/spi.ts';
import type { MenuItemData } from '@wikimedia/codex';
import type { CaseState } from '../../../state.ts';
import type { AllUser } from '../../../types/api.ts';
import { context } from '../../../context.ts';

export const ActionContentComponent = defineComponent({
  props: {
    name: { type: String as PropType<CaseActionName>, required: true },
    caseActions: { type: Object as PropType<CaseActions>, required: true },
    // "As a best practice, you should avoid such mutations
    // unless the parent and child are tightly coupled by design"
    // https://vuejs.org/guide/components/props.html#one-way-data-flow
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    state: { type: Object as PropType<CaseState>, required: true },
    menuItems: { type: Array as PropType<MenuItemData[]>, required: true },
    currentStatus: { type: String, required: true },
  },
  emits: [
    'update-section-selection',
    'update-status',
    'user-selected',
    'remove-rows',
    'add-row',
    'fetch-rows',
  ],
  methods: {
    handleUpdateSectionSelection(selection: number | 'all' | null) {
      this.$emit('update-section-selection', selection);
    },
    handleUpdateStatus(newStatus: string) {
      this.$emit('update-status', newStatus);
    },
    handleUserSelected(data: AllUser, rowId: string) {
      this.$emit('user-selected', data, rowId);
    },
    handleRemoveRows(rowIds: string[]) {
      this.$emit('remove-rows', rowIds);
    },
    handleAddRow(row?: UserRow) {
      this.$emit('add-row', row);
    },
    handleFetchRows() {
      this.$emit('fetch-rows');
    },
  },
  computed: {
    caseName(): string {
      return context.caseName;
    },
  },
  template: `
    <!-- Sections special case -->
    <div v-if="name === 'sections'">
      <cdx-select :menu-items="menuItems" v-model:selected="caseActions.sections.data.section"
                  @update:selected="handleUpdateSectionSelection" />
    </div>

    <!-- Other actions -->
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" />
    <change-status-action v-else-if="name === 'status'" v-model:enabled="caseActions.status.enabled"
                          :old-status="caseActions.status.data.old" v-model:new-status="caseActions.status.data.new"
                          @update:new-status="handleUpdateStatus" />
    <block-action v-else-if="name === 'block'" v-model:enabled="caseActions.block.enabled"
                  v-model:block-options="caseActions.block.data.options" :accounts="accounts"
                  :default-master="caseActions.block.data.master"
                  :user-locks="caseActions.block.data.userLocks" :user-blocks="caseActions.block.data.userBlocks"
                  @user-selected="handleUserSelected"
                  @remove-rows="handleRemoveRows" @add-row="handleAddRow"
                  @fetch-rows="handleFetchRows" />
    <link-action v-else-if="name === 'link'" v-model:enabled="caseActions.link.enabled"
                 :accounts="accounts" :case-name="caseName"
                 @user-selected="handleUserSelected"
                 @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="caseActions.sections.data.section"
                    :status="currentStatus" />
  `,
});
