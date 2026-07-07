// How a render (and, later, EventDocLink resolution) treats a document's versions:
// - Published: resolve the latest published version effective at the requested time.
// - Draft: resolve the latest event (the working draft), ignoring publish state.
// Threaded through the render request now; honoured once version/effectiveAt resolution is
// built — Latest-link resolution currently ignores it (folds the whole log).
export enum EventDocRenderMode {
  Draft = 'draft',
  Published = 'published',
}
