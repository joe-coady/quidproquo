import { EventDocEvent, EventDocLink, EventDocSummaryView } from '../../models';
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

  // Every doc this one has ever referenced, across its whole log. THE thing a collection's
  // referenceResolver inline function calls; [] for a doc type that declares no `references`.
  collectReferences: (events: EventDocEvent[]) => EventDocLink[];
};

// An unsaved doc has no server log, so nothing to fold — it IS its slot config.
export type EventDocUnsavedDefinition<TView, TApi extends EventDocWorkspaceStoryApi> = EventDocWorkspaceLocalSlotConfig<TView, TApi>;
