import { Effect } from 'quidproquo-core';

import { EventDocActionType } from './EventDocActionType';
import { EventDocApplyTransientEventActionRequester } from './EventDocApplyTransientEventActionRequesterTypes';

// The never-saved sibling of askApplyEventDocEvent: yields the declarative
// ApplyTransientEvent action, and the workspace bind routes it into the bound slot's
// TRANSIENT group under `transientKey` — the unit a drop clears (usually a websocket
// connection id), the event-sourced cure for the forever-spinner. Transient applies are
// client-runtime-only by definition (a server "authors" them only via messages a client
// story processes); an unbound or backend apply fails loudly like the normal one.
//
// Typed like askApplyEventDocEvent: an event-doc event IS a special kind of effect
// (Effect<type, data>), so action creators pass their effect type as E and get the
// data checked: askApplyTransientEventDocEvent<ZipProgressEffect>(connectionId, ZipEffect.Progress, { done, total }).
//
// Deliberately positional args with an explicit generic, NOT a whole-effect object:
// passing `{ type, payload }` would let TS infer E from the literal itself, so a wrong
// member/payload pairing would type itself instead of being checked against the
// declared effect. The explicit generic is the check; creators are the only call
// sites, so the one-line ceremony stays quarantined there.
export function* askApplyTransientEventDocEvent<E extends Effect<string, any>>(
  transientKey: string,
  eventType: E['type'],
  data: E['payload'],
): EventDocApplyTransientEventActionRequester {
  return yield {
    type: EventDocActionType.ApplyTransientEvent,
    payload: { transientKey, eventType, data },
  };
}
