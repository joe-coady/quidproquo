import { askKeyValueStoreUpsert, AskResponse } from 'quidproquo-core';

import { wsConnectionResourceName } from '../../../../config';
import { Connection } from '../../domain';

export function* askUpsert(connection: Connection): AskResponse<void> {
  yield* askKeyValueStoreUpsert(wsConnectionResourceName, connection);
}
