import { defineComponent } from 'vue';
import { cdxIconReload } from '@wikimedia/codex-icons';
import { spiHelperRenderText } from '../../api.ts';

/** How long typing has to pause before the preview renders */
export const PREVIEW_DEBOUNCE_MS = 1000;

interface Data {
  html: string;
  loading: boolean;
  failed: boolean;
  // The source the shown preview was rendered from, so unchanged text isn't sent again
  renderedSource: string | null;
  timer: ReturnType<typeof setTimeout> | null;
  // The request in flight, cancelled when a newer one replaces it
  controller: AbortController | null;
  cdxIconReload: typeof cdxIconReload;
}

/**
 * A rendered preview of some wikitext that keeps itself up to date
 */
export const PreviewBoxComponent = defineComponent({
  props: {
    source: { type: [String, null], required: true },
    // The page the text is rendered as if on
    title: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  data(): Data {
    return {
      html: '',
      loading: false,
      failed: false,
      renderedSource: null,
      timer: null,
      controller: null,
      cdxIconReload,
    };
  },
  watch: {
    source() {
      this.schedule(PREVIEW_DEBOUNCE_MS);
    },
    active(isActive: boolean) {
      if (isActive) {
        this.schedule(0);
      }
      else {
        this.cancel();
      }
    },
  },
  mounted() {
    // Opening something with text in it shows its preview straight away
    this.schedule(0);
  },
  beforeUnmount() {
    this.cancel();
  },
  methods: {
    /** Stop any pending or in-flight render; its source is out of date */
    cancel() {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.controller?.abort();
      this.controller = null;
      this.loading = false;
    },
    schedule(delay: number) {
      this.cancel();
      if (!this.active || this.source === null || this.source === this.renderedSource) {
        return;
      }
      this.timer = setTimeout(() => {
        this.timer = null;
        void this.render();
      }, delay);
    },
    async render() {
      const source = this.source;
      if (source === null) {
        return;
      }
      this.cancel();
      const controller = new AbortController();
      this.controller = controller;
      this.loading = true;
      const html = await spiHelperRenderText(this.title, source, controller.signal);
      if (controller.signal.aborted) {
        return;
      }
      this.controller = null;
      this.loading = false;
      // A failure leaves the last good preview up rather than blanking it
      this.failed = html === '';
      if (html !== '') {
        this.html = html;
        this.renderedSource = source;
      }
    },
  },
  template: `
    <div class="cdx-card spiHelper-PreviewBox">
      <template v-if="html">
        <cdx-button class="spiHelper-preview-reload" aria-label="Reload preview" @click="render"
                    :disabled="loading || source === null">
          <cdx-progress-indicator v-if="loading">Loading preview</cdx-progress-indicator>
          <cdx-icon v-else :icon="cdxIconReload" />
        </cdx-button>
        <div v-html="html" class="spiHelper-htmlPreview" />
      </template>
      <p v-else class="spiHelper-previewBox-empty">
        <template v-if="loading || timer !== null">Loading preview...</template>
        <template v-else-if="failed">
          The preview failed to load.
          <cdx-button weight="quiet" size="small" @click="render">Retry</cdx-button>
        </template>
        <template v-else>Nothing to preview yet</template>
      </p>
    </div>
  `,
});
