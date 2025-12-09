import { type SelectOption } from '../types/spi.ts';
import type { CaseState } from '../state.ts';

/**
 * Given an HTML element, sets that element's value on all block options
 * For example, checking the 'block all' button will check all per-user 'block' elements
 *
 * @param {JQuery<HTMLElement>} source The HTML input element that we're matching all selections to
 * @param userCount Number of rows (users) we should set the options for
 */
export function spiHelperSetAllTableColumnOpts(source: JQuery<HTMLElement>, userCount: number) {
  for (let i = 1; i <= userCount; i++) {
    const $target = $('#' + source.attr('id') + i);
    if (source.attr('type') === 'checkbox') {
      // Don't try to set disabled checkboxes
      if (!$target.prop('disabled')) {
        $target.prop('checked', source.prop('checked'));
      }
    }
    else {
      const sourceVal = source.val();
      if (sourceVal) {
        $target.val(sourceVal);
      }
    }
  }
}

/**
 * Generate a select input, optionally with an onChange call
 *
 * @param $element JQuery element of the input
 * @param {SelectOption[]} options Array of options objects
 */
export function spiHelperGenerateSelect($element: JQuery, options: SelectOption[]) {
  // Add the dates to the selector
  for (const selectOption of options) {
    $('<option>')
      .val(selectOption.value)
      .prop('selected', selectOption.selected)
      .text(selectOption.label)
      .prop('disabled', selectOption.disabled)
      .appendTo($element);
  }
}

/**
 * Updates whether the 'archive' checkbox is enabled
 */
export function spiHelperUpdateArchive() {
  // Archive should only be an option if close is checked or disabled (disabled meaning that
  // the case is closed) and rename is not checked
  const $archiveCb = $('#spiHelper_Archive', document);
  const $closeCb = $('#spiHelper_Close', document);
  const $moveCb = $('#spiHelper_Move', document);

  const shouldDisable = (!$closeCb.prop('checked') && !$closeCb.prop('disabled')) || $moveCb.prop('checked');
  $archiveCb.prop('disabled', shouldDisable);

  if (shouldDisable) {
    $archiveCb.prop('checked', false);
  }
}

/**
 * Updates whether the 'move' checkbox is enabled
 */
export function spiHelperUpdateMove() {
  // Rename is mutually exclusive with archive
  const $archiveCb = $('#spiHelper_Archive', document);
  const $moveCb = $('#spiHelper_Move', document);

  $moveCb.prop('disabled', $archiveCb.prop('checked'));
  if ($moveCb.prop('disabled')) {
    $moveCb.prop('checked', false);
  }
}

/**
 * Disables and unchecks a checkbox
 */
export function spiDisableCheckbox($checkbox: JQuery<HTMLElement>) {
  $checkbox.prop('checked', false);
  $checkbox.prop('disabled', true);
}

export function getSockEntries(state: CaseState) {
  let $searchOrigin: JQuery<Element> | JQuery<Document> = $(document);
  if (state.selectedSection?.type === 'specific') {
    $searchOrigin = $(`a[href$="section=${state.selectedSection.section.id}"]`).parentsUntil(':has(hr)').last().nextUntil('hr');
  }
  return $searchOrigin.find('.cuEntry').find('a:first');
}

export function fetchValue(
  selector: string, $scope: JQuery<HTMLElement> | JQuery<Document> = $(document),
): string {
  const $element = $(selector, $scope);
  const value = $element.val();
  if (!value) {
    throw new Error(`Failed to find ${selector} element`);
  }
  return value.toString();
}
