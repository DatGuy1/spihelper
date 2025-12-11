import { spiHelperOneClickArchive } from './caseActions.ts';
import { CaseState } from './state.ts';
import { spiHelperInitTopLevel } from './init.ts';
import { spiHelperIsClerk } from './role.ts';
import { OptionsComponent } from './options/modal.ts';
import { WatchSettingComponent } from './options/watchSetting.ts';
import { ExpirySettingComponent } from './options/expirySetting.ts';
import { LogPageSettingComponent } from './options/logPageSetting.ts';
import { loadOptions, migrateOptions, saveOptions, spiHelperSettings } from './options.ts';

// DatGuy's rewrite of GeneralNotability's rewrite of Tim's SPI helper script
// With additional contributions from 0xDeadbeef, Dreamy Jazz,
// L235, Tamzin, TheresNoTime, and Xiplus

importStylesheet('User:DatGuy/spihelper.css');

mw.loader.using(['mediawiki.api', 'mediawiki.util', 'mediawiki.user'], async () => {
  if (!mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/')) {
    return;
  }

  const caseState = new CaseState();
  const loadedOptions = loadOptions();
  if (loadedOptions) {
    Object.assign(spiHelperSettings, loadedOptions);
  }
  else {
    await migrateOptions();
    await saveOptions();
  }

  const initLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta', 'ca-spiHelper');
  // The skin didn't have a p-cactions menu so the menu addition failed. Exit early.
  if (!initLink) {
    return false;
  }
  initLink.addEventListener('click', (e) => {
    e.preventDefault();
    return spiHelperInitTopLevel(caseState);
  });

  const settingsLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta-Options', 'ca-spiHelperOpts');
  if (settingsLink) {
    mw.loader.using('@wikimedia/codex').then((require) => {
      const Vue = require('vue');
      const Codex = require('@wikimedia/codex');

      OptionsComponent.mounted = function () {
        this.onMounted();
        settingsLink.addEventListener('click', this.openDialog);
      };
      OptionsComponent.unmounted = function () {
        settingsLink.removeEventListener('click', this.openDialog);
      };

      const mountPoint = document.body.appendChild(document.createElement('div'));
      Vue.createMwApp(OptionsComponent)
        .component('cdx-button', Codex.CdxButton)
        .component('cdx-dialog', Codex.CdxDialog)
        .component('cdx-field', Codex.CdxField)
        .component('cdx-select', Codex.CdxSelect)
        .component('cdx-toggle-switch', Codex.CdxToggleSwitch)
        .component('cdx-accordion', Codex.CdxAccordion)
        .component('cdx-text-input', Codex.CdxTextInput)
        .component('cdx-icon', Codex.CdxIcon)
        .component('cdx-message', Codex.CdxMessage)
        .component('watch-setting', WatchSettingComponent)
        .component('expiry-setting', ExpirySettingComponent)
        .component('logpage-setting', LogPageSettingComponent)
        .mount(mountPoint);
    });
  }

  if (mw.config.get('wgCategories').includes('SPI cases awaiting archive') && spiHelperIsClerk()) {
    const oneClickArchiveLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta-Archive', 'ca-spiHelperArchive');
    if (oneClickArchiveLink) {
      $(oneClickArchiveLink).on('click', (e) => {
        e.preventDefault();
        return spiHelperOneClickArchive(caseState);
      });
    }
  }
});
