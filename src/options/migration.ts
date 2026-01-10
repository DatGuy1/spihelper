import { spiHelperValidateDate } from './utils.ts';
import { spiHelperSettings } from './options.ts';

interface MigrationRule {
  oldPath: string;
  newPath: string[];
  type: 'boolean' | 'WatchOption' | 'expiry';
}

const migrationMap: MigrationRule[] = [
// Watch
  { oldPath: 'watchCase', newPath: ['watch', 'case'], type: 'WatchOption' },
  { oldPath: 'watchArchive', newPath: ['watch', 'archive'], type: 'WatchOption' },
  { oldPath: 'watchTaggedUser', newPath: ['watch', 'tagged'], type: 'WatchOption' },
  { oldPath: 'watchNewCats', newPath: ['watch', 'categories'], type: 'WatchOption' },
  { oldPath: 'watchBlockedUser', newPath: ['watch', 'blocked'], type: 'boolean' },

  // Expiry
  { oldPath: 'watchCaseExpiry', newPath: ['expiry', 'case'], type: 'expiry' },
  { oldPath: 'watchArchiveExpiry', newPath: ['expiry', 'archive'], type: 'expiry' },
  { oldPath: 'watchTaggedUserExpiry', newPath: ['expiry', 'tagged'], type: 'expiry' },
  { oldPath: 'watchNewCatsExpiry', newPath: ['expiry', 'categories'], type: 'expiry' },
  { oldPath: 'watchBlockedUserExpiry', newPath: ['expiry', 'blocked'], type: 'expiry' },

  // Direct booleans
  { oldPath: 'clerk', newPath: ['clerk'], type: 'boolean' },
  { oldPath: 'log', newPath: ['log', 'enabled'], type: 'boolean' },
  { oldPath: 'reversed_log', newPath: ['log', 'reversed'], type: 'boolean' },
  { oldPath: 'iUnderstandSectionMoves', newPath: ['iUnderstandSectionMoves'], type: 'boolean' },
  { oldPath: 'tickArchiveWhenCaseClosed', newPath: ['tickArchiveWhenCaseClosed'], type: 'boolean' },
  { oldPath: 'useCheckuserblockAccount', newPath: ['useCheckuserblockAccount'], type: 'boolean' },
  { oldPath: 'displayIPv6As64', newPath: ['displayIPv6As64'], type: 'boolean' },

  { oldPath: 'debugForceCheckuserState', newPath: ['debug', 'forceCheckuser'], type: 'boolean' },
  { oldPath: 'debugForceAdminState', newPath: ['debug', 'forceAdmin'], type: 'boolean' },
];

function setNestedValue<T extends object>(obj: T, path: string[], value: unknown) {
  let current: unknown = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]! as keyof typeof current;
    const next = (current as Record<string, unknown>)[key];

    if (next === null || typeof next !== 'object') {
      throw new Error(`Path segment "${path[i]}" is not an object`);
    }

    current = next;
  }
  const lastKey = path[path.length - 1] as keyof typeof current;
  (current as Record<string, unknown>)[lastKey] = value;
}

export async function migrateSettings(oldSettings: Record<string, unknown>) {
  const tasks = migrationMap.map(async ({ oldPath, newPath, type }) => {
    const value = oldSettings[oldPath];
    if (value === undefined) {
      return;
    }
    const isValid = await validateSetting(value, type);
    if (isValid) {
      setNestedValue(spiHelperSettings, newPath, value);
    }
  });

  await Promise.all(tasks);
}

async function validateSetting(value: unknown, type: 'boolean' | 'WatchOption' | 'expiry'): Promise<boolean> {
  switch (type) {
    case 'boolean':
      return typeof value === 'boolean';
    case 'WatchOption':
      return typeof value === 'string' && ['preferences', 'watch', 'nochange', 'unwatch'].includes(value);
    case 'expiry':
      return typeof value === 'string' && spiHelperValidateDate(value);
  }
}
