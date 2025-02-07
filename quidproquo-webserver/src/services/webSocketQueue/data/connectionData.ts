import {
  askKeyValueStoreDelete,
  askKeyValueStoreQueryAll,
  askKeyValueStoreScanAll,
  askKeyValueStoreUpsertWithRetry,
  AskResponse,
  kvsEqual,
} from 'quidproquo-core';

import { getWebSocketQueueKeyValueStoreName } from '../../../config';
import { askWebsocketReadApiNameOrThrow } from '../../../context';
import { Connection } from '../types';

export function* askGetStoreName(): AskResponse<string> {
  const apiName = yield* askWebsocketReadApiNameOrThrow();

  return getWebSocketQueueKeyValueStoreName(apiName || 'UNKNOWN-API');
}

export function* askGetConnectionsByUserId(userId: string): AskResponse<Connection[]> {
  const storeName = yield* askGetStoreName();

  const connections = yield* askKeyValueStoreQueryAll<Connection>(storeName, kvsEqual('userId', userId));

  return connections;
}

export function* askGetById(id: string): AskResponse<Connection | undefined> {
  const storeName = yield* askGetStoreName();

  const [connection] = yield* askKeyValueStoreQueryAll<Connection>(storeName, kvsEqual('id', id));

  return connection;
}

export function* askGetAllConnections(): AskResponse<Connection[]> {
  const storeName = yield* askGetStoreName();

  const connections = yield* askKeyValueStoreScanAll<Connection>(storeName);
  return connections;
}

export function* askDeleteByConnectionId(id: string): AskResponse<void> {
  const storeName = yield* askGetStoreName();

  yield* askKeyValueStoreDelete(storeName, id);
}

export function* askUpsert(connection: Connection): AskResponse<void> {
  const storeName = yield* askGetStoreName();

  yield* askKeyValueStoreUpsertWithRetry(storeName, connection);
}

export const webSocketConnectionData = {
  askGetConnectionsByUserId,
  askGetById,
  askGetAllConnections,
  askDeleteByConnectionId,
  askUpsert,
};
