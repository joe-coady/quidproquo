import { askKeyValueStoreQuery, askKeyValueStoreUpsert, AskResponse, kvsAnd, kvsBetween, kvsEqual, QpqPagedData, QpqRuntimeType } from 'quidproquo-core';
import { LogMetadata } from '../domain';

const metadataStoreName = 'qpq-logs';

export function* askUpsert(logMetadata: LogMetadata): AskResponse<void> {
    yield* askKeyValueStoreUpsert(metadataStoreName, logMetadata);
}

export function* askListLogs(runtimeType: QpqRuntimeType, startDateTime: string, endDateTime: string, nextPageKey?: string): AskResponse<QpqPagedData<LogMetadata>> {
    const logs = yield* askKeyValueStoreQuery<LogMetadata>(
        metadataStoreName,
        kvsAnd([
            kvsEqual('runtimeType', runtimeType),
            kvsBetween('startedAt', startDateTime, endDateTime),
        ]),
        undefined,        
        nextPageKey
    );

    return logs;
}

export function* askGetByCorrelation(correlation: string): AskResponse<LogMetadata | undefined> {
    const logs = yield* askKeyValueStoreQuery<LogMetadata>(
        metadataStoreName,
        kvsEqual('correlation', correlation)
    );

    return logs.items[0];
}

export function* askGetByFromCorrelation(fromCorrelation: string): AskResponse<QpqPagedData<LogMetadata>> {
    const logs = yield* askKeyValueStoreQuery<LogMetadata>(
        metadataStoreName,
        kvsEqual('fromCorrelation', fromCorrelation)
    );

    return logs;
}
