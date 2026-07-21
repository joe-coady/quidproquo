import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { EventDocActionType } from './EventDocActionType';

// No payload: WHICH doc is the processor's ambient context (the enclosing slot
// binding), exactly like ApplyEvent's target — the verb stays scope-blind.
export interface EventDocReadStateAction extends Action<void> {
  type: EventDocActionType.ReadState;
}

// unknown: the per-doc typed reader (createEventDocStateReader) owns the narrowing —
// the raw action can't know a slot's view type.
export type EventDocReadStateActionProcessor = ActionProcessor<EventDocReadStateAction, unknown>;
export type EventDocReadStateActionRequester = ActionRequester<EventDocReadStateAction, unknown>;
