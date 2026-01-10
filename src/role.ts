/**
 * Whether the current user has checkuser permissions, used to determine
 * whether to show checkuser options
 *
 * @return {boolean} Whether the current user is a checkuser
 */
import { spiHelperSettings } from './options';

export function spiHelperIsCheckuser(allowDebug: boolean = true): boolean {
  if (allowDebug && spiHelperSettings.debug.enabled) {
    return spiHelperSettings.debug.forceCheckuser;
  }
  return mw.config.get('wgUserGroups')?.includes('checkuser') ?? false;
}

/**
 * Whether the current user is a clerk, used to determine whether to show
 * clerk options
 *
 * @return {boolean} Whether the current user is a clerk
 */
export function spiHelperIsClerk(): boolean {
  // Assumption: checkusers should see clerk options. Please don't prove this wrong.
  return spiHelperSettings.clerk || spiHelperIsCheckuser();
}

/**
 * Whether the current user has admin permissions, used to determine
 * whether to show block options
 *
 * @return {boolean} Whether the current user is an admin
 */
export function spiHelperIsAdmin(): boolean {
  if (spiHelperSettings.debug.enabled) {
    return spiHelperSettings.debug.forceAdmin;
  }
  return mw.config.get('wgUserGroups')?.includes('sysop') ?? false;
}
