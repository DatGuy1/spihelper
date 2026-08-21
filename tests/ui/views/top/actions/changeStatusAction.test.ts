import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import type { MenuGroupData, MenuItemData } from '@wikimedia/codex';
import type { CaseStatus } from '../../../../../src/types';
import { spiHelperSettings } from '../../../../../src/options';
import { ChangeStatusActionComponent } from '../../../../../src/ui/views/top';
import { isMenuGroupData } from '../../../../../src/ui/utils.ts';

const computed = ChangeStatusActionComponent.computed as unknown as {
  caseStatusItems(this: { oldStatus: CaseStatus }): (MenuItemData | MenuGroupData)[];
};

/** Every value the dropdown offers, flattened out of its groups */
function offeredValues(oldStatus: CaseStatus): unknown[] {
  const items = computed.caseStatusItems.call({ oldStatus });
  return items
    .flatMap(item => isMenuGroupData(item) ? item.items : [item])
    .map(item => item.value);
}

describe('ChangeStatusActionComponent', () => {
  describe('caseStatusItems', () => {
    beforeEach(() => {
      // Act as a checkuser so the clerk and CU branches are reachable
      spiHelperSettings.debug.enabled = true;
      spiHelperSettings.debug.forceCheckuser = true;
    });

    afterEach(() => {
      spiHelperSettings.debug.enabled = false;
      spiHelperSettings.debug.forceCheckuser = false;
    });

    test('offers a relist on every status a completed check can be left at', () => {
      // 'cudecline' is what spihelper itself writes for "Decline CheckUser", so a case
      // it declined has to be relistable on reload
      for (const status of ['inprogress', 'checked', 'relist', 'decline', 'cudecline'] as const) {
        expect(offeredValues(status)).toContain('relist');
      }
    });

    test('does not offer a relist on a status with no check behind it', () => {
      expect(offeredValues('open')).not.toContain('relist');
    });

    test('treats cuendorse like endorse when a check has been endorsed', () => {
      for (const status of ['endorse', 'cuendorse'] as const) {
        expect(offeredValues(status)).toContain('cudecline');
        expect(offeredValues(status)).toContain('cumoreinfo');
      }
    });

    test('offers a checkuser both kinds of hold', () => {
      expect(offeredValues('open')).toContain('cuhold');
      expect(offeredValues('open')).toContain('hold');
    });

    describe('as a clerk who is not a checkuser', () => {
      beforeEach(() => {
        spiHelperSettings.debug.forceCheckuser = false;
        spiHelperSettings.clerk = true;
      });

      test('offers a plain hold but not a CU hold', () => {
        // The CU hold banner asserts a checkuser placed it
        expect(offeredValues('open')).toContain('hold');
        expect(offeredValues('open')).not.toContain('cuhold');
      });
    });
  });
});
