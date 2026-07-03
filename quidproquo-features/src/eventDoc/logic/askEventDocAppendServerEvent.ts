import { askNewGuid, AskResponse } from 'quidproquo-core';

import { EventDocEvent, EventDocEventActor } from '../models';
import { askEventDocEventAppend } from './askEventDocEventAppend';

// Append a SERVER-AUTHORED event: build the EventDocEventInput envelope (a fresh
// clientMessageId for dedup + the caller's schema `version`) and append it. The backend
// analog of the editor's ApplyEvent action creators — callers pass the effect type + typed
// data, never the `{ type, payload: { data, metadata } }` envelope. (The usual path is a
// client building the input and POSTing it to the append route; this is for the rarer case
// where the server itself authors an event, e.g. a generated secret.) Requires the EventDoc
// store context — provide it via askEventDocProvideStore / askEventDocProvideStoreFromGlobals;
// the append stamps createdBy/createdAt/index.
export function* askEventDocAppendServerEvent<T>(
  modelId: string,
  type: string,
  data: T,
  version: number,
  actor: EventDocEventActor
): AskResponse<EventDocEvent> {
  const clientMessageId = yield* askNewGuid();

  return yield* askEventDocEventAppend(
    modelId,
    { type, payload: { data, metadata: { version, clientMessageId } } },
    actor
  );
}
