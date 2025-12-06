import { spiHelperEditPage, spiHelperGetPageRev, spiHelperGetPageText } from './api.ts';
import type { WatchOption } from './types/api.ts';

export class SpiPageContext {
  // Name of the SPI page in wiki title form, "Wikipedia:Sockpuppet investigations/Foo"
  readonly pageName: string;
  // Only the username part of the case, "Foo"
  readonly caseName: string;
  readonly archiveName: string;
  readonly isArchive: boolean;
  // used to check if the page has been edited since we opened it to prevent edit conflicts
  startingRevId: number;

  _text: string | null = null;

  constructor(pageName: string) {
    this.pageName = pageName;
    this.isArchive = /Wikipedia:Sockpuppet investigations\/.+\/Archive/.test(pageName);
    this.caseName = extractCaseName(pageName, this.isArchive);
    this.archiveName = pageName + '/Archive';
    this.startingRevId = mw.config.get('wgCurRevisionId');
  }

  async refreshRevId() {
    this.startingRevId = await spiHelperGetPageRev(this.pageName);
  }

  async getText(purge: boolean = false, show: boolean = false): Promise<string> {
    if (purge || this._text === null) {
      this._text = await spiHelperGetPageText(this.pageName, show);
    }
    return this._text;
  }

  async edit(opts: { newText: string; summary: string; createonly?: boolean; watch: WatchOption; watchExpiry?: string; baseRevId?: number; sectionId?: number | null }): Promise<boolean> {
    return spiHelperEditPage(
      this.pageName, opts.newText, opts.summary, opts.createonly ?? false, opts.watch, opts.watchExpiry, opts.baseRevId, opts.sectionId,
    );
  }
}

function extractCaseName(pageName: string, isArchive: boolean): string {
  const base = pageName.replace(/^Wikipedia:Sockpuppet investigations\//, '');
  return isArchive ? base.replace(/\/Archive.*/, '') : base;
}

const rawPageName = mw.config.get('wgPageName') ?? '';
const pageName = rawPageName.replaceAll(/_/g, ' ');

export let context: SpiPageContext = new SpiPageContext(pageName);

export function setContext(pageName: string) {
  context = new SpiPageContext(pageName);
}
