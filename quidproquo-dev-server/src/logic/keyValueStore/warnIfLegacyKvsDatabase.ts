import * as fs from 'fs';
import * as path from 'path';

// The KVS switched from a single sqlite file to per-store JSON files. Old sqlite
// data is throwaway local dev state - there is no migration tool - so this just
// points the dev at the leftover file so they know it is safe to delete.
export const warnIfLegacyKvsDatabase = (runtimePath: string): void => {
  const legacyDbPath = path.join(runtimePath, 'kvs', 'database.db');

  if (fs.existsSync(legacyDbPath)) {
    console.warn(
      `[Qpq Dev Server] Found legacy sqlite KVS data at '${legacyDbPath}'. The dev server now stores KVS data as JSON files under '${path.join(runtimePath, 'kvs')}' and no longer reads this file - your old local data was not carried over and this file can be deleted.`,
    );
  }
};
