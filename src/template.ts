interface Template {
  name: string;
  params: Record<string, string | number | boolean>;
  positional: string[];
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
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    const next = text.charAt(i + 1); // returns '' if out of bounds
    if ((ch === '[' && next === '[') || (ch === '{' && next === '{')) {
      depth++;
      current += ch + next;
      i++; // skip the second bracket/brace
    }
    else if ((ch === ']' && next === ']') || (ch === '}' && next === '}')) {
      depth--;
      current += ch + next;
      i++;
    }
    else if (ch === '|' && depth === 0) {
      // Real argument separator, end the accumulated segment and start fresh
      parts.push(current);
      current = '';
    }
    else {
      current += ch;
    }
  }
  parts.push(current); // commit the final segment
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

function convertParamToBoolean(value: string): boolean | null {
  // From Module:Yesno
  if (['y', 'yes', 'true', 'on'].includes(value.toLowerCase())) {
    return true;
  }
  if (['n', 'no', 'false', 'off'].includes(value.toLowerCase())) {
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
