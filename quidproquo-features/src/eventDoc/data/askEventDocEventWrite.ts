import { askKeyValueStoreUpsertWithRetry, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocEvent } from '../models';
import { eventDocEventToStoredEvent } from './storedEvent/eventDocEventToStoredEvent';

// Events are immutable and uniquely keyed, so the write is CONDITIONAL: the
// (modelId, index) slot is claimed atomically, and a concurrent writer that
// computed the same index gets ErrorTypeEnum.Conflict instead of silently
// overwriting the event. Ordering, index assignment, validation and the
// conflict-retry live in the logic layer (askEventDocEventAppend).
export function* askEventDocEventWrite(
  modelId: string,
  event: EventDocEvent
): AskResponse<void> {
  const { eventsStoreName } = yield* askEventDocResolveStore();

  yield* askKeyValueStoreUpsertWithRetry(
    eventsStoreName,
    eventDocEventToStoredEvent(modelId, event),
    { ifNotExists: true }
  );
}
