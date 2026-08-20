import { type PropType, defineComponent } from 'vue';
import {
  cdxIconAdd,
  cdxIconArrowDown,
  cdxIconClock,
  cdxIconClose,
  cdxIconCode,
  cdxIconFeedback,
  cdxIconJournal,
  cdxIconLayout,
  cdxIconPalette,
  cdxIconReload, cdxIconTrash,
  cdxIconWatchlist,
} from '@wikimedia/codex-icons';
import { saveOptions, spiHelperSettings } from '../../../options';
import { MODE, VERSION, spiHelperDefaultSettings } from '../../../constants';
import { getFullLogPage } from '../../../options/utils.ts';
import type { ScriptSettings } from '../../../options/types.ts';
import type { ChipInputItem, MenuItemData, MenuItemValue, useToast } from '@wikimedia/codex';
import { CASE_ACTION_NAMES, type CaseActionName, type FeedbackDialog } from '../../../types';
import { isMenuGroupData } from '../../utils.ts';
import { toRaw } from '../../runtime.ts';
import { setGlobalSettings } from '../../../options/options.ts';

type UseToastReturn = ReturnType<typeof useToast>;

interface Data {
  open: boolean;
  openHandler: ((e: Event) => void) | null;
  showExtra: boolean;
  showExtraMessage: boolean;
  showExtraHandler: ((e: KeyboardEvent) => void) | null;
  logPrefix: string;
  caseActionMenuItems: MenuItemData[];
  selectedChipItems: MenuItemValue[];
  icons: {
    cdxIconAdd: typeof cdxIconAdd;
    cdxIconArrowDown: typeof cdxIconArrowDown;
    cdxIconClock: typeof cdxIconClock;
    cdxIconClose: typeof cdxIconClose;
    cdxIconCode: typeof cdxIconCode;
    cdxIconFeedback: typeof cdxIconFeedback;
    cdxIconJournal: typeof cdxIconJournal;
    cdxIconLayout: typeof cdxIconLayout;
    cdxIconPalette: typeof cdxIconPalette;
    cdxIconReload: typeof cdxIconReload;
    cdxIconTrash: typeof cdxIconTrash;
    cdxIconWatchlist: typeof cdxIconWatchlist;
  };
  instanceSettings: ScriptSettings;
  oldSettings: ScriptSettings;
  resetTrigger: number;
}

export const OptionsComponent = defineComponent({
  props: {
    feedbackDialog: { type: Object as PropType<FeedbackDialog>, required: true },
    openButton: { type: Object as PropType<HTMLElement>, required: true },
    toaster: { type: Object as PropType<UseToastReturn>, required: true },
  },
  data: function (): Data {
    const username = mw.config.get('wgUserName') ?? '';
    const logPrefix = `User:${username}/`;

    // Build menu items from case action names, excluding 'sections'
    const caseActionMenuItems: MenuItemData[] = CASE_ACTION_NAMES.reduce<MenuItemData[]>(
      (acc, actionName) => {
        if (actionName !== 'sections') {
          acc.push({
            value: actionName,
            label: actionName.charAt(0).toUpperCase() + actionName.slice(1),
          });
        }
        return acc;
      },
      [],
    );

    return {
      open: false,
      openHandler: null,
      showExtra: spiHelperSettings.debug.enabled,
      showExtraMessage: false,
      showExtraHandler: null,
      logPrefix,
      caseActionMenuItems,
      selectedChipItems: spiHelperSettings.defaultActions,
      icons: {
        cdxIconAdd,
        cdxIconArrowDown,
        cdxIconClock,
        cdxIconClose,
        cdxIconCode,
        cdxIconFeedback,
        cdxIconJournal,
        cdxIconLayout,
        cdxIconPalette,
        cdxIconReload,
        cdxIconTrash,
        cdxIconWatchlist,
      },
      instanceSettings: structuredClone(spiHelperSettings),
      oldSettings: structuredClone(spiHelperSettings),
      resetTrigger: 0,
    };
  },
  computed: {
    logPage(): string {
      return `${mw.config.get('wgServer')}/wiki/${getFullLogPage(spiHelperSettings.log.page)}`;
    },
    isCheckUser(): boolean {
      const { debug } = this.instanceSettings;
      const isCU = mw.config.get('wgUserGroups')?.includes('checkuser') ?? false;

      return isCU || (debug.enabled && debug.forceCheckuser);
    },
    inputChipItems: {
      get(): ChipInputItem[] {
        return this.instanceSettings.defaultActions.map(actionName => ({
          value: actionName,
          label: actionName.charAt(0).toUpperCase() + actionName.slice(1),
        }));
      },
      set(value: ChipInputItem[]) {
        this.instanceSettings.defaultActions = value.map(item => item.value as CaseActionName);
      },
    },
  },
  watch: {
    open(newVal: boolean) {
      if (newVal) {
        if (!this.showExtra && this.showExtraHandler) {
          window.addEventListener('keydown', this.showExtraHandler);
        }
      }
      else {
        const currentSettingsJson = JSON.stringify(this.instanceSettings);
        const settingsDiffer = JSON.stringify(this.oldSettings) !== currentSettingsJson;
        if (settingsDiffer) {
          setGlobalSettings(toRaw(this.instanceSettings));
          const savingId = this.toaster.info('Saving settings...', { autoDismiss: false });
          saveOptions()
            .then((_) => {
              this.toaster.success('Settings saved! Reload to apply them', { autoDismiss: true });
            })
            .catch((error: unknown) => {
              const message = error instanceof Error ? error.message : String(error);
              this.toaster.error(`Failed to save settings: ${message}`, { autoDismiss: true });
            })
            .always(() => {
              this.oldSettings = JSON.parse(currentSettingsJson) as ScriptSettings;
              setTimeout(() => {
                this.toaster.dismiss(savingId);
              }, 3000);
            });
        }
        if (this.showExtraHandler) {
          window.removeEventListener('keydown', this.showExtraHandler);
        }
      }
    },
  },
  mounted() {
    this.openHandler = () => {
      this.open = true;
      mw.track('stats.mediawiki_gadget_spihelper_total', 1, { action: 'options' });
    };
    this.openButton.addEventListener('click', this.openHandler);

    //! Use the Konami code to unlock debug menu
    const konami = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
    ];
    let i = 0;

    this.showExtraHandler = (e: KeyboardEvent) => {
      if (e.key === konami[i]) {
        i++;
        if (i === konami.length) {
          this.showExtra = true;
          this.showExtraMessage = true;
          if (this.showExtraHandler) {
            window.removeEventListener('keydown', this.showExtraHandler);
          }
          i = 0;
        }
      }
      else {
        i = 0;
      }
    };
  },
  beforeUnmount() {
    if (this.openHandler) {
      this.openButton.removeEventListener('click', this.openHandler);
    }
  },
  methods: {
    isMenuGroupData,
    loadDefaults() {
      // Create a deep copy and replace the reactive reference
      this.instanceSettings
        = JSON.parse(JSON.stringify(spiHelperDefaultSettings)) as ScriptSettings;
      // Also update the global
      Object.assign(spiHelperSettings, spiHelperDefaultSettings);
      this.resetTrigger++;
    },
    launchFeedback() {
      this.open = false;
      this.feedbackDialog.launch({
        subject: `Feedback from ${mw.config.get('wgUserName')}`,
        message: `Options form v${VERSION}-${MODE}`,
      });
    },
    removeTemplateEntry(index: number) {
      this.instanceSettings.custom.commentTemplates.splice(index, 1);
    },
    addTemplateEntry(type: 'item' | 'group') {
      if (type === 'item') {
        this.instanceSettings.custom.commentTemplates.push({ label: '', value: '' });
      }
      else {
        this.instanceSettings.custom.commentTemplates.push({ label: '', items: [] });
      }
    },
    moveDown<T>(arr: T[], index: number) {
      if (index < 0 || index >= arr.length - 1) return arr; // nothing to move
      const temp = arr[index + 1] as T;
      arr[index + 1] = arr[index] as T;
      arr[index] = temp;
    },
  },
  template: `
    <cdx-dialog v-model:open="open" title="spiHelper Options" id="spiHelper-opts-dialog" close-button-label="Close">
      <template #header>
        <div class="cdx-dialog__header__title-group">
          <h2 class="cdx-dialog__header__title">
            spiHelper Options
          </h2>
        </div>
        <div>
          <cdx-button weight="quiet" type="button" aria-label="Give feedback" @click="launchFeedback">
            <cdx-icon :icon="icons.cdxIconFeedback" />
          </cdx-button>
          <cdx-button
              class="cdx-dialog__header__close-button"
              weight="quiet"
              type="button"
              aria-label="Close"
              @click="open = false"
          >
            <cdx-icon :icon="icons.cdxIconClose" />
          </cdx-button>
        </div>
      </template>
      <p>Configure your spiHelper options</p>
      <cdx-message v-if="showExtraMessage" type="success" :fade-in="true" :auto-dismiss="true" :display-time="3000">
        Debug menu enabled
      </cdx-message>
      <cdx-accordion :action-icon="icons.cdxIconWatchlist" :action-always-visible="true">
        <template #title>Watch</template>
        <watch-setting label="Cases" v-model="instanceSettings.watch.case" :reset-trigger="resetTrigger" />
        <watch-setting label="Archives" v-model="instanceSettings.watch.archive" :reset-trigger="resetTrigger" />
        <watch-setting label="Tagged Users" v-model="instanceSettings.watch.tagged" :reset-trigger="resetTrigger" />
        <watch-setting label="Categories" v-model="instanceSettings.watch.categories" :reset-trigger="resetTrigger" />
        <cdx-field>
          <template #label>Blocked Users</template>
          <cdx-toggle-switch v-model="instanceSettings.watch.blocked" />
          <template #help-text>Due to API limitations, only a toggle is available</template>
        </cdx-field>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconClock" :action-always-visible="true">
        <template #title>Expiry</template>
        <p>
          Expiry values may be relative (e.g. 5 months or 2 weeks) or absolute (e.g. 2014-09-18T12:34:56Z). For no
          expiry, use infinite, indefinite, infinity or never.
        </p>
        <expiry-setting label="Cases" v-model="instanceSettings.expiry.case" :reset-trigger="resetTrigger" />
        <expiry-setting label="Archives" v-model="instanceSettings.expiry.archive" :reset-trigger="resetTrigger" />
        <expiry-setting label="Tagged Users" v-model="instanceSettings.expiry.tagged" :reset-trigger="resetTrigger" />
        <expiry-setting label="Categories" v-model="instanceSettings.expiry.categories"
                        :reset-trigger="resetTrigger" />
        <expiry-setting label="Blocked Users" v-model="instanceSettings.expiry.blocked"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconJournal" :action-always-visible="true">
        <template #title>Log</template>
        <cdx-toggle-switch v-model="instanceSettings.log.enabled">
          Enabled
          <template #description>Log all actions to your userspace</template>
        </cdx-toggle-switch>
        <div v-if="instanceSettings.log.enabled">
          <log-page-setting v-model="instanceSettings.log.page" :prefix="logPrefix" />
          <br>
          <cdx-toggle-switch v-model="instanceSettings.log.reversed">
            Reverse log
            <template #description>Reverse said log, so that the newest actions are at the top</template>
          </cdx-toggle-switch>
          <p style="word-wrap: anywhere">
            Logging to [[<a :href="logPage">{{ logPrefix + instanceSettings.log.page }}</a>]]
          </p>
        </div>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconLayout" :action-always-visible="true">
        <template #title>Interface</template>
        <cdx-toggle-switch v-model="instanceSettings.interface.displayIPv6As64" :align-switch="true">
          Display IPv6 as /64
          <template #description>Default IPv6 listings to /64 in the block/tag socks menu</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.interface.fullPreview" :align-switch="true">
          Full preview
          <template #description>Include the entire section's text when previewing comments</template>
        </cdx-toggle-switch>
        <expiry-setting label="Default block duration" v-model="instanceSettings.interface.defaultBlockDuration"
                        :reset-trigger="resetTrigger" />
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconPalette" :action-always-visible="true">
        <template #title>Customisation</template>
        <div>
          <h3 style="padding-top: 0;">Comment templates</h3>
          <div class="spiHelper-template-container">
            <div v-for="(entry, i) in instanceSettings.custom.commentTemplates" :key="i" class="spiHelper-template">
              <div v-if="isMenuGroupData(entry)">
                <div class="spiHelper-template-input">
                  <cdx-text-input v-model="entry.label" placeholder="Group label" />
                  <cdx-button @click="moveDown(instanceSettings.custom.commentTemplates, i)"
                              aria-label="Move group down"
                              :disabled="instanceSettings.custom.commentTemplates.length <= i + 1">
                    <cdx-icon :icon="icons.cdxIconArrowDown" />
                  </cdx-button>
                  <cdx-button @click="entry.items.push({ label: '', value: '' })" action="progressive"
                              aria-label="Add item to group">
                    <cdx-icon :icon="icons.cdxIconAdd" />
                  </cdx-button>
                  <cdx-button @click="removeTemplateEntry(i)" action="destructive" aria-label="Delete group">
                    <cdx-icon :icon="icons.cdxIconTrash" />
                  </cdx-button>
                </div>
                <div v-for="(item, j) in entry.items" :key="j"
                     class="spiHelper-template-group-item spiHelper-template-input">
                  <cdx-text-input v-model="item.label" placeholder="Label" />
                  <page-lookup v-model="item.value" placeholder="Template (no brackets)" :namespace="10"
                               :validate-message="false" />
                  <cdx-button @click="moveDown(entry.items, j)" aria-label="Move item down"
                              :disabled="entry.items.length <= j + 1">
                    <cdx-icon :icon="icons.cdxIconArrowDown" />
                  </cdx-button>
                  <cdx-button @click="entry.items.splice(j, 1)" action="destructive" aria-label="Delete item">
                    <cdx-icon :icon="icons.cdxIconTrash" />
                  </cdx-button>
                </div>
              </div>
              <div v-else class="spiHelper-template-input">
                <cdx-text-input v-model="entry.label" placeholder="Label" />
                <page-lookup v-model="entry.value" placeholder="Template (no brackets)" :namespace="10"
                             :validate-message="false" />
                <cdx-button @click="moveDown(instanceSettings.custom.commentTemplates, i)" aria-label="Move item down"
                            :disabled="instanceSettings.custom.commentTemplates.length <= i + 1">
                  <cdx-icon :icon="icons.cdxIconArrowDown" />
                </cdx-button>
                <cdx-button @click="removeTemplateEntry(i)" action="destructive" aria-label="Delete item">
                  <cdx-icon :icon="icons.cdxIconTrash" />
                </cdx-button>
              </div>
            </div>
          </div>
        </div>

        <cdx-button @click="addTemplateEntry('item')" action="progressive">
          <cdx-icon :icon="icons.cdxIconAdd" />
          Add item
        </cdx-button>
        <cdx-button @click="addTemplateEntry('group')" action="progressive">
          <cdx-icon :icon="icons.cdxIconAdd" />
          Add group
        </cdx-button>
      </cdx-accordion>
      <cdx-accordion :action-icon="icons.cdxIconCode" :action-always-visible="true" v-if="showExtra">
        <template #title>Debug</template>
        <cdx-toggle-switch v-model="instanceSettings.debug.enabled" :align-switch="true">
          Enabled
        </cdx-toggle-switch>
        <cdx-field v-if="instanceSettings.debug.enabled">
          <template #description>These will override your roles. For example, if you are an administrator and force
            admin is unchecked, spiHelper will not consider you as an admninistrator.
          </template>
          <cdx-toggle-switch v-model="instanceSettings.debug.forceCheckuser" :align-switch="true">
            Force CheckUser state
          </cdx-toggle-switch>
          <cdx-toggle-switch v-model="instanceSettings.debug.forceAdmin" :align-switch="true">
            Force Admin state
          </cdx-toggle-switch>
        </cdx-field>
      </cdx-accordion>
      <div class="spiHelper-setting">
        <cdx-toggle-switch v-model="instanceSettings.clerk" :align-switch="true">Clerk</cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.tickArchiveWhenCaseClosed" :align-switch="true">
          Archive closed by default
          <template #description>If the case is closed, enable archival by default</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-if="isCheckUser" v-model="instanceSettings.useCheckuserblockAccount" :align-switch="true">
          Use &#123;&#123;<a href="//en.wikipedia.org/wiki/Template:Checkuserblock-account">checkuserblock-account</a>&#125;&#125;
          when CU blocking
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="instanceSettings.useLookup" :align-switch="true">
          Use lookups
          <template #description>Use the API to suggest autocompletions</template>
        </cdx-toggle-switch>
        <cdx-field>
          <cdx-multiselect-lookup
              v-model:input-chips="inputChipItems" v-model:selected="selectedChipItems"
              :menu-items="caseActionMenuItems">
            <template #no-results>
              No actions found
            </template>
          </cdx-multiselect-lookup>
          <template #label>
            Default actions
          </template>
          <template #description>
            Actions to have enabled by default when opening the form
          </template>
        </cdx-field>
        <cdx-toggle-switch v-model="instanceSettings.highlightSection" :align-switch="true">
          Highlight section
          <template #description>
            Highlight the selected SPI section to prevent editing the wrong one
          </template>
        </cdx-toggle-switch>
        <br>
        <cdx-button @click="loadDefaults">
          Load defaults
          <cdx-icon :icon="icons.cdxIconReload" />
        </cdx-button>
      </div>
    </cdx-dialog>
  `,
});
