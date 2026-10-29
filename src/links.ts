import type { LinkTool } from './types';
import { spiHelperBuiltinLinkTools } from './constants';

export const customLinkToolPrefix = 'custom-';

const casePlaceholder = '{case}';

export function linkToolNeedsCase(tool: LinkTool): boolean {
  return tool.url.includes(casePlaceholder);
}

/**
 * The tool's URL with the case name filled in, or null when it's invalid or not HTTPS
 */
function buildBaseUrl(tool: LinkTool, caseName: string): URL | null {
  let url: URL;
  try {
    url = new URL(tool.url.replaceAll(casePlaceholder, encodeURIComponent(caseName)));
  }
  catch {
    return null;
  }
  return url.protocol === 'https:' ? url : null;
}

/**
 * Checks for problems that would make the tool unusable,
 * returning a string describing the problem or null
 */
export function linkToolProblem(tool: LinkTool): string | null {
  if (!tool.label.trim()) {
    return 'The tool is missing a label';
  }
  if (buildBaseUrl(tool, 'Example') === null) {
    return 'The URL must be a full https:// address';
  }
  if (!tool.userParam.trim()) {
    return 'Name the query parameter the usernames go in';
  }
  return null;
}

/**
 * The tools the link action shows a column for, in the user's order.
 * Invalid tools are excluded.
 */
export function getLinkTools(tools: LinkTool[]): LinkTool[] {
  return tools.filter(tool => tool.enabled && linkToolProblem(tool) === null);
}

const builtinsById = new Map(spiHelperBuiltinLinkTools.map(tool => [tool.id, tool]));

export function isBuiltinLinkTool(tool: LinkTool): boolean {
  return builtinsById.has(tool.id);
}

// The fields that make up a tool
const definitionFields = ['label', 'url', 'userParam', 'separator', 'wrapper', 'repeatParam'] as const;

/**
 * Whether the user's copy of a built-in no longer matches the version that ships
 */
export function differsFromBuiltin(tool: LinkTool): boolean {
  const builtin = builtinsById.get(tool.id);
  return builtin !== undefined && definitionFields.some(field => tool[field] !== builtin[field]);
}

/**
 * Flags the built-ins the user has edited, so reconcileLinkTools leaves them be. Run when
 * the options are saved, comparing against the built-ins the form was filled from.
 * An entry is only replaced where its flag changes, so an untouched list stays equal
 */
export function markEditedLinkTools(tools: LinkTool[]): LinkTool[] {
  return tools.map((tool) => {
    if (!isBuiltinLinkTool(tool)) {
      return tool;
    }
    const edited = differsFromBuiltin(tool);
    if (edited === Boolean(tool.edited)) {
      return tool;
    }
    if (edited) {
      return { ...tool, edited: true };
    }
    const unedited = { ...tool };
    delete unedited.edited;
    return unedited;
  });
}

/**
 * Brings a saved list up to date with the latest built-in configuration.
 * An unedited built-in takes the current definition and keeps the user's on/off choice;
 * One that no longer ships is dropped; one that's new is added at the end in its default state.
 * Edited built-ins and the user's own tools are kept as they are,
 * and the order is the user's throughout
 *
 * @param saved The list from saved settings, which isn't validated so may not be one
 */
export function reconcileLinkTools(saved: unknown): LinkTool[] {
  const tools = (Array.isArray(saved) ? saved as unknown[] : []).filter(
    (tool): tool is LinkTool => typeof (tool as Partial<LinkTool> | null)?.id === 'string',
  );
  const seen = new Set<string>();
  const result: LinkTool[] = [];
  for (const tool of tools) {
    // Rows track their checkboxes by id, so a second entry with one would share the first's
    if (seen.has(tool.id)) {
      continue;
    }
    seen.add(tool.id);

    const builtin = builtinsById.get(tool.id);
    if (builtin && !tool.edited) {
      result.push({ ...builtin, enabled: tool.enabled });
    }
    else if (builtin || tool.edited || tool.id.startsWith(customLinkToolPrefix)) {
      result.push(tool);
    }
  }
  for (const builtin of spiHelperBuiltinLinkTools) {
    if (!seen.has(builtin.id)) {
      result.push({ ...builtin });
    }
  }
  return result;
}

/**
 * Undoes the user's edits to the built-ins, keeping whether each is shown, where it sits,
 * and the user's own tools
 */
export function restoreBuiltinLinkTools(tools: LinkTool[]): LinkTool[] {
  return reconcileLinkTools(tools.map(tool => (
    isBuiltinLinkTool(tool) ? { ...tool, edited: false } : tool
  )));
}

/**
 * The tool's link for the given users, or null when there's no usable URL, which includes
 * a tool that needs the case name being used where there's no case
 */
export function buildLinkToolUrl(
  tool: LinkTool, caseName: string, usernames: string[],
): URL | null {
  if (linkToolNeedsCase(tool) && !caseName) {
    return null;
  }
  const url = buildBaseUrl(tool, caseName);
  if (!url) {
    return null;
  }

  const wrapped = usernames.map(username => tool.wrapper + username + tool.wrapper);
  if (tool.repeatParam) {
    for (const username of wrapped) {
      url.searchParams.append(tool.userParam, username);
    }
  }
  else {
    url.searchParams.set(tool.userParam, wrapped.join(tool.separator));
  }
  return url;
}
