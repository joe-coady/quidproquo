import { EventDocEvent } from './EventDocEvent';
import { EventDocRenderOptions } from './EventDocRenderOptions';

// Input to a collection's render inline function: the document's full event log plus its id
// (so the renderer can resolve the doc's own assets — e.g. an image content item's blob at
// `<docId>/assets/<guid>`), plus the request's resolution options (renderMode + effectiveAt,
// threaded from the render route's query params). Mirrors EventDocEventValidationInput.
export type EventDocRenderInput = {
  events: EventDocEvent[];
  docId: string;
} & EventDocRenderOptions;
