import { QpqReducer } from 'quidproquo-core';

import { EventDocMigrations } from '../../fold/EventDocMigrations';
import { EventDocDocument, EventDocEvent } from '../../models';
import { EventDocEditorValidator } from '../../validation';
import { CoalesceEventType } from '../../workspace/types/CoalesceEventType';
import { EventDocWorkspaceStoryApi } from '../../workspace/types/EventDocWorkspaceStoryApi';

// A SAVED doc: persisted event log, versioned, draft/published lifecycle. The default —
// omit `saved` (or pass true).
export type EventDocSavedDefinitionConfig<TView extends EventDocDocument, TApi extends EventDocWorkspaceStoryApi> = {
  saved?: true;
  // The schema version this doc authors at; stamped on every committed event and the
  // fold's migration target.
  schemaVersion: number;
  // Folds ONE event onto the view. Domain reducers are typed to their own effect
  // union and cast to EventDocEvent at this registration boundary, the same
  // convention as the workspace slot configs.
  foldReducer: QpqReducer<TView, EventDocEvent>;
  createInitialViewState: () => TView;
  migrations?: EventDocMigrations;
  // Merged AFTER the reserved rules (SET_CODE/SET_NAME coalesce; lifecycle events
  // never do). Unlisted types append.
  coalesceEventTypes?: CoalesceEventType[];
  // Omitted = the universal lifecycle guard (published = CREATE_DRAFT only).
  validate?: EventDocEditorValidator;
  // The doc's OWN verbs: own-doc writes (askApplyEventDocEvent) and own-doc reads
  // (via the doc's createEventDocStateReader) ONLY — workspace-blind by contract.
  // Cross-doc flows belong to the editor api layer, never here.
  api: TApi;
};

// An UNSAVED doc (experience, chrome): the same event-stream + fold machinery over a
// session-only stream — no persistence, no versions, no lifecycle. Everything is an
// event doc; not all are saved.
export type EventDocUnsavedDefinitionConfig<TView, TApi extends EventDocWorkspaceStoryApi> = {
  saved: false;
  foldReducer: QpqReducer<TView, EventDocEvent>;
  createInitialViewState: () => TView;
  // Omitted = last-write-wins for EVERY type, so session streams don't grow one
  // entry per interaction. An explicit list opts back into append semantics for
  // unlisted types.
  coalesceEventTypes?: CoalesceEventType[];
  // Omitted = accept-all.
  validate?: EventDocEditorValidator;
  api: TApi;
};
