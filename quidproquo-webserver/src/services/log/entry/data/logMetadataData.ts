import { askKeyValueStoreUpsert, AskResponse, kvsEqual } from 'quidproquo-core';
import { LogMetadata } from '../domain';

const cardStoreName = 'qpq-logs';

export function* askUpsert(logMetadata: LogMetadata): AskResponse<void> {
    yield* askKeyValueStoreUpsert(cardStoreName, logMetadata);
}
