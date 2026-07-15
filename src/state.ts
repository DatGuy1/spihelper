import { context } from './context.ts';
import { spiHelperGetInvestigationSections, spiHelperGetPageText } from './api.ts';
import { type ParsedArchiveNotice } from './types';

export type SectionSelection = | { type: 'all' }
  | { type: 'single'; section: SectionEntry }
  | { type: 'multiple'; sections: SectionEntry[] };

// The set of sections currently "in play" for a selection, regardless of whether that's
// represented as 'single' (exactly one) or 'multiple' (two or more).
export function getSelectedSections(selection: SectionSelection | null): SectionEntry[] {
  if (selection?.type === 'single') {
    return [selection.section];
  }
  if (selection?.type === 'multiple') {
    return selection.sections;
  }
  return [];
}

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
      this.selectedSection = { type: 'single', section: selectedSection };
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

export async function loadCaseText(
  state: CaseState,
  opts: { purge?: boolean; show?: boolean } = {},
) {
  const { purge = false, show = false } = opts;
  if (state._loadingPromise) {
    return state._loadingPromise;
  }
  if (state._text !== null && !purge) {
    return state._text;
  }

  state._loadingPromise = spiHelperGetPageText(context.pageName, show);
  state._text = await state._loadingPromise;
  state._loadingPromise = null;

  return state._text;
}

export async function refreshSections(state: CaseState) {
  state.sections = await spiHelperGetInvestigationSections({ pageName: context.pageName });
}

export async function loadSectionText(
  section: SectionEntry,
  opts: { purge?: boolean; show?: boolean } = {},
) {
  const { purge = false, show = false } = opts;
  if (section._loadingPromise) {
    return section._loadingPromise;
  }
  if (section._text !== null && !purge) {
    return section._text;
  }

  section._loadingPromise = spiHelperGetPageText(context.pageName, show, section.id);
  section._text = await section._loadingPromise;
  section._loadingPromise = null;

  return section._text;
}
