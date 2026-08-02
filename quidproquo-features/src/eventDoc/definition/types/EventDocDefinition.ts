import { Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocLink, EventDocSnapshotViews, EventDocSummaryView } from '../../models';
import { EventDocWorkspaceDocumentSlotConfig } from '../../workspace/types/EventDocWorkspaceDocumentSlotConfig';
import { EventDocWorkspaceLocalSlotConfig } from '../../workspace/types/EventDocWorkspaceLocalSlotConfig';
import { EventDocWorkspaceStoryApi } from '../../workspace/types/EventDocWorkspaceStoryApi';
import { EventDocGenericApi } from '../eventDocGenericApi';
import { EventDocLatestViews, EventDocPrimaryView, EventDocSummaryViewName } from './EventDocLatestViews';
import { EventDocReferenceCollector } from './EventDocReferenceCollector';
import { EventDocVersions } from './EventDocVersion';

// One projection of a doc type's log. `fold` is the only way to read it — list pages,
// backend renders and tests all fold through here instead of hand-assembling
// {seed, reducer, migrations, latestVersion}, which is what keeps every reader of a log
// agreeing on what it says.
export type EventDocView<TView> = {
  fold: (events: EventDocEvent[]) => TView;
};

// The canonical home of a doc type: its versions folded into one view per projection,
// plus the doc's own api. Structurally a workspace slot config so it mounts VERBATIM at
// any slot key — the mounted view is always the PRIMARY one (`document`), because an
// editor edits a document and never a summary. Secondary views are fold-only.
//
// The api includes the generic identity/lifecycle verbs, merged by createEventDocDefinition.
export type EventDocDefinition<TVersions extends EventDocVersions, TApi extends EventDocWorkspaceStoryApi> = EventDocWorkspaceDocumentSlotConfig<
  EventDocPrimaryView<TVersions>,
  TApi & EventDocGenericApi
> & {
  // The collection's identity, carried through from the config (see
  // EventDocSavedDefinitionConfig). Present on any doc type registered as a backend
  // collection; absent on client-only definitions.
  storeName?: string;
  type?: string;

  // Every projection of this doc type, keyed by view name and typed at the LATEST version —
  // `views.document.fold(events)` is the document, `views.summary.fold(events)` the
  // queryable record, both from the same log and the same accepted event set.
  //
  // `summary` is here without being declared: every event doc has one, folded from the
  // reserved lifecycle events, needing no version entries because those event shapes are
  // quidproquo's rather than the doc type's.
  views: {
    [K in keyof EventDocLatestViews<TVersions>]: EventDocView<EventDocLatestViews<TVersions>[K]>;
  } & Record<EventDocSummaryViewName, EventDocView<EventDocSummaryView>>;

  // Carried through from the config, for callers that already hold a folded view.
  references?: EventDocReferenceCollector<EventDocPrimaryView<TVersions>>;

  // Every doc this one has ever referenced, across its whole log — the transfer export's
  // walk (it exports the whole history, so it must chase links from every historical
  // state); [] for a doc type that declares no `references`.
  collectReferences: (events: EventDocEvent[]) => EventDocLink[];

  // What the CURRENT document references — `references` applied to an already-folded,
  // latest-shaped state. The references route's read: no log walk, just the state.
  collectReferencesFromState: (state: unknown) => EventDocLink[];

  // The document view at one point, LATEST-shaped: an as-written fold resumable from a
  // stored snapshot's document state (the seed must be era-pinned, never pre-migrated),
  // migrated up once at the end. The read side's fold — render, references, hooks and
  // backend reads consume the document at the current schema.
  foldDocumentState: (events: EventDocEvent[], seedState?: unknown) => unknown;

  // Every view of the given log prefix in one pass, ERA-PINNED (no climb to the code's
  // latest version) — the states a snapshot stores. The gate runs ONCE and every view
  // folds the same accepted set, so a snapshot's view rows can never disagree about what
  // the prefix contains. THE thing the stream projector invokes through the collection's
  // registered EventDocFunctions object.
  //
  // Given `seedViews` (a previous snapshot's states), `events` is only the gap since that
  // snapshot and each view resumes from its seed — equivalent to folding the whole prefix,
  // at the cost of the gap alone. Null means the seed is unusable (missing a current
  // view); fold from scratch instead. Never null without a seed.
  foldSnapshotViews: (events: EventDocEvent[], seedViews?: EventDocSnapshotViews) => Nullable<EventDocSnapshotViews>;
};

// An unsaved doc has no server log, so nothing to fold — it IS its slot config.
export type EventDocUnsavedDefinition<TView, TApi extends EventDocWorkspaceStoryApi> = EventDocWorkspaceLocalSlotConfig<TView, TApi>;
