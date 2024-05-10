import { AskResponse, QpqPagedData, QpqRuntimeType } from 'quidproquo-core';

import { askListLogs } from '../../data/logMetadataData';
import { LogMetadata } from '../../domain';

export function* askGetLogs(
  runtimeType: QpqRuntimeType,
  startIsoDateTime: string,
  endIsoDateTime: string,
  errorFilter: string,
  serviceFilter: string,
  infoFilter: string,
  userFilter: string,
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
      result.nextPageKey,
    );

    result.items.push(...logPage.items);
    result.nextPageKey = logPage.nextPageKey;

    // Keep going until we get some items, if there are some to fetch
  } while (result.nextPageKey && result.items.length < 3000);

  return result;

  // the above was almost twice as long for requests over a few weeks...
  // but i think its better now with the filters
  // return yield* askListLogs(
  //   runtimeType,
  //   startIsoDateTime,
  //   endIsoDateTime,
  //   errorFilter,
  //   serviceFilter,
  //   infoFilter,
  //   nextPageKey,
  // );
}
