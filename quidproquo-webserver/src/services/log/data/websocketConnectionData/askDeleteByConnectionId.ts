import { askKeyValueStoreDelete, AskResponse } from 'quidproquo-core';

import { wsConnectionResourceName } from '../../../../config';

export function* askDeleteByConnectionId(id: string): AskResponse<void> {
  yield* askKeyValueStoreDelete(wsConnectionResourceName, id);
}
