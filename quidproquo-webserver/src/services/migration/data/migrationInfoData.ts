import { askKeyValueStoreQuery, askKeyValueStoreUpsert, AskResponse, kvsEqual, QpqPagedData } from 'quidproquo-core';
import { MigrationInfo } from '../domain/Migration';

const migrationStoreName = 'qpqMigrations';

export function* askGetMigrationBySrcPath(
  srcPath: string,
  nextPageKey?: string
): AskResponse<MigrationInfo | undefined> {
  const migrationInfo = yield* askKeyValueStoreQuery<MigrationInfo>(
    migrationStoreName,
    kvsEqual('srcPath', srcPath),
    undefined,
    nextPageKey
  );

  return migrationInfo.items[0];
}

export function* askUpsert(migrationInfo: MigrationInfo): AskResponse<void> {
  yield* askKeyValueStoreUpsert<MigrationInfo>(
    migrationStoreName,
    migrationInfo
  );
}