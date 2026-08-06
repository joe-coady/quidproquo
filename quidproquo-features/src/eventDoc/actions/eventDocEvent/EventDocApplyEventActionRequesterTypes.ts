import { EventDocActionType } from './EventDocActionType';

// Target model is the processor's ambient context, not the payload, so the verb stays pure.
// version isn't here — the editor stamps its configured schema version on every event.
export type EventDocApplyEventActionPayload = {
  eventType: string;
  data: unknown;
};

// void: the web processor surfaces failures as UI error state, so applying never throws.
