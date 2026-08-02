import { askKeyValueStoreUpsertMany, AskResponse } from 'quidproquo-core';

import { askEventDocResolveStore } from '../context/askEventDocResolveStore';
import { EventDocEvent } from '../models';
import { eventDocEventToStoredEvent } from './storedEvent/eventDocEventToStoredEvent';
import { askEventDocResolveScope } from './askEventDocResolveScope';

// The batch sibling of askEventDocEventWrite: one UpsertMany action for a whole
// burst of events. UNCONDITIONAL where the single write is ifNotExists — batch
// writes carry no conditions — so the colliding-id assertion is lost here; ids
// are unique by construction (one sortable-guid mint per event) and the logic
// layer (askEventDocAppendServerEvents) is the only caller.
export function* askEventDocEventWriteMany(modelId: string, events: EventDocEvent[]): AskResponse<void> {
  const { eventsStoreName, type } = yield* askEventDocResolveStore();
  const scope = yield* askEventDocResolveScope();

  yield* askKeyValueStoreUpsertMany(
    eventsStoreName,
    events.map((event) => eventDocEventToStoredEvent(modelId, type, event)),
    { scope },
  );
}
