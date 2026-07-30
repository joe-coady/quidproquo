import { QpqReducer } from 'quidproquo-core';

import { EventDocMigrations } from '../../fold/EventDocMigrations';
import { EventDocDocument, EventDocEvent } from '../../models';
import { EventDocEventValidators } from '../../validation/types/EventDocEventValidators';
import { CoalesceEventType } from '../../workspace/types/CoalesceEventType';
import { EventDocWorkspaceStoryApi } from '../../workspace/types/EventDocWorkspaceStoryApi';
import { EventDocReferenceCollector } from './EventDocReferenceCollector';

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
  // The doc's DOMAIN rules, keyed by event type. Supplying these is what makes the fold
  // enforce them: appends no longer validate, so a rule that is not here is a rule nothing
  // applies. The universal lifecycle guard is composed in automatically, so a collection
  // declares only what is specific to it.
  //
  // The editor's pre-flight is DERIVED from these rather than supplied separately: one set of
  // rules, applied by both the fold and the editor, so the two cannot disagree about what is
  // legal. A doc that declares none still gets the reserved lifecycle guard.
  validators?: EventDocEventValidators<TView>;
  // The other docs this one depends on, read off the folded view (a template -> its layout,
  // styles and content). Omit for a leaf doc type; the transfer manifest walk then stops here.
  // The backend reaches this through the collection's `referenceResolver` inline function, which
  // is a thin `references(fold(events))` adapter.
  references?: EventDocReferenceCollector<TView>;
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
  api: TApi;
};
