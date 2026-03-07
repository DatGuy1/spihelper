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
  ActionContentComponent,
  ArchiveActionComponent,
  BlockActionComponent,
  ChangeStatusActionComponent,
  CommentActionComponent,
  LinkActionComponent,
  ManagementActionComponent,
  MoveActionComponent,
  TopViewComponent,
} from './ui/views/top';
import {
  AlternateViewComponent,
  ChangelogViewComponent,
  ExpiryInputComponent,
  OneClickArchivalComponent,
  PageLookupComponent,
  SubmitFormComponent,
  TagPopoverComponent,
  UserLookupComponent,
} from './ui/views';
import { hasRunningOps } from './operations.ts';
import { FeedbackConfig, VERSION } from './constants/settings.ts';
import type * as VueType from 'vue';
import type * as CodexType from '@wikimedia/codex';
import type { FeedbackDialog } from './types/vue.ts';
import { setContext } from './context.ts';
import { getUnseenChanges } from './changelog.ts';

// DatGuy's rewrite of GeneralNotability's rewrite of Tim's SPI helper script
// With additional contributions from 0xDeadbeef, Dreamy Jazz,
// L235, Tamzin, TheresNoTime, and Xiplus
if (mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/') && !mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/SPI/')) {
  bootstrap('spi');
}
else if (mw.config.get('wgCanonicalSpecialPageName') === 'CheckUser') {
  bootstrap('checkuser');
}
else if (mw.config.get('wgCanonicalSpecialPageName') === 'SuggestedInvestigations' && mw.config.get('wgPageName').includes('/detail/')) {
  bootstrap('si');
}
else if (
  mw.config.get('wgNamespaceNumber') === 14
  && ['Suspected Wikipedia sockpuppets', 'Wikipedia sockpuppets'].some(cat => mw.config.get('wgCategories').includes(cat))
) {
  bootstrap('category');
}

function bootstrap(pageType: 'spi' | 'checkuser' | 'si' | 'category') {
  mw.loader.using(['vue', '@wikimedia/codex', 'mediawiki.api', 'mediawiki.util', 'mediawiki.user', 'mediawiki.feedback'], (require) => {
    const Vue = require('vue') as typeof VueType;
    const Codex = require('@wikimedia/codex') as typeof CodexType;

    // For some reason mw.Feedback isn't typed
    // @ts-expect-error - mw.Feedback exists at runtime but not in type definitions
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const feedbackDialog: FeedbackDialog = new mw.Feedback(FeedbackConfig);

    // @ts-expect-error Ignore __MODE__ not existing error because Bun should replace it on compile
    if (__MODE__ === 'live') {
      mw.loader.load('http://localhost:8080/spihelper.css', 'text/css');
    }
    // @ts-expect-error Ignore __MODE__, same as above
    else if (__MODE__ === 'dev') {
      importStylesheet('User:DatGuy/spihelper.dev.css');
    }
    else {
      importStylesheet('User:DatGuy/spihelper.css');
    }

    let targetSock;
    const caseState = Vue.reactive(new CaseState()) as CaseState;
    if (pageType === 'spi') {
      const rawPageName = mw.config.get('wgPageName');
      setContext(rawPageName);
      void refreshSections(caseState);
    }
    else if (pageType === 'category') {
      targetSock = /Category:(?:Suspected )?Wikipedia sockpuppets of (.*)/.exec(mw.config.get('wgPageName').replaceAll('_', ' '));
      if (!targetSock?.[1]) {
        return;
      }
    }
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

    const changelogState = Vue.reactive({ isOpen: false });
    if (spiHelperSettings.lastSeenVersion !== VERSION) {
      console.log(spiHelperSettings.lastSeenVersion);
      getUnseenChanges(spiHelperSettings.lastSeenVersion)
        .then((unseenChanges) => {
          const mountPoint = document.createElement('div');
          mountPoint.style.position = 'absolute';
          mw.util.$content.prepend(mountPoint);

          const changelogApp = Vue.createMwApp(ChangelogViewComponent, {
            unseenChanges,
            openState: changelogState,
            onDismissed: async () => {
              spiHelperSettings.lastSeenVersion = VERSION;
              await saveOptions();
              changelogApp.unmount();
              mountPoint.remove();
            },
          })
            .component('cdx-button', Codex.CdxButton)
            .component('cdx-dialog', Codex.CdxDialog);
          changelogApp.mount(mountPoint);
        }, () => { /* empty */ });
    }

    const initLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta', 'ca-spiHelper', 'Run spiHelper');
    // Fails if we don't have a p-cactions menu
    if (initLink) {
      const mountPoint = document.createElement('div');
      mountPoint.setAttribute('id', 'spiHelper-vue-mount-point');
      mw.util.$content.prepend(mountPoint);

      initLink.addEventListener('click', () => {
        changelogState.isOpen = true;
      });
      switch (pageType) {
        case 'spi': {
          Vue.createMwApp(TopViewComponent, {
            state: caseState, feedbackDialog, openButton: initLink,
          })
            .component('cdx-tabs', Codex.CdxTabs)
            .component('cdx-tab', Codex.CdxTab)
            .component('cdx-select', Codex.CdxSelect)
            .component('cdx-card', Codex.CdxCard)
            .component('cdx-toggle-switch', Codex.CdxToggleSwitch)
            .component('cdx-text-area', Codex.CdxTextArea)
            .component('cdx-toggle-button', Codex.CdxToggleButton)
            .component('cdx-toggle-button-group', Codex.CdxToggleButtonGroup)
            .component('cdx-button', Codex.CdxButton)
            .component('cdx-button-group', Codex.CdxButtonGroup)
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
            .component('tag-popover', TagPopoverComponent)
            .directive('tooltip', Codex.CdxTooltip)
            .mount(mountPoint);
          break;
        }
        case 'checkuser': {
          Vue.createMwApp(AlternateViewComponent, {
            state: caseState, feedbackDialog, openButton: initLink, view: 'checkuser',
          })
            .component('cdx-button', Codex.CdxButton)
            .component('cdx-checkbox', Codex.CdxCheckbox)
            .component('cdx-field', Codex.CdxField)
            .component('cdx-icon', Codex.CdxIcon)
            .component('cdx-label', Codex.CdxLabel)
            .component('cdx-lookup', Codex.CdxLookup)
            .component('cdx-message', Codex.CdxMessage)
            .component('cdx-popover', Codex.CdxPopover)
            .component('cdx-progress-indicator', Codex.CdxProgressIndicator)
            .component('cdx-select', Codex.CdxSelect)
            .component('cdx-table', Codex.CdxTable)
            .component('cdx-text-input', Codex.CdxTextInput)
            .component('cdx-toggle-button-group', Codex.CdxToggleButtonGroup)
            .component('submit-form', SubmitFormComponent)
            .component('block-action', BlockActionComponent)
            .component('link-action', LinkActionComponent)
            .component('user-lookup', UserLookupComponent)
            .component('page-lookup', PageLookupComponent)
            .component('expiry-input', ExpiryInputComponent)
            .component('tag-popover', TagPopoverComponent)
            .directive('tooltip', Codex.CdxTooltip)
            .mount(mountPoint);
          break;
        }
        case 'category': {
          if (!targetSock?.[1]) {
            console.error('spiHelper bootstrap: expected targetSock');
            return;
          }
          Vue.createMwApp(AlternateViewComponent, {
            state: caseState, feedbackDialog, openButton: initLink,
            view: 'category', defaultCase: targetSock[1],
          })
            .component('cdx-button', Codex.CdxButton)
            .component('cdx-checkbox', Codex.CdxCheckbox)
            .component('cdx-field', Codex.CdxField)
            .component('cdx-icon', Codex.CdxIcon)
            .component('cdx-label', Codex.CdxLabel)
            .component('cdx-lookup', Codex.CdxLookup)
            .component('cdx-message', Codex.CdxMessage)
            .component('cdx-popover', Codex.CdxPopover)
            .component('cdx-progress-indicator', Codex.CdxProgressIndicator)
            .component('cdx-select', Codex.CdxSelect)
            .component('cdx-table', Codex.CdxTable)
            .component('cdx-text-input', Codex.CdxTextInput)
            .component('cdx-toggle-button-group', Codex.CdxToggleButtonGroup)
            .component('submit-form', SubmitFormComponent)
            .component('block-action', BlockActionComponent)
            .component('link-action', LinkActionComponent)
            .component('user-lookup', UserLookupComponent)
            .component('page-lookup', PageLookupComponent)
            .component('expiry-input', ExpiryInputComponent)
            .component('tag-popover', TagPopoverComponent)
            .directive('tooltip', Codex.CdxTooltip)
            .mount(mountPoint);
          break;
        }
        case 'si': {
          Vue.createMwApp(AlternateViewComponent, {
            state: caseState, feedbackDialog, openButton: initLink,
            view: 'si',
          })
            .component('cdx-button', Codex.CdxButton)
            .component('cdx-checkbox', Codex.CdxCheckbox)
            .component('cdx-field', Codex.CdxField)
            .component('cdx-icon', Codex.CdxIcon)
            .component('cdx-label', Codex.CdxLabel)
            .component('cdx-lookup', Codex.CdxLookup)
            .component('cdx-message', Codex.CdxMessage)
            .component('cdx-popover', Codex.CdxPopover)
            .component('cdx-progress-indicator', Codex.CdxProgressIndicator)
            .component('cdx-select', Codex.CdxSelect)
            .component('cdx-table', Codex.CdxTable)
            .component('cdx-text-input', Codex.CdxTextInput)
            .component('cdx-toggle-button-group', Codex.CdxToggleButtonGroup)
            .component('submit-form', SubmitFormComponent)
            .component('block-action', BlockActionComponent)
            .component('link-action', LinkActionComponent)
            .component('user-lookup', UserLookupComponent)
            .component('page-lookup', PageLookupComponent)
            .component('expiry-input', ExpiryInputComponent)
            .component('tag-popover', TagPopoverComponent)
            .directive('tooltip', Codex.CdxTooltip)
            .mount(mountPoint);
          break;
        }
      }
    }
    createSettingsLink(Vue, Codex, feedbackDialog);

    if (mw.config.get('wgCategories').includes('SPI cases awaiting archive') && spiHelperIsClerk()) {
      createOCALink(Vue, Codex, caseState);
    }

    // Make sure no operations are still in flight
    window.addEventListener('beforeunload', (e) => {
      if (hasRunningOps()) {
        e.preventDefault();
      }
    });
  });
}

function createSettingsLink(
  Vue: typeof VueType, Codex: typeof CodexType, feedbackDialog: FeedbackDialog,
) {
  const settingsLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta-Options', 'ca-spiHelperOpts', 'Modify spiHelper settings');
  if (settingsLink) {
    const mountPoint = document.body.appendChild(document.createElement('div'));
    Vue.createMwApp(OptionsComponent, { feedbackDialog, openButton: settingsLink })
      .component('cdx-button', Codex.CdxButton)
      .component('cdx-dialog', Codex.CdxDialog)
      .component('cdx-field', Codex.CdxField)
      .component('cdx-select', Codex.CdxSelect)
      .component('cdx-toggle-switch', Codex.CdxToggleSwitch)
      .component('cdx-accordion', Codex.CdxAccordion)
      .component('cdx-text-input', Codex.CdxTextInput)
      .component('cdx-icon', Codex.CdxIcon)
      .component('cdx-message', Codex.CdxMessage)
      .component('cdx-multiselect-lookup', Codex.CdxMultiselectLookup)
      .component('watch-setting', WatchSettingComponent)
      .component('expiry-setting', ExpirySettingComponent)
      .component('expiry-input', ExpiryInputComponent)
      .component('log-page-setting', LogPageSettingComponent)
      .mount(mountPoint);
  }
}

function createOCALink(Vue: typeof VueType, Codex: typeof CodexType, caseState: CaseState) {
  const oneClickArchiveLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta-Archive', 'ca-spiHelperArchive', 'Run one click archival');
  if (oneClickArchiveLink) {
    const mountPoint = document.body.appendChild(document.createElement('div'));
    Vue.createMwApp(
      OneClickArchivalComponent,
      {
        state: caseState,
        activateButton: oneClickArchiveLink,
      },
    )
      .component('cdx-dialog', Codex.CdxDialog)
      .component('cdx-message', Codex.CdxMessage)
      .component('cdx-progress-bar', Codex.CdxProgressBar)
      .mount(mountPoint);
  }
}
