// src/state.ts
import { context } from './context';
import { spiHelperGetInvestigationSectionIDs, spiHelperGetPageText } from './api';
import { type ParsedArchiveNotice } from './types/spi.ts';

export type SectionSelection = | { type: 'all' } | { type: 'specific'; section: SectionEntry };

export class CaseState {
  sections: SectionEntry[];
  selectedSection: SectionSelection | null;
  archiveNotice: ParsedArchiveNotice | null;

  _text: string | null = null;
  _loadingPromise: Promise<string> | null = null;

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
  }
}

export class SectionEntry {
  id: number;
  name: string;

  _text: string | null = null;
  _loadingPromise: Promise<string> | null = null;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export async function loadCaseText(state: CaseState, purge = false) {
  if (state._loadingPromise) {
    return state._loadingPromise;
  }
  if (state._text !== null && !purge) {
    return state._text;
  }

  state._loadingPromise = spiHelperGetPageText(context.pageName, false);
  state._text = await state._loadingPromise;
  state._loadingPromise = null;

  return state._text;
}

export async function refreshSections(state: CaseState) {
  state.sections = await spiHelperGetInvestigationSectionIDs(context.pageName);
}

export async function loadSectionText(section: SectionEntry, purge = false) {
  if (section._loadingPromise) {
    return section._loadingPromise;
  }
  if (section._text !== null && !purge) {
    return section._text;
  }

  section._loadingPromise = spiHelperGetPageText(context.pageName, false, section.id);
  section._text = await section._loadingPromise;
  section._loadingPromise = null;

  return section._text;
}
