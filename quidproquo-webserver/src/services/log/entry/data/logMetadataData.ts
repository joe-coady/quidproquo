import {
  askFileExists,
  askFileGenerateTemporarySecureUrl,
  askFileWriteTextContents,
  askKeyValueStoreQuery,
  askKeyValueStoreQueryAll,
  askKeyValueStoreUpdatePartialProperties,
  askKeyValueStoreUpsert,
  askMapParallel,
  AskResponse,
  kvsAnd,
  kvsBetween,
  kvsContains,
  kvsEqual,
  kvsExists,
  KvsQueryCondition,
  QpqPagedData,
  QpqRuntimeType,
  StoryResultMetadata,
  StoryResultMetadataWithChildren,
} from 'quidproquo-core';

import { logReportsResourceName } from '../../../../config';
import { LogMetadata } from '../domain';

const metadataStoreName = 'qpq-logs';

export function* askUpsert(logMetadata: LogMetadata): AskResponse<void> {
  yield* askKeyValueStoreUpsert(metadataStoreName, logMetadata);
}

export function* askSetChecked(correlation: string, checked: boolean, checkedBy: string): AskResponse<LogMetadata> {
  return yield* askKeyValueStoreUpdatePartialProperties<LogMetadata, 'correlation'>(metadataStoreName, 'correlation', {
    correlation,
    checked,
    checkedBy,
  });
}

export function* askListLogs(
  runtimeType: QpqRuntimeType,
  startDateTime: string,
  endDateTime: string,
  errorFilter: string,
  serviceFilter: string,
  infoFilter: string,
  userFilter: string,
  onlyErrors: boolean,
  nextPageKey?: string,
): AskResponse<QpqPagedData<LogMetadata>> {
  const filters: KvsQueryCondition[] = [];

  if (onlyErrors) {
    filters.push(kvsExists('error'));
  }

  if (serviceFilter) {
    filters.push(kvsEqual('moduleName', serviceFilter));
  }

  if (infoFilter) {
    filters.push(kvsContains('generic', infoFilter));
  }

  if (errorFilter) {
    filters.push(kvsContains('error', errorFilter));
  }

  if (userFilter) {
    filters.push(kvsContains('userInfo', userFilter));
  }

  console.log('filters', JSON.stringify(filters, null, 2));

  const logs = yield* askKeyValueStoreQuery<LogMetadata>(
    metadataStoreName,
    kvsAnd([kvsEqual('runtimeType', runtimeType), kvsBetween('startedAt', startDateTime, endDateTime)]),
    {
      nextPageKey,
      filter: filters.length > 0 ? kvsAnd(filters) : undefined,
    },
  );

  return logs;
}

export function* askGetByCorrelation(correlation: string): AskResponse<LogMetadata | undefined> {
  const logs = yield* askKeyValueStoreQuery<LogMetadata>(metadataStoreName, kvsEqual('correlation', correlation));

  return logs.items[0];
}

export function* askGetByFromCorrelation(fromCorrelation: string): AskResponse<QpqPagedData<LogMetadata>> {
  const logs = yield* askKeyValueStoreQuery<LogMetadata>(metadataStoreName, kvsEqual('fromCorrelation', fromCorrelation));

  return logs;
}

export function* askGetAllByFromCorrelation(fromCorrelation: string): AskResponse<LogMetadata[]> {
  return yield* askKeyValueStoreQueryAll<LogMetadata>(metadataStoreName, kvsEqual('fromCorrelation', fromCorrelation));
}

export function* askFindRootLog(fromCorrelation?: string): AskResponse<LogMetadata | undefined> {
  if (!fromCorrelation) {
    return;
  }

  const parentLog = yield* askGetByCorrelation(fromCorrelation);
  return (yield* askFindRootLog(parentLog?.fromCorrelation)) || parentLog;
}

export function* askCreateHierarchy(rootStoryResultMetadata: StoryResultMetadata): AskResponse<StoryResultMetadataWithChildren> {
  const childrenLogs: StoryResultMetadata[] = yield* askGetAllByFromCorrelation(rootStoryResultMetadata.correlation);

  const sortedChildren = childrenLogs.sort((a, b) => {
    return a.startedAt < b.startedAt ? -1 : 1;
  });

  const childrenWithHierarchies = yield* askMapParallel(sortedChildren, askCreateHierarchy);
  return {
    ...rootStoryResultMetadata,
    children: childrenWithHierarchies,
  };
}

export function* askGetHierarchiesByCorrelation(correlation: string, forceRefresh: boolean): AskResponse<string | undefined> {
  const root = yield* askFindRootLog(correlation);
  if (root) {
    const rootReportFilename = `${root.correlation}-tree.json`;
    const reportExists = yield* askFileExists(logReportsResourceName, rootReportFilename);

    if (!reportExists || forceRefresh) {
      const report = yield* askCreateHierarchy(root);
      yield* askFileWriteTextContents(logReportsResourceName, rootReportFilename, JSON.stringify(report));
    }

    return yield* askFileGenerateTemporarySecureUrl(logReportsResourceName, rootReportFilename, 1 * 60 * 1000);
  }

  return undefined;
}
