import {
  ParsedArchiveNotice,
  type SockRow,
} from '../types/spi.ts';
import type { CaseState } from '../state.ts';
import { DefaultSockRow } from '../types/vue.ts';
import { spiHelperNormalizeUsername } from '../utils.ts';
import { spiHelperSettings } from '../options';
import { fetchTemplateArguments, parseTemplates } from '../template.ts';
import { context } from '../context.ts';
import type { MenuGroupData, MenuItemData } from '@wikimedia/codex';
import type { BlockEntry } from '../types/api.ts';

export function getSockEntries(opts: {
  text: string;
  fullSearch: boolean;
  state: CaseState;
}): [SockRow[], SockRow[], string[]] {
  const { text, fullSearch, state } = opts;
  const likelySocks: SockRow[] = fullSearch ? [generateSockRow(context.caseName, state)] : [];
  const possibleSocks: SockRow[] = [];
  const allUsernames: Set<string> = fullSearch ? new Set([context.caseName]) : new Set();

  if (fullSearch) {
    let $searchOrigin: JQuery<Element> | JQuery<Document> = $(document);
    if (state.selectedSection?.type === 'specific') {
      $searchOrigin = $(`a[href$="section=${state.selectedSection.section.id}"]`).parentsUntil(':has(hr)').last().nextUntil('hr');
    }
    const sockList = $searchOrigin.find('.cuEntry').find('a:first');

    for (const entryElement of sockList) {
      const username = spiHelperNormalizeUsername($(entryElement).text());
      if (allUsernames.has(username)) {
        continue;
      }
      likelySocks.push(generateSockRow(username, state));
      allUsernames.add(username);
    }
  }

  const isRelevantTemplate = (templateName: string) => {
    return (/sock ?list/.exec(templateName)) !== null || ['ip', 'vandal', 'user', 'ping'].some(t => templateName.includes(t));
  };
  const allTemplates = parseTemplates(text);
  for (const template of allTemplates) {
    if (isRelevantTemplate(template.name)) {
      const templateUsernames = fetchTemplateArguments(template);
      for (const templateUsername of templateUsernames) {
        const username = spiHelperNormalizeUsername(templateUsername);
        if (!allUsernames.has(username)) {
          possibleSocks.push(generateSockRow(username, state));
          allUsernames.add(username);
        }
      }
    }
  }

  return [likelySocks, possibleSocks, Array.from(allUsernames)];
}

function generateSockRow(username: string, state: CaseState): SockRow {
  if (mw.util.isIPAddress(username, true)) {
    if (spiHelperSettings.displayIPv6As64 && mw.util.isIPv6Address(username, false)) {
      return {
        ...getDefaultSockRow(state.archiveNotice),
        username: buildIPBlock(username),
      };
    }
    else {
      return { ...getDefaultSockRow(state.archiveNotice), username: username };
    }
  }
  else {
    return { ...getDefaultSockRow(state.archiveNotice), username: username };
  }
}

function buildIPBlock(fullIP: string): string {
  if (!mw.util.isIPv6Address(fullIP, false)) {
    return fullIP;
  }
  return fullIP.split(':').slice(0, 4).concat('0', '0', '0', '0').join(':') + '/64';
}

export function getDefaultSockRow(archiveNotice: ParsedArchiveNotice | null) {
  const newRow = { ...DefaultSockRow };
  if (archiveNotice) {
    if (archiveNotice.crosswiki) {
      newRow.lock = true;
    }
    if (archiveNotice.deny) {
      newRow.nem = true;
      newRow.ntp = true;
    }
  }
  return newRow;
}

/**
 * Updates block table based on block settings, tags, and defaultBlock
 */
export function updateSockRowSettings(opts: {
  row: SockRow;
  currentBlock?: BlockEntry;
  currentTags?: string;
  defaultBlock: boolean;
}): SockRow {
  const { row, currentBlock, currentTags, defaultBlock } = opts;
  if (currentBlock) {
    row.block = true;
    row.acb = currentBlock.acb;
    row.abao = currentBlock.abao;
    row.ntp = currentBlock.ntp;
    row.nem = currentBlock.nem;
    row.duration = currentBlock.duration;
  }
  else {
    row.block = defaultBlock;
    if (mw.util.isIPAddress(row.username, true)) {
      row.duration = '1 week';
    }
  }

  if (currentTags) {
    const templates = parseTemplates(currentTags);
    for (const template of templates) {
      if (['sockpuppeteer', 'sockmaster'].includes(template.name)) {
        const firstParam = template.params['1'] ?? template.positional[0];
        if (firstParam === 'banned') {
          row.tag = 'Mbanned';
        }
        else if (firstParam === 'blocked') {
          row.tag = template.params.checked?.toLowerCase() === 'yes'
            ? 'Mconfirmed'
            : 'Mblocked';
        }
        else {
          console.warn('Unrecognised master status', firstParam, 'for', row.username);
        }
      }
      else if (['sockpuppet', 'sock'].includes(template.name)) {
        const blockParam = template.params['2'] ?? template.positional[1];
        switch (blockParam) {
          case 'blocked':
            row.tag = 'Ssuspected';
            break;
          case 'proven':
            row.tag = 'Sproven';
            break;
          case 'confirmed':
          case 'nbconfirmed':
          case 'cuconfirmed':
            row.tag = 'Sconfirmed';
            break;
          default:
            console.warn('Unrecognised sock status', blockParam, 'for', row.username);
            break;
        }

        if (template.params.altmaster) {
          const altmasterStatus = template.params['altmaster-status'];
          switch (altmasterStatus) {
            case undefined:
              row.altmaster = 'none';
              break;
            case 'suspect':
            case 'suspected':
              row.altmaster = 'suspected';
              break;
            case 'proven':
              row.altmaster = 'proven';
              break;
            default:
              console.warn('Unrecognised altmaster status', altmasterStatus, 'for', row.username);
          }
        }
      }
    }
  }

  return row;
}

export const isMenuGroupData = (item: MenuItemData | MenuGroupData): item is MenuGroupData => 'items' in item;
