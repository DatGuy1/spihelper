import { spiHelperSettings } from './options.ts';
import { spiHelperOneClickArchive } from './caseActions.ts';
import { CaseState } from './state.ts';
import { spiHelperInitTopLevel } from './init.ts';
import { spiHelperIsCheckuser, spiHelperIsClerk } from './role.ts';

// DatGuy's rewrote of GeneralNotability's rewrite of Tim's SPI helper script
// With additional contributions from 0xDeadbeef, Dreamy Jazz, L235, Tamzin, TheresNoTime, and Xiplus

importStylesheet('User:DatGuy/spihelper.css');

mw.loader.using(['mediawiki.api', 'mediawiki.util', 'mediawiki.user'], async function () {
  if (!mw.config.get('wgPageName').includes('Wikipedia:Sockpuppet_investigations/')) {
    return;
  }

  // const settings = await spiHelperLoadSettings();
  spiHelperSettings.useCheckuserblockAccount = spiHelperIsCheckuser();
  const caseState = new CaseState();

  const initLink = mw.util.addPortletLink('p-cactions', '#', 'SPI-Beta', 'ca-spiHelper');
  // The skin didn't have a p-cactions menu so the menu addition failed. Exit early.
  if (!initLink) {
    return false;
  }
  initLink.addEventListener('click', (e) => {
    e.preventDefault();
    return spiHelperInitTopLevel(caseState);
  });
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
