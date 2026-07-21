import { foldEventDocLog } from '../fold/foldEventDocLog';
import { EventDocEvent } from '../models';
import { EventDocDocument } from '../models';
import { EventDocWorkspaceSlotKind } from '../workspace/types/EventDocWorkspaceSlotKind';
import { EventDocWorkspaceStoryApi } from '../workspace/types/EventDocWorkspaceStoryApi';
import { EventDocDefinition, EventDocUnsavedDefinition } from './types/EventDocDefinition';
import { EventDocSavedDefinitionConfig, EventDocUnsavedDefinitionConfig } from './types/EventDocDefinitionConfig';
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

// THE canonical home of a doc type — fold config + the doc's own api in one object,
// mountable verbatim as a workspace slot and foldable anywhere via `.fold`. One
// creator for both kinds: everything is an event doc, `saved: false` just means the
// stream is session-only (today's "local slot"). The doc's api verbs stay
// workspace-blind: own-doc writes via askApplyEventDocEvent, own-doc reads via the
// doc's createEventDocStateReader — WHICH doc both target is the enclosing slot
// binding's ambient context.
export function createEventDocDefinition<TView extends EventDocDocument, TApi extends EventDocWorkspaceStoryApi>(
  config: EventDocSavedDefinitionConfig<TView, TApi>,
): EventDocDefinition<TView, TApi>;
export function createEventDocDefinition<TView, TApi extends EventDocWorkspaceStoryApi>(
  config: EventDocUnsavedDefinitionConfig<TView, TApi>,
): EventDocUnsavedDefinition<TView, TApi>;
export function createEventDocDefinition(
  config:
    EventDocSavedDefinitionConfig<EventDocDocument, EventDocWorkspaceStoryApi> | EventDocUnsavedDefinitionConfig<unknown, EventDocWorkspaceStoryApi>,
): unknown {
  if (config.saved === false) {
    const { saved: _saved, ...slotConfig } = config;

    return {
      kind: EventDocWorkspaceSlotKind.local,
      ...slotConfig,
    };
  }

  const { saved: _saved, api, ...slotConfig } = config;

  return {
    kind: EventDocWorkspaceSlotKind.document,
    ...slotConfig,
    api: withGenericVerbs(api),
    fold: (events: EventDocEvent[]) =>
      foldEventDocLog(events, {
        seed: config.createInitialViewState(),
        reducer: config.foldReducer,
        migrations: config.migrations ?? {},
        latestVersion: config.schemaVersion,
      }),
  };
}
