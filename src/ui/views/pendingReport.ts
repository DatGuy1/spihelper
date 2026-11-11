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
    casePage(): string {
      return `Wikipedia:Sockpuppet investigations/${this.master}`;
    },
    caseUrl(): string {
      return mw.util.getUrl(this.casePage);
    },
    onOtherPage(): boolean {
      return mw.config.get('wgPageName').replace(/_/g, ' ') !== this.casePage;
    },
    accountCount(): string {
      return countOf(this.report.socks.length, 'account');
    },
  },
  template: `
    <cdx-message class="spiHelper-pendingReport">
      A new report listing {{ accountCount }} will be filed<template v-if="onOtherPage"> on <a :href="caseUrl">{{ casePage }}</a></template> when you submit.
      <div class="spiHelper-pendingReport-actions">
        <cdx-button @click="$emit('edit')">Edit</cdx-button>
        <cdx-button action="destructive" @click="$emit('discard')">Discard</cdx-button>
      </div>
    </cdx-message>
  `,
});
