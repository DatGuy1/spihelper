// noinspection HtmlUnknownTag, VueUnrecognizedSlot

import type { ComponentOptions } from 'vue';
import { cdxIconWatchlist, cdxIconClock, cdxIconJournal } from '@wikimedia/codex-icons';
import { spiHelperSettings } from '../options.ts';
import { spiHelperIsCheckuser } from '../role.ts';

// I would like to be able to defineComponent()
// but bun bundles vue-runtime into the build
// noinspection JSUnusedGlobalSymbols
export const OptionsComponent: ComponentOptions = {
  data: function () {
    const username = mw.config.get('wgUserName') || '';
    const logPrefix = `User:${username}/`;
    return {
      showDialog: true, // TODO: Change to false for PROD
      cdxIconWatchlist: cdxIconWatchlist,
      cdxIconClock: cdxIconClock,
      cdxIconJournal: cdxIconJournal,
      spiHelperSettings: spiHelperSettings,
      logPrefix: logPrefix,
      isCheckUser: spiHelperIsCheckuser(),
    };
  },
  computed: {
    logPage() {
      return `${mw.config.get('wgServer')}/wiki/User:${mw.config.get('wgUserName')}/${spiHelperSettings.log.page}`;
    },
  },
  template: `
    <cdx-dialog v-model:open="showDialog"
                title="spiHelper Options"
                close-button-label="Close"
                :default-action="defaultAction"
                @default="open = false" id="spiHelper-dialog"
    >
      <p>Configure your spiHelper options</p>
      <cdx-accordion :action-icon="cdxIconWatchlist" :action-always-visible="true">
        <template #title>Watch</template>
        <watch-setting label="Cases" v-model="spiHelperSettings.watch.case"/>
        <watch-setting label="Archives" v-model="spiHelperSettings.watch.archive"/>
        <watch-setting label="Tagged Users" v-model="spiHelperSettings.watch.tagged"/>
        <watch-setting label="Categories" v-model="spiHelperSettings.watch.categories"/>
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
        <expiry-setting label="Cases" v-model="spiHelperSettings.expiry.case"/>
      </cdx-accordion>
      <cdx-accordion :action-icon="cdxIconJournal" :action-always-visible="true">
        <template #title>Log</template>
        <cdx-toggle-switch v-model="spiHelperSettings.log.enabled">
          Enabled
          <template #description>Log all actions to your userspace</template>
        </cdx-toggle-switch>
        <div v-if="spiHelperSettings.log.enabled">
          <logpage-setting v-model="spiHelperSettings.log.page" :prefix="logPrefix" />
          <br>
          <cdx-toggle-switch v-model="spiHelperSettings.log.reversed">
            Reverse log
            <template #description>Reverse said log, so that the newest actions are at the top</template>
          </cdx-toggle-switch>
          <p style="word-wrap: anywhere">Logging to [[<a :href="logPage">{{ this.logPrefix + spiHelperSettings.log.page }}</a>]]</p>
        </div>
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
      </div>
    </cdx-dialog>
  `,
  methods: {
    openDialog() {
      this.showDialog = true;
    },
  },
};
