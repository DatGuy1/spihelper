// noinspection HtmlUnknownTag, VueUnrecognizedSlot

import type { ComponentOptions } from 'vue';
import { cdxIconWatchlist, cdxIconClock, cdxIconCode, cdxIconJournal, cdxIconReload } from '@wikimedia/codex-icons';
import { saveOptions, spiHelperSettings } from '../options.ts';
import { spiHelperDefaultSettings } from '../constants/settings.ts';

// I would like to be able to defineComponent()
// but bun bundles vue-runtime into the build
// noinspection JSUnusedGlobalSymbols
export const OptionsComponent: ComponentOptions = {
  data: function () {
    const username = mw.config.get('wgUserName') || '';
    const logPrefix = `User:${username}/`;
    return {
      open: false,
      showExtra: spiHelperSettings.debug.enabled || spiHelperSettings.iUnderstandSectionMoves,
      showExtraMessage: false,
      _showExtraHandler: null,
      logPrefix: logPrefix,
      cdxIconWatchlist: cdxIconWatchlist,
      cdxIconClock: cdxIconClock,
      cdxIconCode: cdxIconCode,
      cdxIconJournal: cdxIconJournal,
      cdxIconReload: cdxIconReload,
      spiHelperSettings: spiHelperSettings,
      resetTrigger: 0,
    };
  },
  computed: {
    logPage() {
      return `${mw.config.get('wgServer')}/wiki/User:${mw.config.get('wgUserName')}/${this.spiHelperSettings.log.page}`;
    },
    isCheckUser() {
      const { debug } = this.spiHelperSettings;
      const isCU = mw.config.get('wgUserGroups')?.includes('checkuser') || false;

      return isCU || (debug.enabled && debug.forceCheckuser);
    },
  },
  template: `
    <!--suppress ALL -->
    <cdx-dialog v-model:open="open" title="spiHelper Options"
                close-button-label="Close" id="spiHelper-opts-dialog"
                @update:open="onDialogUpdate">
      <p>Configure your spiHelper options</p>
      <cdx-message v-if="showExtraMessage" type="success" :fade-in="true" :auto-dismiss="true" :display-time="3000">
        I trust that you understand section moves
      </cdx-message>
      <cdx-accordion :action-icon="cdxIconWatchlist" :action-always-visible="true">
        <template #title>Watch</template>
        <watch-setting label="Cases" v-model="spiHelperSettings.watch.case" :reset-trigger="resetTrigger"/>
        <watch-setting label="Archives" v-model="spiHelperSettings.watch.archive" :reset-trigger="resetTrigger"/>
        <watch-setting label="Tagged Users" v-model="spiHelperSettings.watch.tagged" :reset-trigger="resetTrigger"/>
        <watch-setting label="Categories" v-model="spiHelperSettings.watch.categories" :reset-trigger="resetTrigger"/>
        <cdx-field>
          <template #label>Blocked Users</template>
          <cdx-toggle-switch v-model="spiHelperSettings.watch.blocked"/>
          <template #help-text>Due to API limitations, only a toggle is available</template>
        </cdx-field>
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconClock" :action-always-visible="true">
        <template #title>Expiry</template>
        <p>
          Expiry values may be relative (e.g. 5 months or 2 weeks) or absolute (e.g. 2014-09-18T12:34:56Z). For no
          expiry, use infinite, indefinite, infinity or never.
        </p>
        <expiry-setting label="Cases" v-model="spiHelperSettings.expiry.case" :reset-trigger="resetTrigger"/>
        <expiry-setting label="Archives" v-model="spiHelperSettings.expiry.archive" :reset-trigger="resetTrigger"/>
        <expiry-setting label="Tagged Users" v-model="spiHelperSettings.expiry.tagged" :reset-trigger="resetTrigger"/>
        <expiry-setting label="Categories" v-model="spiHelperSettings.expiry.categories" :reset-trigger="resetTrigger"/>
        <expiry-setting label="Blocked Users" v-model="spiHelperSettings.expiry.blocked" :reset-trigger="resetTrigger"/>
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconJournal" :action-always-visible="true">
        <template #title>Log</template>
        <cdx-toggle-switch v-model="spiHelperSettings.log.enabled">
          Enabled
          <template #description>Log all actions to your userspace</template>
        </cdx-toggle-switch>
        <div v-if="spiHelperSettings.log.enabled">
          <logpage-setting v-model="spiHelperSettings.log.page" :prefix="logPrefix"/>
          <br>
          <cdx-toggle-switch v-model="spiHelperSettings.log.reversed">
            Reverse log
            <template #description>Reverse said log, so that the newest actions are at the top</template>
          </cdx-toggle-switch>
          <p style="word-wrap: anywhere">
            Logging to [[<a :href="logPage">{{ logPrefix + spiHelperSettings.log.page }}</a>]]
          </p>
        </div>
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconCode" :action-always-visible="true" v-if="showExtra">
        <template #title>Debug</template>
        <cdx-toggle-switch v-model="spiHelperSettings.debug.enabled" :align-switch="true">
          Enabled
        </cdx-toggle-switch>
        <cdx-field v-if="spiHelperSettings.debug.enabled">
          <template #description>These will override your roles. For example, if you are an administrator and force admin is unchecked, spiHelper will not consider you as an admninistrator.</template>
          <cdx-toggle-switch v-model="spiHelperSettings.debug.forceCheckuser" :align-switch="true">
            Force CheckUser state
          </cdx-toggle-switch>
          <cdx-toggle-switch v-model="spiHelperSettings.debug.forceAdmin" :align-switch="true">
            Force Admin state
          </cdx-toggle-switch>
        </cdx-field>
      </cdx-accordion>
      <div class="spiHelper-setting">
        <cdx-toggle-switch v-model="spiHelperSettings.clerk" :align-switch="true">Clerk</cdx-toggle-switch>
        <cdx-toggle-switch v-model="spiHelperSettings.tickArchiveWhenCaseClosed" :align-switch="true">
          Tick archive
          <template #description>Automatically tick the "Archive case" option if the case is closed</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-model="spiHelperSettings.displayIPv6As64" :align-switch="true">
          Display IPv6 as /64
          <template #description>Default IPv6 listings to /64 in the block/tag socks menu</template>
        </cdx-toggle-switch>
        <cdx-toggle-switch v-if="isCheckUser" v-model="spiHelperSettings.useCheckuserblockAccount" :align-switch="true">
          <span v-pre>Use {{<a href="//en.wikipedia.org/wiki/Template:Checkuserblock-account">checkuserblock-account</a>}} when CU blocking</span>
        </cdx-toggle-switch>
        <div v-if="showExtra">
          <cdx-toggle-switch v-model="spiHelperSettings.iUnderstandSectionMoves" :align-switch="true">
            I understand section moves
          </cdx-toggle-switch>
        </div>
        <br>
        <cdx-button @click="loadDefaults">
          Load defaults
          <cdx-icon :icon="cdxIconReload"/>
        </cdx-button>
      </div>
    </cdx-dialog>
  `,
  methods: {
    openDialog() {
      this.open = true;
      if (!this.showExtra) {
        window.addEventListener('keydown', this._showExtraHandler);
      }
    },
    loadDefaults() {
      // Create a deep copy and replace the reactive reference
      this.spiHelperSettings = JSON.parse(JSON.stringify(spiHelperDefaultSettings));
      // Also update the global
      Object.assign(spiHelperSettings, spiHelperDefaultSettings);
      this.resetTrigger++;
    },
    onDialogUpdate(open: boolean) {
      if (!open) {
        void saveOptions();
        if (this._showExtraHandler) {
          window.removeEventListener('keydown', this._showExtraHandler);
        }
      }
    },
    onMounted() {
      // https://discord.com/channels/1373700739951624272/1447651346508415110/1447681331634110575
      // "SPIhelper won't let you do merges until you learn how to merge.
      // if you figure out how to make SPIhelper let you merge,
      // you are allowed to merge." -asilvering
      const target = 'COMPRENDO';
      let buffer = '';

      this._showExtraHandler = (e: KeyboardEvent) => {
        if (e.key.length !== 1) return;

        buffer += e.key.toUpperCase();
        if (buffer.length > target.length) {
          buffer = buffer.slice(-target.length);
        }
        if (buffer === target) {
          this.showExtra = true;
          this.showExtraMessage = true;
          window.removeEventListener('keydown', this._showExtraHandler);
        }
      };
    },
  },
};
