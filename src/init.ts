import { spiHelperGenerateForm, updateForRole } from './ui/ui.ts';
import { spiHelperTopViewHTML } from './html.ts';
import { type CaseState, refreshSections } from './state.ts';
import {
  spiHelperAddArchiveNotice,
  spiHelperParseArchiveNotice,
} from './archivenotice.ts';
import { context } from './context.ts';
import { spiHelperGetPageText } from './api.ts';
import { spiHelperSettings } from './options.ts';
import {
  spiHelperArchiveNoticeRegex,
  spiHelperCaseClosedRegex,
  spiHelperCaseStatusRegex,
  spiHelperSectionRegex,
} from './constants/regex.ts';
import { spiHelperIsAdmin } from './role.ts';
import { messageDisplay } from './ui/messageDisplay.ts';
import { spiDisableCheckbox, spiHelperUpdateArchive, spiHelperUpdateMove } from './ui/utils.ts';
import { ParsedArchiveNotice } from './types/spi.ts';

/**
 * Initialization functions for spiHelper, displays the top-level menu
 */
export async function spiHelperInitTopLevel(state: CaseState) {
  // First, insert the template text
  messageDisplay.set(spiHelperTopViewHTML);
  await refreshSections(state);

  // Narrow search scope
  const $topView = $('#spiHelper_topViewDiv', document);
  updateForRole($topView);

  if (!state.archiveNotice) {
    // Load archivenotice params
    const archiveNoticeResult = await spiHelperParseArchiveNotice(context.pageName.replace(/\/Archive/, ''));
    if (archiveNoticeResult === null) {
      // No archive notice was found
      await spiHelperAddArchiveNotice($('#spiHelper_warning', $topView));
      // Initialize with default values after adding the notice
      state.archiveNotice = new ParsedArchiveNotice(context.caseName);
    }
    else {
      state.archiveNotice = archiveNoticeResult;
    }
  }

  // TODO: I don't like this entire section
  // Next, modify what's displayed
  // Set the block selection label based on whether the user is an admin
  $('#spiHelper_blockLabel', $topView).text(spiHelperIsAdmin() ? 'Block/tag socks' : 'Tag socks');

  // Wire up a couple of onclick handlers
  $('#spiHelper_Move', $topView).on('click', function () {
    spiHelperUpdateArchive();
  });
  $('#spiHelper_Archive', $topView).on('click', function () {
    spiHelperUpdateMove();
  });

  // Generate the section selector
  const $sectionSelect = $('#spiHelper_sectionSelect', $topView);
  $sectionSelect.on('change', () => {
    spiHelperSetCheckboxesBySection(state);
  });

  // Add the dates to the selector
  for (const section of state.sections) {
    $('<option>').val(section.id).text(section.name).appendTo($sectionSelect);
  }
  // All-sections selector...deliberately at the bottom, the default should be the first section
  $('<option>').val('all').text('All Sections').appendTo($sectionSelect);

  // Only show options suitable for the archive subpage when running on the archives
  if (!context.isArchive) {
    $('.spiHelper_notOnArchive', $topView).show();
  }
  // Set the checkboxes to their default states
  await spiHelperSetCheckboxesBySection(state);

  $('#spiHelper_GenerateForm', $topView).one('click', () => {
    console.log(state);
    spiHelperGenerateForm(state);
  });
  messageDisplay.show();
}

/**
 * Complicated function to decide what checkboxes to enable or disable
 * and which to check by default
 */
async function spiHelperSetCheckboxesBySection(state: CaseState) {
  // Displays the top-level SPI menu
  const $topView = $('#spiHelper_topViewDiv', document);
  // Get the value of the selection box
  const $sectionSelect = $('#spiHelper_sectionSelect', $topView);
  const selectedValue = $sectionSelect.val();
  if (!selectedValue) {
    console.error('Failed to find #spiHelper_sectionSelect element');
    return;
  }
  if (selectedValue !== 'all') {
    const selectedIndex = Number($sectionSelect.prop('selectedIndex'));
    const selectedSection = state.sections[selectedIndex];
    if (!selectedSection) {
      console.error('Failed to find section for selected index ' + selectedIndex);
      return;
    }
    state.selectedSection = selectedSection;
  }

  const $warningText = $('#spiHelper_warning', $topView);
  $warningText.hide();

  const $archiveBox = $('#spiHelper_Archive', $topView);
  const $closeBox = $('#spiHelper_Close', $topView);
  const $moveBox = $('#spiHelper_Move', $topView);

  // Enable optionally-disabled boxes
  $closeBox.prop('disabled', false);
  $archiveBox.prop('disabled', false);

  // archivenotice sanity check
  spiHelperGetPageText(context.pageName, false).then((pageText) => {
    const result = spiHelperArchiveNoticeRegex.exec(pageText);
    if (!result) {
      $warningText.append($('<b>').text('Can\'t find archivenotice template!'));
      $warningText.show();
    }
  });

  // all cases selection
  if (state.selectedSection === null) {
    // Hide inputs that aren't relevant in the case view
    $('.spiHelper_singleCaseOnly', $topView).hide();
    // Show inputs only visible in all-case mode
    $('.spiHelper_allCasesOnly', $topView).show();
    // Fix the move label
    $('#spiHelper_moveLabel', $topView).text('Move/merge full case (Clerk only)');
    // enable the move box
    $moveBox.prop('disabled', false);
  }
  else {
    const sectionText = await state.selectedSection.getText();
    if (!spiHelperSectionRegex.test(sectionText)) {
      // Nothing to do here.
      return;
    }

    // Unhide single-case options
    $('.spiHelper_singleCaseOnly', $topView).show();
    // Hide inputs only visible in all-case mode
    $('.spiHelper_allCasesOnly', $topView).hide();

    const result = spiHelperCaseStatusRegex.exec(sectionText);
    let caseStatus = '';
    if (result && result[1]) {
      caseStatus = result[1];
    }
    else if (!context.isArchive) {
      $warningText.append($('<b>').text(`Can't find case status in ${state.selectedSection.name}!`));
      $warningText.show();
    }

    // Disable the section move setting if you haven't opted into it
    if (!spiHelperSettings.iUnderstandSectionMoves) {
      spiDisableCheckbox($moveBox);
    }

    const isClosed = spiHelperCaseClosedRegex.test(caseStatus);
    if (isClosed) {
      $archiveBox.prop('disabled', true);
      if (spiHelperSettings.tickArchiveWhenCaseClosed) {
        $archiveBox.prop('checked', true);
      }
      else {
        $archiveBox.prop('checked', false);
      }
    }
    else {
      spiDisableCheckbox($archiveBox);
      const caseActionBtn = $('#spiHelper_CaseStatus', $topView) as JQuery<HTMLInputElement>;
      const closeActionBtn = $('#spiHelper_Close', $topView) as JQuery<HTMLInputElement>;
      caseActionBtn.on('change', function (event) {
        closeActionBtn.prop('disabled', event.target.checked);
      });
      closeActionBtn.on('change', function (event) {
        caseActionBtn.prop('disabled', event.target.checked);
      });
    }

    // Change the label on the rename button
    $('#spiHelper_moveLabel', $topView).html('Move case section (<span title="You probably want to move the full case, '
      + 'select All Sections instead of a specific date in the drop-down" '
      + 'class="rt-commentedText spihelper-hovertext"><b>READ ME FIRST</b></span>)');
  }
}
