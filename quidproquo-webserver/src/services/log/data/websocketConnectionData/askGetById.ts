import { askKeyValueStoreQueryAll, AskResponse, kvsEqual } from 'quidproquo-core';

import { Connection } from '../../domain';
import { wsConnectionResourceName } from '../../../../config';

export function* askGetById(id: string): AskResponse<Connection | undefined> {
  const [connection] = yield* askKeyValueStoreQueryAll<Connection>(wsConnectionResourceName, kvsEqual('id', id));

  return connection;
}
