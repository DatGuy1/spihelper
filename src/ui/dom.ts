import type { MenuItemData } from '@wikimedia/codex';

export type SectionOverlayType = 'selected' | 'preview';

function getSectionContainer(sectionId: number): JQuery | null {
  const sectionLink = $(`a[href$="section=${sectionId}"]`).first();
  if (sectionLink.length === 0) {
    return null;
  }
  const sectionContainer = sectionLink.parentsUntil(':has(hr)').last().nextUntil('hr');
  return sectionContainer.length > 0 ? sectionContainer : null;
}

function getSectionHeading(sectionId: number): HTMLElement | null {
  const sectionLink = $(`a[href$="section=${sectionId}"]`).first();
  if (sectionLink.length === 0) {
    return null;
  }
  const heading = sectionLink.closest('.mw-heading');
  return heading.length > 0 ? heading.get(0) ?? null : null;
}

export function scrollToSection(sectionId: number) {
  const heading = getSectionHeading(sectionId);
  if (heading) {
    heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function getSectionHighlightRoot(): HTMLElement | null {
  return document.querySelector('#mw-content-text .mw-parser-output');
}

function getSectionBounds(sectionId: number): { top: number; height: number } | null {
  const root = getSectionHighlightRoot();
  const heading = getSectionHeading(sectionId);
  if (!root || !heading) {
    return null;
  }
  const container = getSectionContainer(sectionId);
  const lastElement = container?.last().get(0) ?? heading;

  const rootRect = root.getBoundingClientRect();
  const headingRect = heading.getBoundingClientRect();
  const lastRect = lastElement.getBoundingClientRect();

  const top = Math.min(headingRect.top, lastRect.top) - rootRect.top + root.scrollTop;
  const bottom = Math.max(headingRect.bottom, lastRect.bottom) - rootRect.top + root.scrollTop;
  return { top, height: Math.max(1, bottom - top) };
}

function createSectionOverlay(): HTMLElement | null {
  const root = getSectionHighlightRoot();
  if (!root) {
    return null;
  }
  const overlay = document.createElement('div');
  overlay.style.display = 'none';
  overlay.className = 'spiHelper-section-overlay';
  root.appendChild(overlay);
  return overlay;
}

function renderSectionOverlay(overlay: HTMLElement | null, sectionId: number, type: 'selected' | 'preview') {
  const bounds = getSectionBounds(sectionId);
  if (!overlay || !bounds) {
    return;
  }
  overlay.style.top = `${Math.max(0, bounds.top)}px`;
  overlay.style.height = `${bounds.height + 8}px`;
  overlay.style.display = 'block';
  overlay.classList.toggle('spiHelper-section-overlay--preview', type === 'preview');
  overlay.classList.toggle('spiHelper-section-overlay--selected', type === 'selected');
}

/*
 * Scuffed way to get our section ID by the numeric ID of the select,
 * since there's no attribute with our actual MenuItemData's ID. 1-based index.
 * @param menuItem Element with .cdx-menu-item; maps to the MenuItemData
 * @returns Section ID
 */
export function getSectionIdByMenuItem(
  menuItem: Element,
  menuItems: MenuItemData[],
): number | null {
  const idResult = /v-\d+-(\d+)/.exec(menuItem.id);
  if (idResult === null || idResult.length < 2) return null;
  const optionIndex = Number(idResult[1]);

  const matchingMenuItem = menuItems[optionIndex - 1];
  if (!matchingMenuItem || matchingMenuItem.value === 'all') {
    return null;
  }
  return typeof matchingMenuItem.value === 'number' ? matchingMenuItem.value : null;
}

let sectionOverlayEl: HTMLElement | null = null;

function getOrCreateSectionOverlay(): HTMLElement | null {
  sectionOverlayEl ??= createSectionOverlay();
  return sectionOverlayEl;
}

export function showSectionOverlay(sectionId: number, type: SectionOverlayType): void {
  const overlay = getOrCreateSectionOverlay();
  renderSectionOverlay(overlay, sectionId, type);
}

export function hideSectionOverlay(): void {
  if (sectionOverlayEl) {
    sectionOverlayEl.style.display = 'none';
  }
}
