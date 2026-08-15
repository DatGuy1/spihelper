interface Template {
  name: string;
  params: Record<string, string | number | boolean>;
  positional: string[];
}

export interface TemplateSpan {
  text: string;
  start: number;
  end: number;
}

/**
 * Find the full wikitext span of every transclusion of `templateName` in `text`.
 * Counts braces to prevent nesting issues.
 *
 * @param templateName Template name without braces, e.g. 'sock list'
 * @param text Text to search in
 */
export function findTemplateSpans(templateName: string, text: string): TemplateSpan[] {
  const namePattern = templateName
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/[\s_]+/g, '[\\s_]+');
  const spans: TemplateSpan[] = [];
  for (const match of text.matchAll(new RegExp(`\\{\\{\\s*${namePattern}\\s*(?=[|}])`, 'gi'))) {
    // A nested match inside a span already found is part of that template, not its own
    if (spans.some(span => match.index < span.end)) {
      continue;
    }
    let depth = 0;
    for (let i = match.index; i < text.length - 1; i++) {
      if (text.startsWith('{{', i)) {
        depth++;
        i++;
      }
      else if (text.startsWith('}}', i)) {
        depth--;
        i++;
        if (depth === 0) {
          spans.push({ text: text.slice(match.index, i + 1), start: match.index, end: i + 1 });
          break;
        }
      }
    }
  }
  return spans;
}

export function parseTemplates(wikitext: string): Template[] {
  const templates: Template[] = [];
  // Rudimentary matching
  const matches = wikitext.trim().matchAll(/\{\{([\s\S]+?)}}/g);
  for (const match of matches) {
    if (!match[1]) {
      continue;
    }
    templates.push(parseTemplate(match[1]));
  }

  return templates;
}

/**
 * Splits a template's inner text on '|' while ignoring pipes inside [[ ]] and {{ }}.
 * A naive split('|') would break on pipe characters inside the template [[User|U]],
 * the link display text would be misread as an argument separator.
 * `depth` tracks how many levels of [[ or {{ nesting we're currently inside;
 * only a pipe at depth 0 is a real argument boundary.
 */
function splitTemplateParts(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let segmentStart = 0;
  for (let i = 0; i < text.length; i++) {
    if (text.startsWith('[[', i) || text.startsWith('{{', i)) {
      depth++;
      i++; // skip the second bracket/brace
    }
    else if (text.startsWith(']]', i) || text.startsWith('}}', i)) {
      depth--;
      i++;
    }
    else if (text[i] === '|' && depth === 0) {
      // Real argument separator, so the segment ends here
      parts.push(text.slice(segmentStart, i));
      segmentStart = i + 1;
    }
  }
  parts.push(text.slice(segmentStart)); // commit the final segment
  return parts;
}

export function parseTemplate(templateText: string): Template {
  const parts = splitTemplateParts(templateText).map(p => p.trim());
  const name = parts.shift()?.toLowerCase() ?? 'unknown';

  const params: Record<string, string | number | boolean> = {};
  const positional: string[] = [];

  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq !== -1) {
      const key = part.slice(0, eq).trim().toLowerCase();
      const value = part.slice(eq + 1).trim();
      if (value === '') {
        params[key] = value;
        continue;
      }
      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) {
        params[key] = numberValue;
        continue;
      }
      const boolResult = convertParamToBoolean(value);
      if (boolResult === null) {
        params[key] = value;
        continue;
      }
      params[key] = boolResult;
    }
    else if (part) {
      positional.push(part);
    }
  }

  return { name, params, positional };
}

// From Module:Yesno
const TRUTHY_PARAM_VALUES = new Set(['y', 'yes', 'true', 'on']);
const FALSY_PARAM_VALUES = new Set(['n', 'no', 'false', 'off']);

function convertParamToBoolean(value: string): boolean | null {
  const normalised = value.toLowerCase();
  if (TRUTHY_PARAM_VALUES.has(normalised)) {
    return true;
  }
  if (FALSY_PARAM_VALUES.has(normalised)) {
    return false;
  }
  return null;
}

export function fetchTemplateArguments(template: Template): string[] {
  const result: string[] = [];
  for (const positional of template.positional) {
    result.push(positional);
  }
  for (const [key, value] of Object.entries(template.params)) {
    if (!Number.isNaN(Number(key))) {
      result.push(value.toString());
    }
  }

  return result;
}
