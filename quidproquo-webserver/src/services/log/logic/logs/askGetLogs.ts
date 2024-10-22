import { AskResponse, QpqPagedData, QpqRuntimeType, askFileReadTextContents, askFilter, askMapParallelBatch } from 'quidproquo-core';

import { askListLogs } from '../../entry/data/logMetadataData';
import { LogMetadata } from '../../entry/domain';

export function* askGetLogs(
  runtimeType: QpqRuntimeType,
  startIsoDateTime: string,
  endIsoDateTime: string,
  errorFilter: string,
  serviceFilter: string,
  infoFilter: string,
  userFilter: string,
  deep: string,
  onlyErrors: boolean,
  nextPageKey?: string,
): AskResponse<QpqPagedData<LogMetadata>> {
  const result: QpqPagedData<LogMetadata> = {
    items: [],
    nextPageKey: nextPageKey,
  };

  do {
    const logPage = yield* askListLogs(
      runtimeType,
      startIsoDateTime,
      endIsoDateTime,
      errorFilter,
      serviceFilter,
      infoFilter,
      userFilter,
      onlyErrors,
      result.nextPageKey,
    );

    const data = deep
      ? yield* askMapParallelBatch(logPage.items, 10, function* askFilterDeep(log) {
          try {
            return yield* askFileReadTextContents('qpq-logs', `${log.correlation}.json`);
          } catch {
            return '';
          }
        })
      : [];

    const filtered = deep
      ? yield* askFilter(logPage.items, function* askFilterDeep(log, index) {
          return data[index].includes(deep);
        })
      : logPage.items;

    result.items.push(...filtered);
    result.nextPageKey = logPage.nextPageKey;

    // Keep going until we get some items, if there are some to fetch
  } while (result.nextPageKey && result.items.length < 3000);

  return result;
}
