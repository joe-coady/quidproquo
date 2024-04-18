import { AskResponse, QpqPagedData, QpqRuntimeType } from 'quidproquo-core';

import { askListLogs } from '../../data/logMetadataData';
import { LogMetadata } from '../../domain';

export function* askGetLogs(
  runtimeType: QpqRuntimeType,
  startIsoDateTime: string,
  endIsoDateTime: string,
  nextPageKey?: string,
): AskResponse<QpqPagedData<LogMetadata>> {
  // let totalSize = 0;

  // const result: QpqPagedData<LogMetadata> = {
  //   items: [],
  //   nextPageKey: nextPageKey,
  // };

  // do {
  //   const logPage = yield* askListLogs(runtimeType, startIsoDateTime, endIsoDateTime, nextPageKey);

  //   totalSize = totalSize + JSON.stringify(logPage.items).length;

  //   result.items.push(...logPage.items);
  //   result.nextPageKey = logPage.nextPageKey;

  //   // Note: Dyanmo returns a max of 1mb per request, so in theory we could get 5.5mb here.
  //   // which is < then our 6mb lambda limit
  // } while (result.nextPageKey && totalSize <= 4.5 * 1024 * 1024);

  // console.log('total size: ', totalSize);

  // return result;

  // the above was almost twice as long for requests over a few weeks...
  return yield* askListLogs(runtimeType, startIsoDateTime, endIsoDateTime, nextPageKey);
}
