import type { ActionLabel, CaseActionName, CaseActionSection, SelectionType } from '../../../../types';
import { context } from '../../../../context.ts';
import { spiHelperIsClerk } from '../../../../role.ts';
import { ClerkOnlyActions, NonArchiveActions } from './setup.ts';

export function shouldShowAction(opts: {
  name: CaseActionName;
  selection: CaseActionSection;
  selectionType: SelectionType;
}): boolean {
  const { name, selection, selectionType } = opts;
  if (context.isArchive) {
    return !NonArchiveActions.has(name);
  }
  if (!spiHelperIsClerk() && ClerkOnlyActions.has(name)) {
    return false;
  }
  if (name === 'sections') return true;
  if (selection === null) return false;
  if (selectionType === 'both') return true;
  // A multi-section selection combines section-only actions (comment/status/archive)
  // with all-section-only ones (management/archivenotice) in the same save.
  if (Array.isArray(selection)) return true;
  return (selectionType === 'case') === (selection === 'all');
}

export function actionLabelText(opts: {
  label: string | ActionLabel;
  selectionType: SelectionType;
  allSelected: boolean;
}): string {
  const { label, selectionType, allSelected } = opts;
  if (typeof label === 'string') {
    return label;
  }
  if (selectionType === 'both') {
    return allSelected ? label.case : label.section;
  }
  return 'Unexpected configuration';
}
