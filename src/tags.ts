import { spiHelperNormalizeUsername } from './utils.ts';
import { VueMessage } from './ui/messages.ts';
import { parseTemplates } from './template.ts';

export type SockpuppetTagStatus = 'blocked' | 'proven' | 'confirmed';
export type SockmasterTagStatus = 'blocked' | 'confirmed' | 'banned';
export type AltmasterTagStatus = 'suspected' | 'proven';
export type Tag = SockmasterTag | SockpuppetTag;

export class SockpuppetTag {
  master: string;
  status: SockpuppetTagStatus;
  locked: boolean;
  evidence: string;
  altmaster: string;
  /**
   * Defaults to suspected but only meaningful when altmaster is also truthy
   */
  altmasterStatus: AltmasterTagStatus;

  constructor(opts: {
    master: string;
    status: SockpuppetTagStatus;
    locked?: boolean;
    evidence?: string;
    altmaster?: string;
    altmasterStatus?: AltmasterTagStatus;
  }) {
    this.master = spiHelperNormalizeUsername(opts.master);
    this.status = opts.status;
    this.locked = opts.locked ?? false;
    this.evidence = opts.evidence ?? '';
    this.altmaster = spiHelperNormalizeUsername(opts.altmaster ?? '');
    this.altmasterStatus = opts.altmasterStatus ?? 'suspected';
  }

  generateWikitext(blocked?: boolean): string {
    let tag = '{{sockpuppet';
    tag += `\n| 1 = ${this.master}`;
    tag += `\n| 2 = ${this.status}`;
    if (this.locked) {
      tag += '\n| locked = yes';
    }
    // Explicit comparison to not match undefined
    if (blocked === false) {
      tag += '\n| notblocked = yes';
    }
    if (this.evidence) {
      tag += `\n| evidence = ${this.evidence}`;
    }
    if (this.altmaster) {
      tag += `\n| altmaster = ${this.altmaster}`;
      tag += `\n| altmaster-status = ${this.altmasterStatus}`;
    }
    tag += '\n}}';
    return tag;
  }

  clone(): SockpuppetTag {
    // Intentionally don't clone this.locked
    return new SockpuppetTag({
      master: this.master,
      status: this.status,
      evidence: this.evidence,
      altmaster: this.altmaster,
      altmasterStatus: this.altmasterStatus,
    });
  };

  equals(other: Tag): boolean {
    if (!(other instanceof SockpuppetTag)) return false;
    return this.master === other.master
      && this.status === other.status
      && this.locked === other.locked
      && this.evidence === other.evidence
      && this.altmaster === other.altmaster
      // Without an altmaster the status writes nothing,
      // so a stale value shouldn't count as a being unequal
      && (!this.altmaster || this.altmasterStatus === other.altmasterStatus);
  }
}

export class SockmasterTag {
  status: SockmasterTagStatus;
  checked: boolean;
  locked: boolean;
  ltapage: string;
  spipage: string;
  evidence: string;

  constructor(opts: {
    status: SockmasterTagStatus;
    checked?: boolean;
    locked?: boolean;
    ltapage?: string;
    spipage?: string;
    evidence?: string;
  }) {
    this.status = opts.status;
    this.checked = opts.checked ?? false;
    this.locked = opts.locked ?? false;
    this.ltapage = opts.ltapage ?? '';
    this.spipage = opts.spipage ?? '';
    this.evidence = opts.evidence ?? '';
  }

  generateWikitext(): string {
    let tag = '{{sockpuppeteer';

    // The template is very weird. 'Confirmed' is a sort of fake option
    const outputStatus = this.status === 'banned' ? 'banned' : 'blocked';
    // 'Confirmed' or 'banned' neccesitate use of the CU tool, so mark as checked
    // Deliberately ignores the old this.checked since we're presumably intentionally overriding it
    const isChecked = this.status !== 'blocked';

    tag += `\n| 1 = ${outputStatus}`;
    if (isChecked) {
      tag += '\n| checked = yes';
    }
    if (this.locked) {
      tag += `\n| locked = yes`;
    }
    if (this.ltapage) {
      tag += `\n| ltapage = ${this.ltapage}`;
    }
    if (this.spipage) {
      tag += `\n| spipage = ${this.spipage}`;
    }
    if (this.evidence) {
      tag += `\n| evidence = ${this.evidence}`;
    }
    tag += '\n}}';
    return tag;
  }

  clone(): SockmasterTag {
    // Intentionally don't clone this.locked
    return new SockmasterTag({
      status: this.status,
      checked: this.checked,
      ltapage: this.ltapage,
      spipage: this.spipage,
      evidence: this.evidence,
    });
  }

  equals(other: Tag): boolean {
    if (!(other instanceof SockmasterTag)) return false;
    return this.status === other.status
      && this.checked === other.checked
      && this.locked === other.locked
      && this.ltapage === other.ltapage
      && this.spipage === other.spipage
      && this.evidence === other.evidence;
  }
}

/**
 * @param userPage Wikitext of the user page to read tags from
 * @param username Whose page it is, used only to identify the page in warnings
 */
export function parseUserTags(userPage: string, username?: string): Tag[] {
  const on = username ? ` on ${username}` : '';
  const tags: Tag[] = [];
  const templates = parseTemplates(userPage);
  for (const template of templates) {
    if (['sockpuppeteer', 'sockmaster'].includes(template.name)) {
      const firstParam = (template.params['1'] ?? template.positional[0])?.toString();
      const paramConfirmed = firstParam === 'cu' || (firstParam?.includes('confirmed') ?? false);
      const sockChecked = template.params.checked === true || paramConfirmed;

      let tagStatus: SockmasterTagStatus | undefined;
      if (paramConfirmed) {
        tagStatus = 'confirmed';
      }
      else if (firstParam === 'banned') {
        tagStatus = 'banned';
      }
      else if (firstParam?.includes('blocked')) {
        tagStatus = sockChecked ? 'confirmed' : 'blocked';
      }
      else {
        console.warn('Unrecognised master status', firstParam);
        // A tag we can't read isn't shown in the table and is overwritten by retagging,
        // so warn rather than let it silently look like the user is untagged
        new VueMessage({
          type: 'warning',
          content: `Ignoring {{${template.name}}} tag${on} with unrecognised status `
            + `"${firstParam ?? ''}". Tagging will overwrite it`,
        }).showOnce();
        continue;
      }

      const newTag = new SockmasterTag({ status: tagStatus, checked: sockChecked });
      // Only set these parameters if they exist to avoid adding too many needless parameters
      if (template.params.locked === true) {
        newTag.locked = true;
      }
      if (template.params.ltapage) {
        newTag.ltapage = template.params.ltapage as string;
      }
      if (template.params.spipage) {
        newTag.spipage = template.params.spipage as string;
      }
      if (template.params.evidence) {
        newTag.evidence = template.params.evidence as string;
      }
      tags.push(newTag);
    }
    else if (['sockpuppet', 'sock'].includes(template.name)) {
      const masterParam = template.params['1'] ?? template.positional[0];
      if (!masterParam) {
        console.warn('Master parameter not found');
        continue;
      }
      const statusParam = template.params['2'] ?? template.positional[1];
      let tagStatus: SockpuppetTagStatus | undefined;
      switch (statusParam) {
        case 'blocked':
          tagStatus = 'blocked';
          break;
        case 'proven':
          tagStatus = 'proven';
          break;
        case 'confirmed':
        case 'nbconfirmed':
        case 'cuconfirmed':
          tagStatus = 'confirmed';
          break;
        default:
          console.warn('Unrecognised sock status', statusParam);
          new VueMessage({
            type: 'warning',
            content: `Ignoring {{${template.name}}} tag${on} with unrecognised status `
              + `"${statusParam?.toString() ?? ''}". Tagging will overwrite it`,
          }).showOnce();
          continue;
      }

      const newTag = new SockpuppetTag({
        master: masterParam as string,
        status: tagStatus,
      });
      const altmaster = template.params.altmaster;
      if (altmaster) {
        const altmasterStatusParam = template.params['altmaster-status'];
        let altmasterStatus: AltmasterTagStatus | undefined;
        switch (altmasterStatusParam) {
          case 'suspect':
          case 'suspected':
            altmasterStatus = 'suspected';
            break;
          case 'proven':
            altmasterStatus = 'proven';
            break;
          default:
            console.warn('Unrecognised altmaster status', altmasterStatusParam);
            // Unlike the cases above the tag itself is kept, just without its altmaster
            new VueMessage({
              type: 'warning',
              content: `Dropping altmaster "${altmaster.toString()}"${on}: unrecognised `
                + `altmaster-status "${altmasterStatusParam?.toString() ?? ''}"`,
            }).showOnce();
            break;
        }

        if (altmasterStatus) {
          newTag.altmaster = altmaster as string;
          newTag.altmasterStatus = altmasterStatus;
        }
      }

      if (template.params.evidence) {
        newTag.evidence = template.params.evidence as string;
      }
      if (template.params.locked) {
        newTag.locked = true;
      }
      tags.push(newTag);
    }
  }
  return tags;
}

export function isSockpuppetTag(tag: Tag): tag is SockpuppetTag {
  return tag instanceof SockpuppetTag;
}

export function isSockmasterTag(tag: Tag): tag is SockmasterTag {
  return tag instanceof SockmasterTag;
}
