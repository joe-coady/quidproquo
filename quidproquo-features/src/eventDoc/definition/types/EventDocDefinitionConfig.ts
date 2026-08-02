import { QpqReducer } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocEventValidators } from '../../validation/types/EventDocEventValidators';
import { CoalesceEventType } from '../../workspace/types/CoalesceEventType';
import { EventDocWorkspaceStoryApi } from '../../workspace/types/EventDocWorkspaceStoryApi';
import { EventDocPrimaryView } from './EventDocLatestViews';
import { EventDocReferenceCollector } from './EventDocReferenceCollector';
import { EventDocVersions } from './EventDocVersion';

// A SAVED doc: persisted event log, versioned, draft/published lifecycle. The default —
// omit `saved` (or pass true).
export type EventDocSavedDefinitionConfig<TVersions extends EventDocVersions, TApi extends EventDocWorkspaceStoryApi> = {
  saved?: true;

  // The collection's identity, making the definition the ONE place a doc type is
  // described: config (defineEventDoc) reads these off the live object instead of
  // taking its own storeName/type options. Set both for any doc type registered as a
  // backend collection; omit both for definitions that only ever mount client-side
  // (editor experiences). Setting one without the other throws at definition time.
  storeName?: string;
  type?: string;

  // The doc type's revision counter: stamped on every event it authors, and the fold's
  // migration target. Bumped when the EVENTS change or when any VIEW's shape changes —
  // both alter how a log folds, so both need every view to say what they mean by it.
  // Asserted equal to the last entry in `versions`, so a new version folder that was
  // written but never added to the array is a crash rather than a silently-inert one.
  schemaVersion: number;

  // Every revision of this doc type, oldest first. The head seeds; each tail entry
  // migrates from the one before it. See EventDocVersions.
  versions: TVersions;

  // Merged AFTER the reserved rules (SET_CODE/SET_NAME coalesce; lifecycle events
  // never do). Unlisted types append.
  coalesceEventTypes?: CoalesceEventType[];

  // Omitted = the universal lifecycle guard (published = CREATE_DRAFT only).
  // The doc's DOMAIN rules, keyed by event type. Supplying these is what makes the fold
  // enforce them: appends no longer validate, so a rule that is not here is a rule nothing
  // applies. The universal lifecycle guard is composed in automatically, so a collection
  // declares only what is specific to it.
  //
  // ONE registry per doc type, never one per view. Validation decides which events are IN
  // the document, and that answer cannot vary by who is reading: the primary view acts as
  // the gate, and every other view folds exactly the set it accepted.
  //
  // The editor's pre-flight is DERIVED from these rather than supplied separately: one set of
  // rules, applied by both the fold and the editor, so the two cannot disagree about what is
  // legal. A doc that declares none still gets the reserved lifecycle guard.
  validators?: EventDocEventValidators<EventDocPrimaryView<TVersions>>;

  // The other docs this one depends on, read off the folded primary view (a template -> its
  // layout, styles and content). Omit for a leaf doc type; the transfer manifest walk then
  // stops here. The backend reaches this through `collectReferences` on the collection's
  // registered EventDocFunctions object.
  references?: EventDocReferenceCollector<EventDocPrimaryView<TVersions>>;

  // The doc's OWN verbs: own-doc writes (askApplyEventDocEvent) and own-doc reads
  // (via the doc's createEventDocStateReader) ONLY — workspace-blind by contract.
  // Cross-doc flows belong to the editor api layer, never here.
  api: TApi;
};

// An UNSAVED doc (experience, chrome): the same event-stream + fold machinery over a
// session-only stream — no persistence, no versions, no lifecycle. Everything is an
// event doc; not all are saved. No `versions` for the same reason there are no migrations:
// a session stream never outlives the shape that reads it.
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
