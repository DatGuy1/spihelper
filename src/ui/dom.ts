import type { MenuItemData } from '@wikimedia/codex';

export type SectionOverlayType = 'selected' | 'preview';

/*
 * The section's [edit] link, which is what anchors every lookup below
 */
function getSectionLink(sectionId: number): JQuery | null {
  const sectionLink = $(`a[href$="section=${sectionId}"]`).first();
  return sectionLink.length > 0 ? sectionLink : null;
}

function getSectionContainerFor(sectionLink: JQuery): JQuery | null {
  const sectionContainer = sectionLink.parentsUntil(':has(hr)').last().nextUntil('hr');
  return sectionContainer.length > 0 ? sectionContainer : null;
}

function getSectionHeadingFor(sectionLink: JQuery): HTMLElement | null {
  const heading = sectionLink.closest('.mw-heading');
  return heading.length > 0 ? heading.get(0) ?? null : null;
}

function getSectionHeading(sectionId: number): HTMLElement | null {
  const sectionLink = getSectionLink(sectionId);
  return sectionLink ? getSectionHeadingFor(sectionLink) : null;
}

export function scrollToSection(sectionId: number) {
  const heading = getSectionHeading(sectionId);
  if (heading) {
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function getSectionHighlightRoot(): HTMLElement | null {
  return document.querySelector('#mw-content-text .mw-parser-output');
}

interface SectionBounds { top: number; height: number }

function getSectionBounds(sectionId: number, root: HTMLElement | null): SectionBounds | null {
  const sectionLink = getSectionLink(sectionId);
  const heading = sectionLink && getSectionHeadingFor(sectionLink);
  if (!root || !sectionLink || !heading) {
    return null;
  }
  const container = getSectionContainerFor(sectionLink);
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

function applySectionOverlay(
  overlay: HTMLElement, sectionId: number, bounds: SectionBounds, type: SectionOverlayType,
) {
  overlay.style.top = `${Math.max(0, bounds.top)}px`;
  overlay.style.height = `${bounds.height + 8}px`;
  overlay.style.display = 'block';
  overlay.dataset.sectionId = String(sectionId);
  overlay.classList.toggle('spiHelper-section-overlay--preview', type === 'preview');
  overlay.classList.toggle('spiHelper-section-overlay--selected', type === 'selected');
}

function renderSectionOverlay(
  overlay: HTMLElement | null, sectionId: number, type: SectionOverlayType,
) {
  const bounds = getSectionBounds(sectionId, getSectionHighlightRoot());
  if (!overlay || !bounds) {
    return;
  }
  applySectionOverlay(overlay, sectionId, bounds, type);
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

let previewOverlayEl: HTMLElement | null = null;
// One overlay element per currently-highlighted "selected" section, so several
// sections can be highlighted at once in multi-select mode.
const selectedOverlayEls = new Map<number, HTMLElement>();

function getOrCreatePreviewOverlay(): HTMLElement | null {
  previewOverlayEl ??= createSectionOverlay();
  return previewOverlayEl;
}

function getOrCreateSelectedOverlay(sectionId: number): HTMLElement | null {
  let overlay = selectedOverlayEls.get(sectionId);
  if (!overlay) {
    const created = createSectionOverlay();
    if (!created) {
      return null;
    }
    overlay = created;
    selectedOverlayEls.set(sectionId, overlay);
  }
  return overlay;
}

export function showSectionOverlay(sectionId: number, type: SectionOverlayType): void {
  const overlay = type === 'preview' ? getOrCreatePreviewOverlay() : getOrCreateSelectedOverlay(sectionId);
  renderSectionOverlay(overlay, sectionId, type);
}

/* Hides the transient hover-preview overlay only; does not affect "selected" highlights. */
export function hideSectionOverlay(): void {
  if (previewOverlayEl) {
    previewOverlayEl.style.display = 'none';
  }
}

/* Shows exactly these sections as "selected", removing highlights for any section not listed. */
export function setSelectedSectionOverlays(sectionIds: number[]): void {
  const idSet = new Set(sectionIds);
  for (const [id, overlay] of selectedOverlayEls) {
    if (!idSet.has(id)) {
      overlay.remove();
      selectedOverlayEls.delete(id);
    }
  }

  // Create, then measure, then write
  const overlays = new Map<number, HTMLElement>();
  for (const id of sectionIds) {
    const overlay = getOrCreateSelectedOverlay(id);
    if (overlay) {
      overlays.set(id, overlay);
    }
  }

  const root = getSectionHighlightRoot();
  const bounds = new Map<number, SectionBounds>();
  for (const id of overlays.keys()) {
    const sectionBounds = getSectionBounds(id, root);
    if (sectionBounds) {
      bounds.set(id, sectionBounds);
    }
  }

  for (const [id, overlay] of overlays) {
    const sectionBounds = bounds.get(id);
    if (sectionBounds) {
      applySectionOverlay(overlay, id, sectionBounds, 'selected');
    }
  }
}

export function clearSelectedSectionOverlays(): void {
  setSelectedSectionOverlays([]);
}

export const SECTION_BUTTON_LABEL = 'open in spiHelper';

/*
 * Inject "[open]" links into each section heading so users can click one to
 * open spihelper to that section. Returns a cleanup function that removes all
 * injected elements.
 */
export function addSectionButtons(
  sectionIds: number[],
  onClick: (sectionId: number) => void,
): () => void {
  const injected: HTMLElement[] = [];

  for (const id of sectionIds) {
    const heading = getSectionHeading(id);
    if (!heading) {
      continue;
    }

    // Check if we already have our brackets. If so, add it to the end of them.
    const editSection = heading.querySelector<HTMLElement>('.mw-editsection');
    if (editSection) {
      const closingBracket = editSection.querySelector<HTMLElement>('.mw-editsection-bracket:last-child');

      const divider = document.createElement('span');
      divider.className = 'mw-editsection-divider';
      divider.textContent = ' | ';

      const link = document.createElement('a');
      link.href = '#';
      link.className = 'spiHelper-section-open';
      link.textContent = SECTION_BUTTON_LABEL;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onClick(id);
      });

      if (closingBracket) {
        editSection.insertBefore(divider, closingBracket);
        editSection.insertBefore(link, closingBracket);
      }
      else {
        editSection.append(divider, link);
      }
      injected.push(divider, link);
    }
    // If not, add our new bracket section
    else {
      const wrapper = document.createElement('span');
      wrapper.className = 'mw-editsection-like spiHelper-section-open';

      const openBracket = document.createElement('span');
      openBracket.className = 'mw-editsection-bracket';
      openBracket.textContent = '[';

      const link = document.createElement('a');
      link.href = '#';
      link.textContent = SECTION_BUTTON_LABEL;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onClick(id);
      });

      const closeBracket = document.createElement('span');
      closeBracket.className = 'mw-editsection-bracket';
      closeBracket.textContent = ']';

      wrapper.append(openBracket, link, closeBracket);
      heading.appendChild(wrapper);
      injected.push(wrapper);
    }
  }

  return () => {
    for (const el of injected) {
      el.remove();
    }
  };
}
