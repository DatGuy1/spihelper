import { defineComponent } from 'vue';
import { type CdxTextArea, type MenuItemData } from '@wikimedia/codex';
import { spiHelperRenderText } from '../../../../api.ts';
import { context } from '../../../../context.ts';
import { cdxIconReload } from '@wikimedia/codex-icons';
import { spiHelperIsAdmin, spiHelperIsCheckuser, spiHelperIsClerk } from '../../../../role.ts';
import { spiHelperCUTemplates, spiHelperClerkTemplates } from '../../../../constants/spi.ts';
import { addSignature } from '../../../../utils.ts';

export const CommentActionComponent = defineComponent({
  props: {
    enabled: { type: Boolean, required: true },
    text: { type: String, required: true },
  },
  data() {
    const noteTemplates: MenuItemData[] = [
      { value: 'takenote', label: 'Note' },
    ];
    const clerkTemplates = [...spiHelperClerkTemplates];
    const cuTemplates = [...spiHelperCUTemplates];
    // Unshift instead of push to maintain muscle memory with previous spihelper
    if (spiHelperIsCheckuser()) {
      noteTemplates.unshift({ value: 'cunote', label: 'CheckUser note' });
    }
    if (spiHelperIsAdmin()) {
      noteTemplates.unshift({ value: 'adminnote', label: 'Administrator note' });
    }
    if (spiHelperIsClerk()) {
      noteTemplates.unshift({ value: 'clerknote', label: 'Clerk note' });
    }

    return {
      noteTemplates,
      clerkTemplates,
      cuTemplates,
      loadingPreview: false,
      htmlPreview: '',
      cdxIconReload,
    };
  },
  emits: ['update:enabled', 'update:text'],
  template: `
    <action-container v-model:enabled="enabled" @update:enabled="onEnable">
      <div>
        <cdx-select :menu-items="noteTemplates" default-label="Comment templates" @update:selected="insertNote" />
        <cdx-select :menu-items="clerkTemplates" default-label="Admin/clerk templates" @update:selected="insertText" />
        <cdx-select :menu-items="cuTemplates" default-label="CheckUser templates" @update:selected="insertText" />
      </div>
      <cdx-text-area ref="commentBox" :autosize="true" placeholder="Write your comment" :model-value="text"
                     @update:model-value="onTextUpdate" />
      <div id="spiHelper-PreviewBox" class="cdx-card" style="min-height:26px">
        <cdx-button aria-label="Load preview" @click="updatePreview" weight="primary" action="progressive"
                    :disabled="loadingPreview">
          <cdx-progress-indicator v-if="loadingPreview">Loading preview</cdx-progress-indicator>
          <cdx-icon v-else :icon="cdxIconReload" />
        </cdx-button>
        <div v-html="htmlPreview" id="htmlPreview" />
      </div>
    </action-container>
  `,
  computed: {
    commentBox(): InstanceType<typeof CdxTextArea> {
      return this.$refs.commentBox as InstanceType<typeof CdxTextArea>;
    },
  },
  methods: {
    onEnable(newEnabled: boolean) {
      this.$emit('update:enabled', newEnabled);
      if (newEnabled) {
        void this.$nextTick(() => {
          this.commentBox.focus();
        });
      }
    },
    onTextUpdate(newValue: string) {
      this.$emit('update:text', newValue);
    },
    async updatePreview() {
      this.loadingPreview = true;
      this.htmlPreview = await spiHelperRenderText(context.pageName, addSignature(this.text));
      this.loadingPreview = false;
    },
    /**
     * Inserts a {{note}} template at the start of the text box
     */
    insertNote(noteValue: string) {
      // Match the start of the line, optionally including a '*' with or without whitespace
      // around it, optionally including a template which contains the string "note"
      const newText = this.text.replace(/^(\s*\*\s*)?({{[\w\s]*note[\w\s]*}}\s*)?/i, '* {{' + noteValue + '}} ');
      this.$emit('update:text', newText);

      // Force the selected element to reset its selection to 0
      this.commentBox.focus();
    },
    /**
     * Inserts text at the cursor's position
     */
    insertText(templateValue: string) {
      // https://stackoverflow.com/questions/11076975/how-to-insert-text-into-the-textarea-at-the-current-cursor-position
      const textareaElement = (this.commentBox.$el as HTMLElement).querySelector('textarea');
      if (!textareaElement) {
        console.error('commentAction: Unable to find textarea');
        return;
      }
      const selectionStart = textareaElement.selectionStart;
      const selectionEnd = textareaElement.selectionEnd;
      let newText = this.text;
      if (selectionStart || selectionStart === 0) {
        newText = newText.slice(0, selectionStart)
          + templateValue
          + newText.slice(selectionEnd, newText.length);
        textareaElement.selectionStart = selectionStart + templateValue.length;
        textareaElement.selectionEnd = selectionEnd + templateValue.length;
      }
      else {
        newText += templateValue;
      }
      this.$emit('update:text', newText);

      this.commentBox.focus();
    },
  },
});
