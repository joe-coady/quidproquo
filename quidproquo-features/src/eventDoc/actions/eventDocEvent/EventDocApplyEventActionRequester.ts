import { Effect } from 'quidproquo-core';

import { EventDocActionType } from './EventDocActionType';
import { EventDocApplyEventActionRequester } from './EventDocApplyEventActionRequesterTypes';

// Pure: only yields the declarative ApplyEvent action — a registered processor decides
// HOW (and stamps the editor's schema version + provenance). No side effects, so the
// verbs that yield* it run anywhere (backend, tests, transforms).
//
// Typed like askStateDispatchEffect: an event-doc event IS a special kind of effect
// (Effect<type, data>), so action creators pass their effect type as E and get the
// data checked: askApplyEventDocEvent<TemplateSetTypeEffect>(TemplateEffect.SetType, { templateType }).
//
// Deliberately two-arg with an explicit generic, NOT a whole-effect object: passing
// `{ type, payload }` would let TS infer E from the literal itself, so a wrong
// member/payload pairing would type itself instead of being checked against the
// declared effect. The explicit generic is the check; creators are the only call
// sites, so the one-line ceremony stays quarantined there.
export function* askApplyEventDocEvent<E extends Effect<string, any>>(eventType: E['type'], data: E['payload']): EventDocApplyEventActionRequester {
  return yield {
    type: EventDocActionType.ApplyEvent,
    payload: { eventType, data },
  };
}
