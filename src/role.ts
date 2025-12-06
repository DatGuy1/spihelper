/**
 * Whether the current user has checkuser permissions, used to determine
 * whether to show checkuser options
 *
 * @return {boolean} Whether the current user is a checkuser
 */
import { spiHelperSettings } from './options.ts';

export function spiHelperIsCheckuser(): boolean {
  if (spiHelperSettings.debugForceCheckuserState !== null) {
    return spiHelperSettings.debugForceCheckuserState;
  }
  return mw.config.get('wgUserGroups')?.includes('sysop') ?? false;
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
  if (spiHelperSettings.debugForceAdminState !== null) {
    return spiHelperSettings.debugForceAdminState;
  }
  return mw.config.get('wgUserGroups')?.includes('sysop') ?? false;
}
