import { askKeyValueStoreQueryAll, AskResponse, kvsEqual } from 'quidproquo-core';

import { wsConnectionResourceName } from '../../../../config';
import { Connection } from '../../domain';

export function* askGetConnectionsByUserId(userId: string): AskResponse<Connection[]> {
  const connections = yield* askKeyValueStoreQueryAll<Connection>(wsConnectionResourceName, kvsEqual('userId', userId));

  return connections;
}
