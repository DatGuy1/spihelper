import { afterEach, beforeAll, describe, expect, spyOn, test } from 'bun:test';
import {
  SECTION_BUTTON_LABEL,
  addSectionButtons,
  hideSectionOverlay,
  scrollToSection,
  showSectionOverlay,
} from '../src/ui/dom.ts';

// Minimal jQuery-like wrapper for the selectors dom.ts uses:
// $(...).first(), .closest(), .length, .get(0), .parentsUntil(), .last(), .nextUntil()
function wrap(els: HTMLElement[]) {
  return {
    length: els.length,
    first() { return wrap(els.slice(0, 1)); },
    last() { return wrap(els.slice(-1)); },
    get(i: number) { return els[i]; },
    closest(sel: string) {
      const found = els[0]?.closest<HTMLElement>(sel) ?? null;
      return wrap(found ? [found] : []);
    },
    parentsUntil(sel: string) {
      const found: HTMLElement[] = [];
      let current = els[0]?.parentElement ?? null;
      while (current && !current.matches(sel)) {
        found.push(current);
        current = current.parentElement;
      }
      return wrap(found);
    },
    nextUntil(sel: string) {
      const found: HTMLElement[] = [];
      let current = els[0]?.nextElementSibling as HTMLElement | null;
      while (current && !current.matches(sel)) {
        found.push(current);
        current = current.nextElementSibling as HTMLElement | null;
      }
      return wrap(found);
    },
  };
}
(globalThis as Record<string, unknown>).$ = (sel: string) =>
  wrap(Array.from(document.querySelectorAll<HTMLElement>(sel)));

function stubRect(el: HTMLElement, partial: Partial<DOMRect>) {
  el.getBoundingClientRect = () => ({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
    toJSON() { return this; },
    ...partial,
  }) as DOMRect;
}

function makeHeading(sectionId: number, withEditSection = true): HTMLElement {
  const heading = document.createElement('div');
  heading.className = 'mw-heading';

  const editLink = document.createElement('a');
  editLink.href = `?action=edit&section=${sectionId}`;

  if (withEditSection) {
    const editSection = document.createElement('span');
    editSection.className = 'mw-editsection';

    const open = document.createElement('span');
    open.className = 'mw-editsection-bracket';
    open.textContent = '[';

    editLink.textContent = 'edit source';

    const close = document.createElement('span');
    close.className = 'mw-editsection-bracket';
    close.textContent = ']';

    editSection.append(open, editLink, close);
    heading.appendChild(editSection);
  }
  else {
    heading.appendChild(editLink);
  }

  document.body.appendChild(heading);
  return heading;
}

function noop() { /* intentional no-op */ }

describe('addSectionButtons', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('editsection path (heading has .mw-editsection)', () => {
    test('injects divider and link before the closing bracket', () => {
      const heading = makeHeading(1);
      addSectionButtons([1], noop);

      const editSection = heading.querySelector('.mw-editsection');
      const last = editSection?.lastElementChild;
      const link = last?.previousElementSibling;
      const divider = link?.previousElementSibling;

      expect(last?.textContent).toBe(']');
      expect(link?.tagName).toBe('A');
      expect(link?.className).toBe('spiHelper-section-open');
      expect(link?.textContent).toBe(SECTION_BUTTON_LABEL);
      expect(divider?.className).toBe('mw-editsection-divider');
    });

    test('link fires onClick with the correct section id', () => {
      makeHeading(2);
      let clicked = -1;
      addSectionButtons([2], (id) => {
        clicked = id;
      });
      document.querySelector<HTMLElement>('a.spiHelper-section-open')?.click();
      expect(clicked).toBe(2);
    });
  });

  describe('fallback path (no .mw-editsection)', () => {
    test('appends an mw-editsection-like wrapper to the heading', () => {
      const heading = makeHeading(3, false);
      addSectionButtons([3], noop);

      const wrapper = heading.querySelector('.mw-editsection-like.spiHelper-section-open');
      expect(wrapper).not.toBeNull();
    });

    test('wrapper contains opening bracket, link text, and closing bracket', () => {
      const heading = makeHeading(3, false);
      addSectionButtons([3], noop);

      const wrapper = heading.querySelector('.mw-editsection-like');
      const brackets = wrapper?.querySelectorAll('.mw-editsection-bracket');
      expect(brackets?.[0]?.textContent).toBe('[');
      expect(brackets?.[1]?.textContent).toBe(']');
      expect(wrapper?.querySelector('a')?.textContent).toBe(SECTION_BUTTON_LABEL);
    });

    test('link fires onClick with the correct section id', () => {
      makeHeading(4, false);
      let clicked = -1;
      addSectionButtons([4], (id) => {
        clicked = id;
      });
      document.querySelector<HTMLElement>('.mw-editsection-like a')?.click();
      expect(clicked).toBe(4);
    });
  });

  describe('cleanup', () => {
    test('removes injected elements from editsection path', () => {
      const heading = makeHeading(5);
      const cleanup = addSectionButtons([5], noop);

      expect(heading.querySelector('.spiHelper-section-open')).not.toBeNull();
      cleanup();
      expect(heading.querySelector('.spiHelper-section-open')).toBeNull();
      expect(heading.querySelector('.mw-editsection-divider')).toBeNull();
    });

    test('removes injected wrapper from fallback path', () => {
      const heading = makeHeading(6, false);
      const cleanup = addSectionButtons([6], noop);

      expect(heading.querySelector('.mw-editsection-like')).not.toBeNull();
      cleanup();
      expect(heading.querySelector('.mw-editsection-like')).toBeNull();
    });
  });

  test('skips unknown section IDs without throwing', () => {
    expect(() => addSectionButtons([999], noop)).not.toThrow();
    expect(document.querySelectorAll('.spiHelper-section-open').length).toBe(0);
  });

  test('injects into multiple sections independently', () => {
    makeHeading(7);
    makeHeading(8, false);
    addSectionButtons([7, 8], noop);

    expect(document.querySelectorAll('.spiHelper-section-open').length).toBe(2);
  });
});

// Build the main page content
function makeParserOutputRoot(): HTMLElement {
  const contentText = document.createElement('div');
  contentText.id = 'mw-content-text';
  const parserOutput = document.createElement('div');
  parserOutput.className = 'mw-parser-output';
  contentText.appendChild(parserOutput);
  document.body.appendChild(contentText);
  return parserOutput;
}

function addOverlaySection(
  root: HTMLElement,
  sectionId: number,
  contentCount: number,
): { heading: HTMLElement; contents: HTMLElement[] } {
  const heading = document.createElement('div');
  heading.className = 'mw-heading';
  const link = document.createElement('a');
  link.href = `?action=edit&section=${sectionId}`;
  heading.appendChild(link);
  root.appendChild(heading);

  const contents: HTMLElement[] = [];
  for (let i = 0; i < contentCount; i++) {
    const p = document.createElement('p');
    root.appendChild(p);
    contents.push(p);
  }

  root.appendChild(document.createElement('hr'));
  return { heading, contents };
}

// Built in beforeAll (not at module scope) so it's created after addSectionButtons's
// afterEach hooks above have finished wiping document.body between its own tests
let overlayRoot: HTMLElement;
let overlaySections: Record<1 | 2 | 4, { heading: HTMLElement; contents: HTMLElement[] }>;

describe('section overlay', () => {
  beforeAll(() => {
    overlayRoot = makeParserOutputRoot();
    overlaySections = {
      1: addOverlaySection(overlayRoot, 1, 2),
      2: addOverlaySection(overlayRoot, 2, 1),
      4: addOverlaySection(overlayRoot, 4, 1),
    };
  });

  test('showSectionOverlay creates the overlay under the parser output root, visible with the selected class', () => {
    showSectionOverlay(2, 'selected');

    const overlay = overlayRoot.querySelector<HTMLElement>('.spiHelper-section-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay?.style.display).toBe('block');
    expect(overlay?.classList.contains('spiHelper-section-overlay--selected')).toBe(true);
    expect(overlay?.classList.contains('spiHelper-section-overlay--preview')).toBe(false);
  });

  test('showSectionOverlay with type preview sets the preview class instead of selected', () => {
    showSectionOverlay(2, 'preview');

    const overlay = overlayRoot.querySelector<HTMLElement>('.spiHelper-section-overlay');
    expect(overlay?.classList.contains('spiHelper-section-overlay--preview')).toBe(true);
    expect(overlay?.classList.contains('spiHelper-section-overlay--selected')).toBe(false);
  });

  test('reuses a single overlay element across repeated calls', () => {
    showSectionOverlay(2, 'selected');
    showSectionOverlay(1, 'preview');

    expect(overlayRoot.querySelectorAll('.spiHelper-section-overlay').length).toBe(1);
  });

  test('hideSectionOverlay sets display:none without removing the element', () => {
    showSectionOverlay(2, 'selected');
    hideSectionOverlay();

    const overlay = overlayRoot.querySelector<HTMLElement>('.spiHelper-section-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay?.style.display).toBe('none');
  });

  test('showSectionOverlay for an unknown section id leaves the existing overlay untouched', () => {
    showSectionOverlay(2, 'selected');
    showSectionOverlay(999, 'preview');

    const overlay = overlayRoot.querySelector<HTMLElement>('.spiHelper-section-overlay');
    expect(overlay?.classList.contains('spiHelper-section-overlay--selected')).toBe(true);
    expect(overlay?.classList.contains('spiHelper-section-overlay--preview')).toBe(false);
  });

  test('positions the overlay from the heading top and the last content element bottom', () => {
    const { heading, contents } = overlaySections[1];
    const lastContent = contents[1];
    if (!lastContent) throw new Error('fixture is missing its second content element');
    stubRect(heading, { top: 100, bottom: 130 });
    stubRect(lastContent, { top: 140, bottom: 200 });

    showSectionOverlay(1, 'selected');

    const overlay = overlayRoot.querySelector<HTMLElement>('.spiHelper-section-overlay');
    expect(overlay?.style.top).toBe('100px');
    expect(overlay?.style.height).toBe('108px');
  });
});

describe('scrollToSection', () => {
  test('scrolls the section heading into view when it exists', () => {
    const { heading } = overlaySections[4];
    const spy = spyOn(heading, 'scrollIntoView');

    scrollToSection(4);

    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  test('does nothing for an unknown section id', () => {
    expect(() => {
      scrollToSection(999);
    }).not.toThrow();
  });
});
