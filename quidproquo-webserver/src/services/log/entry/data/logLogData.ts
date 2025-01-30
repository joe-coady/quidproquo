import {
  askKeyValueStoreQuery,
  askKeyValueStoreQuerySingle,
  askKeyValueStoreUpsert,
  AskResponse,
  ErrorTypeEnum,
  kvsAnd,
  kvsBetween,
  kvsEqual,
  QpqPagedData,
} from 'quidproquo-core';

import { LogLog } from '../domain';

const storeName = `${'qpq-logs'}-list`;

export function* askUpsert(logLog: LogLog): AskResponse<void> {
  yield* askKeyValueStoreUpsert(storeName, logLog);
}

export function* askListLogs(
  errorType: ErrorTypeEnum,
  startDateTime: string,
  endDateTime: string,
  nextPageKey?: string,
): AskResponse<QpqPagedData<LogLog>> {
  const logs = yield* askKeyValueStoreQuery<LogLog>(
    storeName,
    kvsAnd([kvsEqual('type', errorType), kvsBetween('timestamp', startDateTime, endDateTime)]),
    {
      nextPageKey,
    },
  );

  return logs;
}

export function* askGetLogLog(errorType: ErrorTypeEnum, timestamp: string): AskResponse<LogLog | null> {
  const log = yield* askKeyValueStoreQuerySingle<LogLog>(storeName, kvsAnd([kvsEqual('type', errorType), kvsEqual('timestamp', timestamp)]));

  return log;
}
