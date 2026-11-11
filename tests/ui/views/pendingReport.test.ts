import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { PendingReportComponent } from '../../../src/ui/views/pendingReport.ts';
import type { CaseReport } from '../../../src/types';

interface Ctx {
  report: CaseReport;
  master: string;
  onOtherPage: boolean;
}

const computed = PendingReportComponent.computed as unknown as {
  onOtherPage(this: Ctx): boolean;
  summary(this: Ctx): string;
};

describe('PendingReportComponent summary', () => {
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

  function summaryOn(page: string): string {
    pageName = page;
    const ctx = { report: { socks: ['Bob', 'Carol'], evidence: 'x' }, master: 'Alice Foo' } as Ctx;
    ctx.onOtherPage = computed.onOtherPage.call(ctx);
    return computed.summary.call(ctx);
  }

  test('leaves the case unnamed on its own page', () => {
    expect(summaryOn('Wikipedia:Sockpuppet_investigations/Alice_Foo'))
      .toBe('A new report listing 2 accounts will be filed when you submit.');
  });

  test('names the case anywhere else, its archive included', () => {
    expect(summaryOn('Wikipedia:Sockpuppet_investigations/Alice_Foo/Archive'))
      .toBe('A new report listing 2 accounts will be filed on Alice Foo when you submit.');
    expect(summaryOn('Special:CheckUser'))
      .toContain('on Alice Foo');
  });
});
