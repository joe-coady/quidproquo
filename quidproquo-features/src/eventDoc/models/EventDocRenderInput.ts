import { EventDocRenderOptions } from './EventDocRenderOptions';
import { EventDocVersion } from './EventDocVersion';

// Input to a collection's `render` function (on its registered EventDocFunctions object): the
// FOLDED document state to render plus the doc's id (so the renderer can resolve the doc's own
// assets — e.g. an image content item's blob at `<docId>/assets/<guid>`).
//
// The caller has ALREADY applied `renderMode`/`effectiveAt` and folded: `state` is the document
// view, latest-shaped, at the resolved point (the log's head for a draft, the version's head for
// a published render) — snapshot-seeded, so a render never replays a whole log. `version` is what
// that resolution picked, absent unless a published version was resolved; it is what lets a
// renderer resolve its links as of the moment the doc was published (`version.publishedAt`)
// rather than guessing a clock. The options are echoed for context, not for the renderer to
// re-apply. `unknown` because render inputs cross the dynamic-functions boundary — the
// collection's own adapter narrows to its document type, restating the provenance (the state was
// folded by that same definition).
export type EventDocRenderInput = {
  state: unknown;
  docId: string;
  version?: EventDocVersion;
} & EventDocRenderOptions;
