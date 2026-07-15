import { EventDocEvent } from './EventDocEvent';
import { EventDocRenderOptions } from './EventDocRenderOptions';
import { EventDocVersion } from './EventDocVersion';

// Input to a collection's render inline function: the event log to render plus the doc's id (so the
// renderer can resolve the doc's own assets — e.g. an image content item's blob at
// `<docId>/assets/<guid>`). Mirrors EventDocEventValidationInput.
//
// The caller has ALREADY applied `renderMode`/`effectiveAt` — `events` is the resolved log (the
// whole thing for a draft, the version's slice for a published render), and `version` is what that
// resolution picked, absent unless a published version was resolved. The options are echoed for
// context, not for the renderer to re-apply. `version` is what lets a renderer resolve its links as
// of the moment the doc was published (`version.publishedAt`) rather than guessing a clock.
export type EventDocRenderInput = {
  events: EventDocEvent[];
  docId: string;
  version?: EventDocVersion;
} & EventDocRenderOptions;
