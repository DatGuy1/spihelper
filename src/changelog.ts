import { spiHelperGetEnwikiAPI } from './api.ts';
import type { RevisionsResponse } from './types/api.ts';
import type { ApiQueryRevisionsParams } from 'types-mediawiki-api';

export interface ChangelogEntry {
  date: string;
  changes: string[];
}

async function getChangelog(): Promise<Record<string, ChangelogEntry>> {
  const api = spiHelperGetEnwikiAPI();

  const request: ApiQueryRevisionsParams = {
    action: 'query',
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    pageids: 82598459, // 'User:DatGuy/spihelper/changelog.json',
    formatversion: '2',
  };
  try {
    const response = await api.get(request) as RevisionsResponse<'content'>;
    const content = response.query.pages[0]?.revisions?.[0]?.slots.main.content;
    if (content) {
      return JSON.parse(content) as Record<string, ChangelogEntry>;
    }
  }
  catch (error) {
    console.error('getChangelog fetch error:', error);
  }

  return {};
}

export async function getUnseenChanges(lastSeenVersion: string) {
  const changelog = await getChangelog();
  return Object.entries(changelog)
    .filter(([version]) => semverGt(version, lastSeenVersion))
    .sort(([a], [b]) => semverGt(a, b) ? -1 : 1); // newest first
}

function semverGt(versionA: string, versionB: string): boolean {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((partsA[i] ?? 0) > (partsB[i] ?? 0)) return true;
    if ((partsA[i] ?? 0) < (partsB[i] ?? 0)) return false;
  }
  return false;
}
