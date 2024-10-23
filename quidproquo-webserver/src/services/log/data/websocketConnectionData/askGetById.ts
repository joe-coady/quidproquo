import { askKeyValueStoreQueryAll, AskResponse, kvsEqual } from 'quidproquo-core';

import { wsConnectionResourceName } from '../../../../config';
import { Connection } from '../../domain';

export function* askGetById(id: string): AskResponse<Connection | undefined> {
  const [connection] = yield* askKeyValueStoreQueryAll<Connection>(wsConnectionResourceName, kvsEqual('id', id));

  return connection;
}
