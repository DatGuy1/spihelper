import { afterEach, describe, expect, test } from 'bun:test';
import { SECTION_BUTTON_LABEL, addSectionButtons } from '../src/ui/dom.ts';

// Minimal jQuery-like wrapper for the selectors getSectionHeading uses:
// $(...).first(), .closest(), .length, .get(0)
function wrap(els: HTMLElement[]) {
  return {
    length: els.length,
    first() { return wrap(els.slice(0, 1)); },
    get(i: number) { return els[i]; },
    closest(sel: string) {
      const found = els[0]?.closest<HTMLElement>(sel) ?? null;
      return wrap(found ? [found] : []);
    },
  };
}
(globalThis as Record<string, unknown>).$ = (sel: string) =>
  wrap(Array.from(document.querySelectorAll<HTMLElement>(sel)));

afterEach(() => {
  document.body.innerHTML = '';
});

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
