interface Template {
  name: string;
  params: Record<string, string>;
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

function parseTemplate(templateText: string): Template {
  const parts = templateText.split('|').map(p => p.trim());
  const name = parts.shift()?.toLowerCase() ?? 'unknown';

  const params: Record<string, string> = {};
  const positional: string[] = [];

  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq !== -1) {
      const key = part.slice(0, eq).trim().toLowerCase();
      params[key] = part.slice(eq + 1).trim();
    }
    else if (part) {
      positional.push(part);
    }
  }

  return { name, params, positional };
}

export function fetchTemplateArguments(template: Template): string[] {
  const result: string[] = [];
  for (const positional of template.positional) {
    result.push(positional);
  }
  for (const [key, value] of Object.entries(template.params)) {
    if (!Number.isNaN(Number(key))) {
      result.push(value);
    }
  }

  return result;
}
