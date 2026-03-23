import { spiHelperEditPage, spiHelperGetPageRev, spiHelperGetPageText } from './api.ts';
import type { WatchOption } from './types/api.ts';
import { spiHelperGetInterwikiPrefix, spiHelperNormalizeUsername } from './utils.ts';

export class SpiPageContext {
  // Name of the page in wiki title form, "Wikipedia:Sockpuppet investigations/Foo"
  readonly pageName: string;
  // Full name including interwiki prefix, "w:Wikipedia:Sockpuppet investigations/Foo"
  readonly prefixedName: string;
  // Only the username part of the case, "Foo"
  readonly caseName: string;
  readonly userName: string;
  readonly archiveName: string;
  // Since pageName can be an archive, casePageName is the non-archive version
  readonly casePageName: string;
  readonly isArchive: boolean;
  // Whether the SPI page is valid. Currently only if the page isn't empty
  valid: boolean;
  // used to check if the page has been edited since we opened it to prevent edit conflicts
  startingRevId: number;

  _text: string | null = null;

  constructor(pageName: string, currentPage = false) {
    this.pageName = pageName;
    this.prefixedName = spiHelperGetInterwikiPrefix() + pageName;
    this.isArchive = /Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(pageName);
    this.caseName = extractCaseName(pageName, this.isArchive);
    this.userName = spiHelperNormalizeUsername(this.caseName);
    this.casePageName = 'Wikipedia:Sockpuppet investigations/' + this.caseName;
    this.archiveName = pageName + '/Archive';
    // I'd like to make valid an API call, but then I'd have to make it async
    this.valid = !!this.caseName.trim();
    if (currentPage) {
      this.startingRevId = mw.config.get('wgCurRevisionId');
    }
    else {
      this.startingRevId = 0;
    }
  }

  async refreshRevId() {
    this.startingRevId = await spiHelperGetPageRev(this.pageName);
  }

  async getText(opts: { purge?: boolean; show?: boolean } = {}): Promise<string> {
    const { purge = false, show = false } = opts;
    if (purge || this._text === null) {
      this._text = await spiHelperGetPageText(this.pageName, show);
    }
    return this._text;
  }

  async edit(opts: {
    newText: string;
    summary: string;
    createonly?: boolean;
    watch: WatchOption;
    watchExpiry?: string;
    baseRevId?: number;
    sectionId?: number | null;
  }): Promise<number | null> {
    return spiHelperEditPage({
      title: this.pageName,
      newText: opts.newText,
      summary: opts.summary,
      createonly: opts.createonly ?? false,
      watch: opts.watch,
      watchExpiry: opts.watchExpiry,
      baseRevId: opts.baseRevId,
      sectionId: opts.sectionId,
    });
  }
}

function extractCaseName(pageName: string, isArchive: boolean): string {
  const base = pageName.replace(/^Wikipedia:Sockpuppet investigations\//, '');
  return isArchive ? base.replace(/\/Archive.*/, '') : base;
}

function cleanPageName(pageName: string): string {
  return pageName.replaceAll(/_/g, ' ');
}

export let context: SpiPageContext;

export function setContext(pageName: string) {
  context = new SpiPageContext(cleanPageName(pageName), pageName === mw.config.get('wgPageName'));
}

export function buildContextSummary(baseText: string) {
  return context.valid ? baseText + ` per [[${context.prefixedName}]]` : baseText;
}
