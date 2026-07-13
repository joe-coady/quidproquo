import { Action, ActionProcessor, ActionRequester } from 'quidproquo-core';

import { EventDocActionType } from './EventDocActionType';

// Target model is the processor's ambient context, not the payload, so the verb stays pure.
// version isn't here — the editor stamps its configured schema version on every event.
export type EventDocApplyEventActionPayload = {
  eventType: string;
  data: unknown;
};

export interface EventDocApplyEventAction extends Action<EventDocApplyEventActionPayload> {
  type: EventDocActionType.ApplyEvent;
}

// void: the web processor surfaces failures as UI error state, so applying never throws.
export type EventDocApplyEventActionProcessor = ActionProcessor<EventDocApplyEventAction, void>;
export type EventDocApplyEventActionRequester = ActionRequester<EventDocApplyEventAction, void>;
