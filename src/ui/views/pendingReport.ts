import { type PropType, defineComponent } from 'vue';
import type { CaseReport } from '../../types';
import { countOf } from '../../utils.ts';

export const PendingReportComponent = defineComponent({
  props: {
    report: { type: Object as PropType<CaseReport>, required: true },
    master: { type: String, required: true },
  },
  emits: ['edit', 'discard'],
  computed: {
    onOtherPage(): boolean {
      const casePage = `Wikipedia:Sockpuppet investigations/${this.master}`;
      return mw.config.get('wgPageName').replace(/_/g, ' ') !== casePage;
    },
    summary(): string {
      const accountCount = countOf(this.report.socks.length, 'account');
      const where = this.onOtherPage ? ` on [[Wikipedia:Sockpuppet investigations/${this.master}]]` : '';
      return `A new report listing ${accountCount} will be filed${where} when you submit.`;
    },
  },
  template: `
    <cdx-message class="spiHelper-pendingReport">
      {{ summary }}
      <div class="spiHelper-pendingReport-actions">
        <cdx-button @click="$emit('edit')">Edit</cdx-button>
        <cdx-button action="destructive" @click="$emit('discard')">Discard</cdx-button>
      </div>
    </cdx-message>
  `,
});
