import { askKeyValueStoreScanAll, AskResponse, kvsExists } from 'quidproquo-core';

import { Connection } from '../../domain';
import { wsConnectionResourceName } from '../../../../config';

export function* askGetAdminConnections(): AskResponse<Connection[]> {
  const connections = yield* askKeyValueStoreScanAll<Connection>(
    wsConnectionResourceName,
    kvsExists('userId'),
  );

  return connections;
}
