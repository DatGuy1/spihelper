// src/state.ts
import { context } from './context';
import { spiHelperGetInvestigationSectionIDs, spiHelperGetPageText } from './api';
import { type ParsedArchiveNotice, SectionEntry, type SectionSelection } from './types/spi.ts';

export class CaseState {
  sections: SectionEntry[];
  selectedSection: SectionSelection | null;
  archiveNotice: ParsedArchiveNotice | null;
  numLinkUsers: number;
  numBlockUsers: number;

  private _text: string | null = null;

  constructor(
    sections: SectionEntry[] = [],
    selectedSection: SectionEntry | null = null,
    archiveNotice: ParsedArchiveNotice | null = null,
  ) {
    this.sections = sections;
    if (selectedSection) {
      this.selectedSection = { type: 'specific', section: selectedSection };
    }
    else {
      this.selectedSection = null;
    }
    this.archiveNotice = archiveNotice;
    this.numLinkUsers = 0;
    this.numBlockUsers = 0;
  }

  async getText() {
    if (this._text !== null) return this._text;
    this._text = await spiHelperGetPageText(context.pageName, false);
    return this._text;
  }

  // optional setter if you want to override it manually
  setText(value: string) {
    this._text = value;
  }
}

export async function refreshSections(state: CaseState) {
  const sections = await spiHelperGetInvestigationSectionIDs(context.pageName);
  if (state.sections.length !== sections.length) {
    state.sections = sections;
  }
}
