import { afterEach, describe, expect, test } from 'bun:test';
import { computed, createApp, defineComponent, nextTick, ref } from 'vue';
import { CdxButton, CdxMultiselectLookup, CdxSelect, CdxToggleSwitch } from '@wikimedia/codex';
import { SectionActionComponent } from '../../../../../src/ui/views/top';
import { SectionEntry } from '../../../../../src/types';

// Mount the real SectionAction component tree
function mountHarness(initialMultiSelectIds: number[] = []) {
  const sections = [
    new SectionEntry(1, '09 July 2020'),
    new SectionEntry(2, '15 August 2020'),
    new SectionEntry(3, '22 September 2020'),
  ];
  let updateCount = 0;

  const Harness = defineComponent({
    components: { SectionAction: SectionActionComponent },
    setup() {
      const selectedSection = ref<number | 'all' | null>(null);
      const multiSelectMode = ref(true);
      const multiSelectIds = ref(initialMultiSelectIds);
      const selectedSections = computed(() =>
        sections.filter(s => multiSelectIds.value.includes(s.id)));

      function handleUpdateMultiSelectSections(ids: number[]) {
        updateCount++;
        // A real (non-looping) interaction only ever needs a small, bounded number of
        // reactive passes to settle; anything beyond that means a loop is back.
        if (updateCount > 20) {
          throw new Error(`Runaway update-multi-select-sections loop: called ${updateCount} times`);
        }
        multiSelectIds.value = ids;
      }

      return {
        sections,
        selectedSection,
        multiSelectMode,
        selectedSections,
        handleUpdateMultiSelectSections,
      };
    },
    template: `
      <section-action
        ref="sectionAction"
        :all-sections="sections"
        :selected-section="selectedSection"
        :multi-select-mode="multiSelectMode"
        :selected-sections="selectedSections"
        @update-section-selection="selectedSection = $event"
        @update:multiSelectMode="multiSelectMode = $event"
        @update-multi-select-sections="handleUpdateMultiSelectSections"
      />
    `,
  });

  const el = document.createElement('div');
  document.body.appendChild(el);
  const app = createApp(Harness);
  /* eslint-disable vue/component-definition-name-casing */
  app.component('cdx-select', CdxSelect);
  app.component('cdx-button', CdxButton);
  app.component('cdx-toggle-switch', CdxToggleSwitch);
  app.component('cdx-multiselect-lookup', CdxMultiselectLookup);
  /* eslint-enable vue/component-definition-name-casing */
  interface SectionActionExposed {
    multiSelectSelected: (string | number)[];
    multiSelectChips: { value: string | number; label?: string }[];
  }
  const vm = app.mount(el) as unknown as {
    selectedSections: SectionEntry[];
    $refs: { sectionAction: SectionActionExposed };
  };

  return {
    vm,
    app,
    el,
    getUpdateCount: () => updateCount,
  };
}

describe('SectionActionComponent multi-select selection', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('selecting a section via the multiselect-lookup settles without looping', async () => {
    const { vm, getUpdateCount } = mountHarness();

    vm.$refs.sectionAction.multiSelectSelected = [2];
    await nextTick();

    expect(vm.selectedSections.map(s => s.id)).toEqual([2]);
    expect(getUpdateCount()).toBeLessThanOrEqual(2);
  });

  test('adding a second section to the selection settles without looping', async () => {
    const { vm, getUpdateCount } = mountHarness([2]);

    vm.$refs.sectionAction.multiSelectSelected = [2, 3];
    await nextTick();

    expect(vm.selectedSections.map(s => s.id).sort()).toEqual([2, 3]);
    expect(getUpdateCount()).toBeLessThanOrEqual(2);
  });

  test('removing a chip from the selection settles without looping', async () => {
    const { vm, getUpdateCount } = mountHarness([2, 3]);

    vm.$refs.sectionAction.multiSelectChips = [{ value: 3, label: '22 September 2020' }];
    await nextTick();

    expect(vm.selectedSections.map(s => s.id)).toEqual([3]);
    expect(getUpdateCount()).toBeLessThanOrEqual(2);
  });

  test('re-emitting the same selection is a no-op (does not re-fire update-multi-select-sections)', async () => {
    const { vm, getUpdateCount } = mountHarness([2]);

    vm.$refs.sectionAction.multiSelectSelected = [2];
    await nextTick();

    expect(getUpdateCount()).toBe(0);
  });
});
