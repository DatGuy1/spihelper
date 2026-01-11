import type { ManagementFlag, ParsedArchiveNotice } from '../../../../types/spi.ts';

export function getManagementFlagsFromArchiveNotice(
  archiveNotice: ParsedArchiveNotice | null,
): Set<ManagementFlag> {
  const flags = new Set<ManagementFlag>();
  if (archiveNotice === null) {
    return flags;
  }

  if (archiveNotice.deny) {
    flags.add('deny');
  }
  if (archiveNotice.moot) {
    flags.add('moot');
  }
  if (archiveNotice.notalk) {
    flags.add('notalk');
  }
  if (archiveNotice.crosswiki) {
    flags.add('crosswiki');
  }
  return flags;
}
