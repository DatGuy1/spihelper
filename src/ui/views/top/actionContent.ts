import { type PropType, defineComponent } from 'vue';
import type { AllUser, CaseActionName, CaseActions, UserRow } from '../../../types';
import type { CaseState, SectionEntry } from '../../../state.ts';
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
    multiSelectMode: { type: Boolean, required: true },
    selectedSections: { type: Array as PropType<SectionEntry[]>, required: true },
  },
  emits: [
    'update:multiSelectMode',
    'update-multi-select-sections',
    'update-section-selection',
    'update-status',
    'update-section-status',
    'user-selected',
    'remove-rows',
    'add-row',
    'fetch-rows',
    'move-entire-case',
  ],
  computed: {
    caseName(): string {
      return context.caseName;
    },
    isMultiSelect(): boolean {
      return this.state.selectedSection?.type === 'multiple';
    },
  },
  methods: {
    /* Forward to parent */
    handleUpdateSectionSelection(selection: number | 'all' | null) {
      this.$emit('update-section-selection', selection);
    },
    handleUpdateStatus(newStatus: string) {
      this.$emit('update-status', newStatus);
    },
    handleUpdateSectionStatus(sectionId: number, newStatus: string) {
      this.$emit('update-section-status', sectionId, newStatus);
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
    handleMoveEntireCase() {
      this.$emit('move-entire-case');
    },
  },
  template: `
    <!-- Sections special case -->
    <section-action v-if="name === 'sections'"
                    :selected-section="caseActions.sections.data.section" :all-sections="state.sections"
                    :multi-select-mode="multiSelectMode" :selected-sections="selectedSections"
                    @update-section-selection="handleUpdateSectionSelection"
                    @update:multi-select-mode="$emit('update:multiSelectMode', $event)"
                    @update-multi-select-sections="$emit('update-multi-select-sections', $event)" />
    <!-- Other actions -->
    <multi-section-comment-action v-else-if="name === 'comment' && isMultiSelect"
                                  :sections="selectedSections" :by-section="caseActions.comment.data.bySection" />
    <comment-action v-else-if="name === 'comment'" v-model:enabled="caseActions.comment.enabled"
                    v-model:text="caseActions.comment.data.text" :selected-section="state.selectedSection" />
    <multi-section-status-action v-else-if="name === 'status' && isMultiSelect"
                                 :sections="selectedSections" :by-section="caseActions.status.data.bySection"
                                 @update-section-status="handleUpdateSectionStatus" />
    <change-status-action v-else-if="name === 'status'" v-model:enabled="caseActions.status.enabled"
                          :old-status="caseActions.status.data.old" v-model:new-status="caseActions.status.data.new"
                          @update:new-status="handleUpdateStatus" />
    <block-action v-else-if="name === 'block'" v-model:enabled="caseActions.block.enabled" fetch-type="comment"
                  v-model:block-options="caseActions.block.data.options" :accounts="accounts"
                  :default-master="caseActions.block.data.master"
                  :user-locks="caseActions.block.data.userLocks"
                  :user-global-blocks="caseActions.block.data.userGlobalBlocks"
                  :user-blocks="caseActions.block.data.userBlocks"
                  @user-selected="handleUserSelected"
                  @remove-rows="handleRemoveRows" @add-row="handleAddRow"
                  @fetch-rows="handleFetchRows" />
    <link-action v-else-if="name === 'link'" v-model:enabled="caseActions.link.enabled"
                 :accounts="accounts" :case-name="caseName"
                 @user-selected="handleUserSelected"
                 @remove-rows="handleRemoveRows" @add-row="handleAddRow" />
    <move-action v-else-if="name === 'move'" v-model:enabled="caseActions.move.enabled"
                 v-model:target="caseActions.move.data.target" v-model:suppress="caseActions.move.data.suppress"
                 v-model:addNote="caseActions.move.data.addNote"
                 :selection="state.selectedSection" :archive-enabled="caseActions.archive.enabled"
                 @move-entire-case="handleMoveEntireCase" />
    <archive-action v-else-if="name === 'archive'" v-model:enabled="caseActions.archive.enabled"
                    :selection="state.selectedSection"
                    :status-data="caseActions.status.data" />
    <management-action v-else-if="name === 'management'" v-model:enabled="caseActions.management.enabled"
                       v-model:flags="caseActions.management.data.flags" />
  `,
});
