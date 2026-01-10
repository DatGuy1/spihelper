import { CaseState, refreshSections } from './state.ts';
import { spiHelperIsClerk } from './role.ts';
import { OptionsComponent } from './ui/views/options/modal.ts';
import {
  ExpirySettingComponent,
  LogPageSettingComponent,
  WatchSettingComponent,
  loadOptions,
  migrateOptions,
  saveOptions,
  spiHelperSettings,
} from './options';
import {
  ActionAccordionComponent,
  ActionButtonComponent,
  ActionContainerComponent,
  BlockActionComponent,
  ChangeStatusActionComponent,
  CommentActionComponent,
  LinkActionComponent,
  ManagementActionComponent,
  TopViewComponent,
} from './ui/views/top';
import { UserLookupComponent } from './ui/views/userLookup.ts';
import { ExpiryInputComponent } from './ui/views/expiryInput.ts';
import { ArchiveActionComponent } from './ui/views/top/actions/archiveAction.ts';
import { MoveActionComponent } from './ui/views/top/actions/moveAction.ts';
import { PageLookupComponent } from './ui/views/pageLookup.ts';
import { SubmitFormComponent } from './ui/views/top/submitForm.ts';
import { ActionContentComponent } from './ui/views/top/actionContent.ts';
import { hasRunningOps } from './operations.ts';
import { OneClickArchivalComponent } from './ui/views/OCAModal.ts';

// DatGuy's rewrite of GeneralNotability's rewrite of Tim's SPI helper script
// With additional contributions from 0xDeadbeef, Dreamy Jazz,
// L235, Tamzin, TheresNoTime, and Xiplus

mw.loader.using(['vue', '@wikimedia/codex', 'mediawiki.api', 'mediawiki.util', 'mediawiki.user'], (require) => {
  if (!mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/')) {
    return;
  }

  const Vue = require('vue');
  const Codex = require('@wikimedia/codex');

  // @ts-expect-error Ignore __MODE__ not existing error because Bun should replace it on compile
  if (__MODE__ === 'dev') {
    mw.loader.load('http://127.0.0.1:8080/spihelper.css', 'text/css');
  }
  else {
    importStylesheet('User:DatGuy/spihelper.css');
  }

  const caseState = Vue.reactive(new CaseState()) as CaseState;
  void refreshSections(caseState);
  const loadedOptions = loadOptions();
  if (loadedOptions) {
    Object.assign(spiHelperSettings, loadedOptions);
  }
  else {
    void (async () => {
      await migrateOptions();
      saveOptions();
    })();
  }

  const initLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta', 'ca-spiHelper', 'Run spiHelper');
  // Fails if we don't have a p-cactions menu
  if (initLink) {
    const mountPoint = document.createElement('div');
    mountPoint.setAttribute('id', 'spiHelper-vue-mount-point');
    mw.util.$content.prepend(mountPoint);

    Vue.createMwApp(TopViewComponent, { state: caseState, openButton: initLink })
      .component('cdx-tabs', Codex.CdxTabs)
      .component('cdx-tab', Codex.CdxTab)
      .component('cdx-select', Codex.CdxSelect)
      .component('cdx-card', Codex.CdxCard)
      .component('cdx-toggle-switch', Codex.CdxToggleSwitch)
      .component('cdx-text-area', Codex.CdxTextArea)
      .component('cdx-toggle-button', Codex.CdxToggleButton)
      .component('cdx-toggle-button-group', Codex.CdxToggleButtonGroup)
      .component('cdx-button-group', Codex.CdxButtonGroup)
      .component('cdx-button', Codex.CdxButton)
      .component('cdx-icon', Codex.CdxIcon)
      .component('cdx-table', Codex.CdxTable)
      .component('cdx-text-input', Codex.CdxTextInput)
      .component('cdx-checkbox', Codex.CdxCheckbox)
      .component('cdx-lookup', Codex.CdxLookup)
      .component('cdx-field', Codex.CdxField)
      .component('cdx-message', Codex.CdxMessage)
      .component('cdx-progress-bar', Codex.CdxProgressBar)
      .component('cdx-progress-indicator', Codex.CdxProgressIndicator)
      .component('cdx-accordion', Codex.CdxAccordion)
      .component('cdx-label', Codex.CdxLabel)
      .component('cdx-popover', Codex.CdxPopover)
      .component('action-accordion', ActionAccordionComponent)
      .component('action-button', ActionButtonComponent)
      .component('action-container', ActionContainerComponent)
      .component('action-content', ActionContentComponent)
      .component('submit-form', SubmitFormComponent)
      .component('comment-action', CommentActionComponent)
      .component('change-status-action', ChangeStatusActionComponent)
      .component('block-action', BlockActionComponent)
      .component('link-action', LinkActionComponent)
      .component('management-action', ManagementActionComponent)
      .component('archive-action', ArchiveActionComponent)
      .component('move-action', MoveActionComponent)
      .component('user-lookup', UserLookupComponent)
      .component('page-lookup', PageLookupComponent)
      .component('expiry-input', ExpiryInputComponent)
      .directive('tooltip', Codex.CdxTooltip)
      .mount(mountPoint);
  }

  const modalMountPoint = document.body.appendChild(document.createElement('div'));
  const settingsLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta-Options', 'ca-spiHelperOpts', 'Modify spiHelper settings');
  if (settingsLink) {
    Vue.createMwApp(OptionsComponent, { openButton: settingsLink })
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
      .component('expiry-input', ExpiryInputComponent)
      .component('log-page-setting', LogPageSettingComponent)
      .mount(modalMountPoint);
  }

  if (mw.config.get('wgCategories').includes('SPI cases awaiting archive') && spiHelperIsClerk()) {
    const oneClickArchiveLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta-Archive', 'ca-spiHelperArchive', 'Run one click archival');
    if (oneClickArchiveLink) {
      Vue.createMwApp(
        OneClickArchivalComponent,
        {
          state: caseState,
          activateButton: oneClickArchiveLink,
        },
      )
        .component('cdx-dialog', Codex.CdxDialog)
        .component('cdx-message', Codex.CdxMessage)
        .mount(modalMountPoint);
    }
  }

  // Make sure no operations are still in flight
  window.addEventListener('beforeunload', (e) => {
    if (hasRunningOps()) {
      e.preventDefault();
    }
  });
});
