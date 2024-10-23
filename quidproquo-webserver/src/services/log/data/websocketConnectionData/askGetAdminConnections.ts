import { askKeyValueStoreScanAll, AskResponse, kvsExists } from 'quidproquo-core';

import { wsConnectionResourceName } from '../../../../config';
import { Connection } from '../../domain';

export function* askGetAdminConnections(): AskResponse<Connection[]> {
  const connections = yield* askKeyValueStoreScanAll<Connection>(wsConnectionResourceName, kvsExists('userId'));

  return connections;
}
