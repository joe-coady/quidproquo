import { defaultEventDocEventValidator } from '../validation';
import { eventDocWorkspaceChromeSlot } from './chrome/eventDocWorkspaceChromeSlot';
import { bindEventDocWorkspaceApi } from './logic/bindEventDocWorkspaceApi';
import { createEventDocWorkspaceBuiltInApi } from './logic/createEventDocWorkspaceBuiltInApi';
import { createEventDocWorkspaceSnapshot } from './logic/createEventDocWorkspaceSnapshot';
import { createEventDocWorkspaceReducer } from './reducer/createEventDocWorkspaceReducer';
import { createEventDocWorkspaceSelectors } from './selectors/createEventDocWorkspaceSelectors';
import { EventDocWorkspaceDefinition } from './types/EventDocWorkspaceDefinition';
import { EventDocWorkspaceSlotBinding } from './types/EventDocWorkspaceSlotBinding';
import { EventDocWorkspaceSlotConfig } from './types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotKind } from './types/EventDocWorkspaceSlotKind';
import { EventDocWorkspaceSlotsConfig } from './types/EventDocWorkspaceSlotsConfig';
import { createInitialEventDocWorkspaceState, EventDocWorkspaceState } from './types/EventDocWorkspaceState';
import { EventDocWorkspace, EventDocWorkspaceResolvedSlots } from './EventDocWorkspace';

// Document slots ALWAYS get a validator: an unconfigured one falls back to the
// universal lifecycle guard (published = CREATE_DRAFT only), so a document slot can't
// silently mutate a published document. Local slots default to accept-all.
const getSlotBinding = (
  slotKey: string,
  slot: EventDocWorkspaceSlotConfig,
  getView: (state: EventDocWorkspaceState) => unknown,
): EventDocWorkspaceSlotBinding => ({
  slotKey,
  schemaVersion: slot.schemaVersion ?? 1,
  validate: slot.kind === EventDocWorkspaceSlotKind.document ? (slot.validate ?? defaultEventDocEventValidator) : (slot.validate ?? null),
  getView,
});

const resolveWorkspaceSlots = <TSlots extends EventDocWorkspaceSlotsConfig>(slots: TSlots): EventDocWorkspaceResolvedSlots<TSlots> =>
  ('chrome' in slots ? slots : { chrome: eventDocWorkspaceChromeSlot, ...slots }) as EventDocWorkspaceResolvedSlots<TSlots>;

// Takes a workspace definition and returns the parts you need to run one (see
// EventDocWorkspace): one `docs.<key>` node per mounted doc — its bound api plus its
// read surface — with the built-in init/save/cancel/refresh verbs at the root api.
// The per-doc keying is load-bearing: it lets one doc definition mount at n slot
// keys with no verb-name collisions.
export const createEventDocWorkspace = <TSlots extends EventDocWorkspaceSlotsConfig>(
  definition: EventDocWorkspaceDefinition<TSlots>,
): EventDocWorkspace<EventDocWorkspaceResolvedSlots<TSlots>> => {
  const slots = resolveWorkspaceSlots(definition.slots);

  const slotsConfig = slots as EventDocWorkspaceSlotsConfig;
  const slotEntries = Object.entries(slotsConfig);
  const documentSlotKeys = slotEntries.filter(([, slot]) => slot.kind === EventDocWorkspaceSlotKind.document).map(([slotKey]) => slotKey);
  const localSlotKeys = slotEntries.filter(([, slot]) => slot.kind === EventDocWorkspaceSlotKind.local).map(([slotKey]) => slotKey);

  // Built BEFORE the bindings: each slot's binding closes over its memoized view
  // selector to answer askEventDocReadState. Kind-major internally; regrouped
  // per-doc below.
  const selectors = createEventDocWorkspaceSelectors(slots);
  const selectorMap = <T>(keyed: unknown) => keyed as Record<string, (state: EventDocWorkspaceState) => T>;

  const docs = Object.fromEntries(
    slotEntries.map(([slotKey, slot]) => [
      slotKey,
      {
        api: bindEventDocWorkspaceApi(getSlotBinding(slotKey, slot, selectorMap(selectors.view)[slotKey]), slot.api),
        view: selectorMap(selectors.view)[slotKey],
        liveEvents: selectorMap(selectors.liveEvents)[slotKey],
        slotState: selectorMap(selectors.slotState)[slotKey],
      },
    ]),
  ) as EventDocWorkspace<EventDocWorkspaceResolvedSlots<TSlots>>['docs'];

  return {
    docs,
    api: createEventDocWorkspaceBuiltInApi(definition.transport, documentSlotKeys, localSlotKeys),
    reducer: createEventDocWorkspaceReducer(slotsConfig),
    createInitialState: () => createInitialEventDocWorkspaceState(slotsConfig),
    createSnapshot: (state: EventDocWorkspaceState) => createEventDocWorkspaceSnapshot(state, documentSlotKeys, localSlotKeys),
    selectors: {
      isDirty: selectors.isDirty,
      isLoading: selectors.isLoading,
      isSaving: selectors.isSaving,
      error: selectors.error,
    },
  };
};
