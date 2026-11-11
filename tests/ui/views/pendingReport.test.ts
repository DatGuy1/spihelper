import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { PendingReportComponent } from '../../../src/ui/views/pendingReport.ts';

interface Ctx {
  master: string;
  casePage: string;
}

const computed = PendingReportComponent.computed as unknown as {
  casePage(this: Pick<Ctx, 'master'>): string;
  caseUrl(this: Ctx): string;
  onOtherPage(this: Ctx): boolean;
};

function makeCtx(): Ctx {
  const master = 'Alice Foo';
  return { master, casePage: computed.casePage.call({ master }) };
}

describe('PendingReportComponent', () => {
  describe('onOtherPage', () => {
    let originalConfigGet: typeof mw.config.get;
    let pageName = '';

    beforeEach(() => {
      originalConfigGet = mw.config.get.bind(mw.config);
      mw.config.get = ((key: string) => (
        key === 'wgPageName' ? pageName : originalConfigGet(key)
      )) as typeof mw.config.get;
    });

    afterEach(() => {
      mw.config.get = originalConfigGet;
    });

    function onOtherPageFrom(page: string): boolean {
      pageName = page;
      return computed.onOtherPage.call(makeCtx());
    }

    test('leaves the case unnamed on its own page', () => {
      expect(onOtherPageFrom('Wikipedia:Sockpuppet_investigations/Alice_Foo')).toBe(false);
    });

    test('names the case anywhere else, its archive included', () => {
      expect(onOtherPageFrom('Wikipedia:Sockpuppet_investigations/Alice_Foo/Archive')).toBe(true);
      expect(onOtherPageFrom('Special:CheckUser')).toBe(true);
    });
  });

  test('links to the case page', () => {
    expect(computed.caseUrl.call(makeCtx()))
      .toBe(mw.util.getUrl('Wikipedia:Sockpuppet investigations/Alice Foo'));
  });
});
