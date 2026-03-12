import { type PropType, defineComponent } from 'vue';
import {
  type AltmasterTagStatus, SockmasterTag,
  type SockmasterTagStatus,
  SockpuppetTag,
  type SockpuppetTagStatus,
  type Tag,
} from '../../types/spi.ts';
import {
  cdxIconAdd,
  cdxIconCopy,
  cdxIconPaste,
  cdxIconTrash,
  cdxIconUserAvatar,
  cdxIconUserAvatarOutline,
} from '@wikimedia/codex-icons';
import { isSockpuppetTag } from '../../utils.ts';

export const TagPopoverComponent = defineComponent({
  props: {
    tag: { type: Object as PropType<Tag | null>, required: true },
    open: { type: Boolean, required: true },
    anchor: { type: Object as PropType<HTMLElement>, required: true },
    clipboardTag: { type: Object as PropType<Tag | null>, required: true },
    defaultMaster: { type: String, required: true },
  },
  emits: {
    'update:open': (_: boolean) => true,
    'update:tag': (_: Tag) => true,
    'addTag': () => true,
    'copyTag': (_: Tag) => true,
    'deleteTag': () => true,
  },
  data() {
    const sockTags: { value: SockpuppetTagStatus; label: string }[] = [
      { value: 'blocked', label: 'Suspected' },
      { value: 'proven', label: 'Proven' },
      { value: 'confirmed', label: 'Confirmed' },
    ];
    const masterTags: { value: SockmasterTagStatus; label: string }[] = [
      { value: 'blocked', label: 'Blocked' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'banned', label: '3X Banned' },
    ];
    const altmasterTags: { value: AltmasterTagStatus; label: string }[] = [
      { value: 'suspected', label: 'Suspected' },
      { value: 'proven', label: 'Proven' },
    ];

    const allTagSelections = {
      tag: 'none',
      altmaster: 'none',
    };
    const tagCategoryButtons = [
      { value: 'sock', label: 'Sockpuppet', icon: cdxIconUserAvatarOutline },
      { value: 'master', label: 'Sockmaster', icon: cdxIconUserAvatar },
    ];

    const temporaryTag = null as Tag | null;

    const icons = {
      cdxIconAdd,
      cdxIconCopy,
      cdxIconPaste,
      cdxIconTrash,
    };

    return {
      sockTags,
      masterTags,
      altmasterTags,
      allTagSelections,
      tagCategoryButtons,
      temporaryTag,
      icons,
    };
  },
  computed: {
    openValue: {
      get() {
        return this.open;
      },
      set(newValue: boolean) {
        this.$emit('update:open', newValue);
      },
    },
    tagCategory: {
      get(): 'sock' | 'master' | null {
        if (this.temporaryTag === null) {
          return null;
        }
        return isSockpuppetTag(this.temporaryTag) ? 'sock' : 'master';
      },
      set(newValue: 'sock' | 'master') {
        if (newValue === 'sock') {
          this.temporaryTag = new SockpuppetTag({
            status: 'blocked',
            master: this.defaultMaster,
            evidence: this.temporaryTag?.evidence,
          });
        }
        else {
          this.temporaryTag = new SockmasterTag({
            status: 'blocked',
            evidence: this.temporaryTag?.evidence,
          });
        }
      },
    },
  },
  watch: {
    tag(newTag: Tag | null) {
      if (newTag) {
        this.temporaryTag = newTag.clone();
      }
    },
    open(newValue: boolean) {
      // Reset the form when it's closed
      if (!newValue) {
        this.temporaryTag = null;
      }
    },
  },
  methods: {
    handleSave() {
      if (this.temporaryTag === null) {
        console.error('No tag to save');
        return;
      }
      this.$emit('update:tag', this.temporaryTag);
      this.openValue = false;
    },
    handleCancel() {
      this.openValue = false;
    },
    handleDeleteTag() {
      this.$emit('deleteTag');
      this.openValue = false;
    },
    handleCopyTag() {
      if (!this.temporaryTag) {
        return;
      }
      this.$emit('copyTag', this.temporaryTag);
    },
    handlePasteTag() {
      if (!this.clipboardTag) {
        return;
      }
      this.temporaryTag = this.clipboardTag.clone();
    },
    handleAddTag() {
      this.$emit('addTag');
      this.openValue = false;
    },
  },
  template: `
    <cdx-popover :anchor="anchor" v-model:open="openValue"
                 title="Edit Tag" class="edit-tag-popover">
      <cdx-toggle-button-group :buttons="tagCategoryButtons" v-model="tagCategory" class="tag-category" />
      <div v-if="tagCategory === 'sock'" class="edit-body">
        <cdx-toggle-button-group :buttons="sockTags" v-model="temporaryTag.status" />
        <user-lookup label="Master" v-model="temporaryTag.master" :allow-empty="false" />
        <user-lookup label="Alternate Master" v-model="temporaryTag.altmaster" />
        <cdx-toggle-button-group v-show="temporaryTag.altmaster" :buttons="altmasterTags"
                                 v-model="temporaryTag.altmasterStatus" />
        <cdx-accordion separation="minimal">
          <template #title>
            Extras
          </template>
          <cdx-field>
            <template #label>Evidence</template>
            <cdx-text-input v-model="temporaryTag.evidence" />
          </cdx-field>
        </cdx-accordion>
      </div>
      <div v-else-if="tagCategory === 'master'" class="edit-body">
        <cdx-toggle-button-group :buttons="masterTags" v-model="temporaryTag.status" />
        <cdx-accordion separation="minimal">
          <template #title>
            Extras
          </template>
          <cdx-field>
            <template #label>Evidence</template>
            <cdx-text-input v-model="temporaryTag.evidence" />
          </cdx-field>
          <page-lookup v-model="temporaryTag.spipage" :namespace="4" prefix="Sockpuppet investigations/"
                       label="SPI Page" />
          <page-lookup v-model="temporaryTag.ltapage" :namespace="4" prefix="Long-term abuse/" label="LTA Page" />
        </cdx-accordion>
      </div>
      <template #footer>
        <div class="footer-sideactions">
            <cdx-button action="destructive" @click="handleDeleteTag" aria-label="Delete tag" title="Delete tag">
              <cdx-icon :icon="icons.cdxIconTrash" />
            </cdx-button>
            <cdx-button @click="handleAddTag" aria-label="Add tag" title="Add tag">
              <cdx-icon :icon="icons.cdxIconAdd" />
            </cdx-button>
            <cdx-button @click="handleCopyTag" aria-label="Copy tag" title="Copy tag">
              <cdx-icon :icon="icons.cdxIconCopy" />
            </cdx-button>
            <cdx-button @click="handlePasteTag" aria-label="Paste tag" title="Paste tag">
              <cdx-icon :icon="icons.cdxIconPaste" />
            </cdx-button>
        </div>
        <div class="cdx-popover__footer__actions">
          <cdx-button
              class="cdx-popover__footer__primary-action"
              weight="primary"
              action="progressive"
              @click="handleSave"
          >
            Save
          </cdx-button>
          <cdx-button
              class="cdx-popover__footer__default-action"
              @click="handleCancel"
          >
            Cancel
          </cdx-button>
        </div>
      </template>
    </cdx-popover>
  `,
});
