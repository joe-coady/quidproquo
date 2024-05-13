import { askKeyValueStoreUpsert, AskResponse } from 'quidproquo-core';

import { Connection } from '../../domain';
import { wsConnectionResourceName } from '../../../../config';

export function* askUpsert(connection: Connection): AskResponse<void> {
  yield* askKeyValueStoreUpsert(wsConnectionResourceName, connection);
}
