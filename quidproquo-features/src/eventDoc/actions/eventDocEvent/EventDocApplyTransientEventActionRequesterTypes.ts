import { EventDocActionType } from './EventDocActionType';

// Target model is the processor's ambient context, not the payload, so the verb stays
// pure. `transientKey` IS payload: it names the drop unit (usually a websocket
// connection id), and only the caller knows it. version isn't here — the editor stamps
// its configured schema version on every event.
export type EventDocApplyTransientEventActionPayload = {
  transientKey: string;
  eventType: string;
  data: unknown;
};

// void: the web processor surfaces failures as UI error state, so applying never throws.
