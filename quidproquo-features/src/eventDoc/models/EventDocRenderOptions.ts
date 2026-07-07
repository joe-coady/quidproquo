import { QpqIsoDateTime } from 'quidproquo-core';

import { EventDocRenderMode } from './EventDocRenderMode';

// How a render resolves a doc's versions: `renderMode` (draft|published) + `effectiveAt` (as-of
// time). Threaded from the render request — modelled now, honoured once version/effectiveAt link
// resolution lands. Shared by the render-route fetch, the embedded-link render, and the render input.
export type EventDocRenderOptions = {
  renderMode?: EventDocRenderMode;
  effectiveAt?: QpqIsoDateTime;
};
