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
