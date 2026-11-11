import { type PropType, defineComponent } from 'vue';
import type { PrimaryModalAction } from '@wikimedia/codex';
import { buildCaseReportWikitext } from '../../actions';
import type { CaseAction, CaseReport, CaseStatus, CaseStatusChoice, UserRow } from '../../types';
import { spiHelperNormalizeUsername } from '../../utils.ts';
import { spiHelperIsAdmin, spiHelperIsClerk } from '../../role.ts';

/** What the filing view edits, kept apart from the report until saved so cancelling is free */
export interface ReportDraft {
  socks: string[];
  evidence: string;
  status: CaseStatusChoice;
  commentEnabled: boolean;
  comment: string;
}

/**
 * The accounts a new report lists by default: the ones being blocked, minus the master,
 * since the case is already named after them, and minus any an earlier report already
 * lists.
 */
export function getDefaultReportSocks(opts: {
  accounts: UserRow[]; master: string; reported: ReadonlySet<string>;
}): string[] {
  const { accounts, master, reported } = opts;
  return accounts
    .filter(row => row.block.block && row.username !== master && !reported.has(row.username))
    .map(row => row.username);
}

/**
 * Start a draft from the view's report: what was saved before, or the defaults if there
 * isn't one yet
 */
export function draftFromReport(opts: {
  report: CaseAction<CaseReport>;
  accounts: UserRow[];
  master: string;
  reported: ReadonlySet<string>;
}): ReportDraft {
  const { report, accounts, master, reported } = opts;
  if (!report.enabled) {
    return {
      socks: getDefaultReportSocks({ accounts, master, reported }),
      evidence: '',
      status: 'nochange',
      commentEnabled: false,
      comment: '* ',
    };
  }
  const { socks, evidence, status, adminComment } = report.data;
  return {
    socks: [...socks],
    evidence,
    status: adminComment === undefined ? status ?? 'nochange' : 'nochange',
    commentEnabled: adminComment !== undefined,
    comment: adminComment ?? '* ',
  };
}

/**
 * A kept draft's accounts on reopening: as it was left, plus any added to the table since
 * that a fresh draft would have ticked, such as ones imported while the dialog was closed
 */
export function resumeReportSocks(opts: {
  draft: ReportDraft;
  accounts: UserRow[];
  master: string;
  reported: ReadonlySet<string>;
  accountsAtClose: ReadonlySet<string>;
}): string[] {
  const { draft, accounts, master, reported, accountsAtClose } = opts;
  const newDefaults = getDefaultReportSocks({ accounts, master, reported })
    .filter(username => !accountsAtClose.has(username));
  return [...new Set([...draft.socks, ...newDefaults])];
}

/**
 * The report a draft describes. Switching the clerk comment on closes the report, whatever
 * status was chosen, and whether or not anything was written; otherwise a status left at
 * "no change" is left to the template (defaults to new)
 */
export function reportFromDraft(draft: ReportDraft): CaseReport {
  const report: CaseReport = { socks: [...draft.socks], evidence: draft.evidence };
  if (draft.commentEnabled) {
    report.status = 'closed';
    report.adminComment = draft.comment;
    return report;
  }
  const status = toReportStatus(draft.status);
  if (status !== undefined) {
    report.status = status;
  }
  return report;
}

/** The status the template is given for a dropdown choice, if any */
function toReportStatus(choice: CaseStatusChoice): CaseStatus | undefined {
  switch (choice) {
    case 'nochange':
      return undefined;
    // There's nothing to reopen on a new report
    case 'reopen':
      return 'open';
    case 'selfendorse':
      return 'endorse';
    default:
      return choice;
  }
}

/** Grow an autosized Codex text area to fit text it was given without any typing */
function fitTextArea(component: unknown) {
  const textarea = (component as { textarea?: unknown } | undefined)?.textarea;
  if (textarea instanceof HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}

interface Data {
  draft: ReportDraft;
  // The table's accounts when the dialog was last closed, so a kept draft can tick the
  // ones added since, as a fresh draft would
  accountsAtClose: Set<string>;
  newSock: string;
  // Whether the next opening picks up the draft where it was left, rather than starting
  // again from what's saved
  keepDraft: boolean;
  canComment: boolean;
}

export const FilingViewComponent = defineComponent({
  props: {
    open: { type: Boolean, required: true },
    report: { type: Object as PropType<CaseAction<CaseReport>>, required: true },
    accounts: { type: Array as PropType<UserRow[]>, required: true },
    // The case's master, normalised. The report is filed on their case
    master: { type: String, required: true },
    // Accounts an earlier report on the case already lists
    reported: { type: Set as PropType<ReadonlySet<string>>, default: () => new Set<string>() },
  },
  emits: ['update:open', 'save', 'add-account'],
  data(): Data {
    return {
      draft: draftFromReport({
        report: this.report, accounts: this.accounts, master: this.master, reported: this.reported,
      }),
      accountsAtClose: new Set(),
      newSock: '',
      keepDraft: false,
      canComment: spiHelperIsClerk() || spiHelperIsAdmin(),
    };
  },
  computed: {
    // The table is the one list of accounts, so importing into it or adding here both land
    // in the same place. Plus any the draft lists that have since left the table
    candidateSocks(): string[] {
      const usernames = this.accounts
        .map(row => row.username)
        .filter(username => username !== '' && username !== this.master);
      return [...new Set([...usernames, ...this.draft.socks])];
    },
    reportError(): string | null {
      try {
        buildCaseReportWikitext(reportFromDraft(this.draft));
        return null;
      }
      catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    },
    // The report as it will be filed, or null while it's invalid, which leaves the last
    // good preview up beside the error
    previewSource(): string | null {
      return this.reportError === null
        ? buildCaseReportWikitext(reportFromDraft(this.draft))
        : null;
    },
    caseTitle(): string {
      return `Wikipedia:Sockpuppet investigations/${this.master}`;
    },
    primaryAction(): PrimaryModalAction {
      return {
        label: this.report.enabled ? 'Update report' : 'Add report',
        actionType: 'progressive',
        disabled: this.reportError !== null,
      };
    },
  },
  watch: {
    // Saving, discarding or filing replaces the report, after which the draft is stale
    report() {
      this.keepDraft = false;
    },
    open(isOpen: boolean) {
      // An opening after Cancel or a save starts from what's saved, so a cancelled edit
      // doesn't linger. One after closing the dialog any other way, such as a stray click
      // outside it, carries on with the draft, so typed evidence isn't lost
      if (isOpen && !this.keepDraft) {
        this.draft = draftFromReport({
          report: this.report,
          accounts: this.accounts,
          master: this.master,
          reported: this.reported,
        });
        this.newSock = '';
      }
      else if (isOpen) {
        this.draft.socks = resumeReportSocks({
          draft: this.draft,
          accounts: this.accounts,
          master: this.master,
          reported: this.reported,
          accountsAtClose: this.accountsAtClose,
        });
      }
      if (isOpen) {
        // Codex fits an autosized text area to its text only on input, so a reopened
        // report's evidence would otherwise be cut off at the default height
        void this.$nextTick(() => {
          fitTextArea(this.$refs.evidence);
        });
      }
    },
  },
  methods: {
    onAddSock() {
      const username = spiHelperNormalizeUsername(this.newSock);
      if (username === '' || username === this.master) {
        return;
      }
      if (!this.accounts.some(row => row.username === username)) {
        this.$emit('add-account', username);
      }
      if (!this.draft.socks.includes(username)) {
        this.draft.socks.push(username);
      }
      this.newSock = '';
    },
    onSave() {
      if (this.reportError !== null) {
        return;
      }
      this.keepDraft = false;
      this.$emit('save', reportFromDraft(this.draft));
      this.$emit('update:open', false);
    },
    onCancel() {
      this.keepDraft = false;
      this.$emit('update:open', false);
    },
    // The close button, Escape or a click outside: closing without saying to throw it away
    onDialogToggle(isOpen: boolean) {
      if (!isOpen) {
        this.keepDraft = true;
        this.accountsAtClose = new Set(this.accounts.map(row => row.username));
      }
      this.$emit('update:open', isOpen);
    },
  },
  template: `
    <cdx-dialog :open="open" @update:open="onDialogToggle"
                :title="report.enabled ? 'Edit new report' : 'File new report'"
                :use-close-button="true"
                :primary-action="primaryAction" :default-action="{ label: 'Cancel' }"
                @primary="onSave" @default="onCancel">
      <cdx-field :is-fieldset="true">
        <template #label>Accounts</template>
        <template #description>Listed under suspected sockpuppets</template>
        <cdx-checkbox v-for="sock in candidateSocks" :key="sock" v-model="draft.socks" :input-value="sock">
          {{ sock }}
        </cdx-checkbox>
        <div class="spiHelper-filingView-addSock">
          <user-lookup v-model="newSock" @keydown.enter.prevent="onAddSock" />
          <cdx-button :disabled="newSock.trim() === ''" @click="onAddSock">Add</cdx-button>
        </div>
      </cdx-field>
      <cdx-field>
        <template #label>Evidence</template>
        <cdx-text-area ref="evidence" v-model="draft.evidence" :autosize="true" placeholder="Evidence" />
      </cdx-field>
      <!-- Fieldsets, so the labels match the fields above without handing one input ID to
           every control inside -->
      <cdx-field :is-fieldset="true">
        <template #label>Status</template>
        <!-- A clerk comment closes the report, so the status shows that and can't be
             changed. The choice underneath is kept, for if the comment is switched off -->
        <change-status-action :enabled="true" :toggleable="false" old-status="new"
                              :new-status="draft.commentEnabled ? 'closed' : draft.status"
                              :disabled="draft.commentEnabled" @update:new-status="draft.status = $event" />
      </cdx-field>
      <cdx-field v-if="canComment" :is-fieldset="true">
        <template #label>Clerk comment</template>
        <comment-action v-model:enabled="draft.commentEnabled" :show-preview="false"
                        v-model:text="draft.comment" :selected-section="null" />
      </cdx-field>
      <cdx-message v-if="reportError" type="error" :inline="true">{{ reportError }}</cdx-message>
      <cdx-field :is-fieldset="true">
        <template #label>Preview</template>
        <preview-box :source="previewSource" :title="caseTitle" :active="open" />
      </cdx-field>
    </cdx-dialog>
  `,
});
