import { buildEventDocViewFoldConfig } from '../fold/buildEventDocViewFoldConfig';
import { collectEventDocReferences } from '../fold/collectEventDocReferences';
import { foldEventDocLog, foldEventDocLogAccepted } from '../fold/foldEventDocLog';
import { migrateEventDocDocumentTo } from '../fold/migrateEventDocDocumentTo';
import { EventDocDocument, EventDocEvent } from '../models';
import { createEventDocEventValidator } from '../validation/createEventDocEventValidator';
import { reservedEventDocEventValidators } from '../validation/reservedEventDocEventValidators';
import { EventDocWorkspaceSlotKind } from '../workspace/types/EventDocWorkspaceSlotKind';
import { EventDocWorkspaceStoryApi } from '../workspace/types/EventDocWorkspaceStoryApi';
import { EventDocDefinition, EventDocUnsavedDefinition, EventDocView } from './types/EventDocDefinition';
import { EventDocSavedDefinitionConfig, EventDocUnsavedDefinitionConfig } from './types/EventDocDefinitionConfig';
import { EVENT_DOC_PRIMARY_VIEW } from './types/EventDocLatestViews';
import { EventDocVersions } from './types/EventDocVersion';
import { assertEventDocVersions } from './assertEventDocVersions';
import { EventDocGenericApi, eventDocGenericApi } from './eventDocGenericApi';

// The generic verbs are additive, never an override: a domain api reusing one of the
// reserved names is a bug worth failing on at definition time, not a merge order bet.
const withGenericVerbs = <TApi extends EventDocWorkspaceStoryApi>(api: TApi): TApi & EventDocGenericApi => {
  const collisions = Object.keys(eventDocGenericApi).filter((verbName) => verbName in api);

  if (collisions.length > 0) {
    throw new Error(`api redefines built-in event doc verb(s): ${collisions.join(', ')} - remove them; every saved doc gets them automatically.`);
  }

  return { ...api, ...eventDocGenericApi };
};

// THE canonical home of a doc type — its version history folded into one view per
// projection, plus the doc's own api, mountable verbatim as a workspace slot. One creator
// for both kinds: everything is an event doc, `saved: false` just means the stream is
// session-only (today's "local slot"). The doc's api verbs stay workspace-blind: own-doc
// writes via askApplyEventDocEvent, own-doc reads via the doc's createEventDocStateReader —
// WHICH doc both target is the enclosing slot binding's ambient context.
export function createEventDocDefinition<const TVersions extends EventDocVersions, TApi extends EventDocWorkspaceStoryApi>(
  config: EventDocSavedDefinitionConfig<TVersions, TApi>,
): EventDocDefinition<TVersions, TApi>;
export function createEventDocDefinition<TView, TApi extends EventDocWorkspaceStoryApi>(
  config: EventDocUnsavedDefinitionConfig<TView, TApi>,
): EventDocUnsavedDefinition<TView, TApi>;
export function createEventDocDefinition(
  config:
    EventDocSavedDefinitionConfig<EventDocVersions, EventDocWorkspaceStoryApi> | EventDocUnsavedDefinitionConfig<unknown, EventDocWorkspaceStoryApi>,
): unknown {
  if (config.saved === false) {
    const { saved: _saved, ...slotConfig } = config;

    return {
      kind: EventDocWorkspaceSlotKind.local,
      ...slotConfig,
    };
  }

  const { saved: _saved, api, versions, schemaVersion, references, coalesceEventTypes } = config;

  assertEventDocVersions(versions, schemaVersion);

  // The fold is the gate. Appends write unconditionally, so an event earns its place in
  // the document here or nowhere.
  //
  // The reserved guard is ALWAYS applied, whether or not the collection adds rules of its
  // own. Making it conditional on `validators` meant every doc that declared no domain rules
  // silently folded edits made after publish — the guard existed and nothing ran it.
  const validators = { ...reservedEventDocEventValidators, ...(config.validators ?? {}) };

  // The primary view is the gate: it decides which events are in the document, and every
  // other view folds exactly that accepted set. Deciding acceptance per-view instead would
  // let a summary apply an event the document rejected — two views of one log that
  // disagree about its contents, which nothing downstream could reconcile.
  const primaryFoldConfig = buildEventDocViewFoldConfig(versions, EVENT_DOC_PRIMARY_VIEW, schemaVersion, validators);

  const views: Record<string, EventDocView<EventDocDocument>> = {};
  Object.keys(versions[0].views).forEach((viewName) => {
    if (viewName === EVENT_DOC_PRIMARY_VIEW) {
      views[viewName] = { fold: (events: EventDocEvent[]) => foldEventDocLog(events, primaryFoldConfig) };
      return;
    }

    // No validators of its own — the rules ran once, on the gate. Re-running them here
    // would hand a domain rule a state shape it was never written against.
    const foldConfig = buildEventDocViewFoldConfig(versions, viewName, schemaVersion);
    views[viewName] = {
      fold: (events: EventDocEvent[]) => foldEventDocLog(foldEventDocLogAccepted(events, primaryFoldConfig).accepted, foldConfig),
    };
  });

  // The editor's pre-flight, derived from the SAME rules the fold applies, so a client cannot
  // consider legal something the fold will silently drop. Always present, for the same reason
  // the reserved guard always is: without it an edit on a published document is accepted by
  // the editor, ignored by the fold, and simply appears to do nothing.
  const validate = createEventDocEventValidator((events: EventDocEvent[]) => foldEventDocLog(events, primaryFoldConfig), config.validators ?? {});

  return {
    // TODO: This seems like the wrong place for a workspace slot kind...
    // likely should be defined at the workspace, when we define the slots.
    kind: EventDocWorkspaceSlotKind.document,
    // The workspace mounts the PRIMARY view: an editor edits a document, never a summary.
    foldReducer: primaryFoldConfig.reducer,
    // Latest-shaped, unlike the fold's own seed: the workspace hands this straight to
    // selectors for a pristine slot, and a consumer reading a base-shaped view would be
    // missing every field added since.
    createInitialViewState: () => migrateEventDocDocumentTo(primaryFoldConfig.seed, schemaVersion, primaryFoldConfig.migrations),
    schemaVersion,
    migrations: primaryFoldConfig.migrations,
    coalesceEventTypes,
    validators,
    validate,
    api: withGenericVerbs(api),
    views,
    references,
    // Always defined so a collection's referenceResolver is a one-liner with no optional call. A doc
    // type that declares no `references` is a leaf: skip the walk rather than scan for nothing.
    collectReferences: (events: EventDocEvent[]) => (references ? collectEventDocReferences(events, { ...primaryFoldConfig, references }) : []),
  };
}
