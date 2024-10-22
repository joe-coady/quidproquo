import {
  askFileReadTextContents,
  askKeyValueStoreQuery,
  askKeyValueStoreUpsert,
  AskResponse,
  kvsAnd,
  kvsBetween,
  kvsEqual,
  QpqPagedData,
  QpqRuntimeType,
  StoryResult,
} from 'quidproquo-core';

const logStorageDriveName = 'qpq-logs';

export function* askGetByCorrelation(correlation: string): AskResponse<StoryResult<any>> {
  const logJson = yield* askFileReadTextContents(logStorageDriveName, `${correlation}.json`);

  return JSON.parse(logJson);
}
