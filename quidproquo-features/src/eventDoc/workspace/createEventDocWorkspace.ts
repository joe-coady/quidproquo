import { defaultEventDocEventValidator } from '../validation';
import { eventDocWorkspaceChromeSlot } from './chrome/eventDocWorkspaceChromeSlot';
import { reservedEventDocWorkspaceCoalesceEventTypes } from './constants/reservedEventDocWorkspaceCoalesceEventTypes';
import { bindEventDocWorkspaceApi } from './logic/bindEventDocWorkspaceApi';
import { createEventDocWorkspaceBuiltInApi } from './logic/createEventDocWorkspaceBuiltInApi';
import { createEventDocWorkspaceReducer } from './reducer/createEventDocWorkspaceReducer';
import { createEventDocWorkspaceSelectors } from './selectors/createEventDocWorkspaceSelectors';
import { EventDocWorkspaceCoalesceRules } from './types/EventDocWorkspaceCoalesceRules';
import { EventDocWorkspaceDefinition } from './types/EventDocWorkspaceDefinition';
import { EventDocWorkspaceSlotBinding } from './types/EventDocWorkspaceSlotBinding';
import { EventDocWorkspaceSlotConfig } from './types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotKind } from './types/EventDocWorkspaceSlotKind';
import { EventDocWorkspaceSlotsConfig } from './types/EventDocWorkspaceSlotsConfig';
import { createInitialEventDocWorkspaceState } from './types/EventDocWorkspaceState';
import { EventDocWorkspace, EventDocWorkspaceResolvedSlots } from './EventDocWorkspace';

const getSlotCoalesceRules = (slot: EventDocWorkspaceSlotConfig): EventDocWorkspaceCoalesceRules =>
  slot.kind === EventDocWorkspaceSlotKind.document
    ? [...reservedEventDocWorkspaceCoalesceEventTypes, ...(slot.coalesceEventTypes ?? [])]
    : (slot.coalesceEventTypes ?? 'all');

// Document slots ALWAYS get a validator: an unconfigured one falls back to the
// universal lifecycle guard (published = CREATE_DRAFT only), so a document slot can't
// silently mutate a published document. Local slots default to accept-all.
const getSlotBinding = (slotKey: string, slot: EventDocWorkspaceSlotConfig): EventDocWorkspaceSlotBinding => ({
  slotKey,
  isPending: slot.kind === EventDocWorkspaceSlotKind.document,
  schemaVersion: slot.schemaVersion ?? 1,
  validate: slot.kind === EventDocWorkspaceSlotKind.document ? (slot.validate ?? defaultEventDocEventValidator) : (slot.validate ?? null),
});

const resolveWorkspaceSlots = <TSlots extends EventDocWorkspaceSlotsConfig>(slots: TSlots): EventDocWorkspaceResolvedSlots<TSlots> =>
  ('chrome' in slots ? slots : { chrome: eventDocWorkspaceChromeSlot, ...slots }) as EventDocWorkspaceResolvedSlots<TSlots>;

// Takes a workspace definition and returns the parts you need to run one (see
// EventDocWorkspace). The api keying is load-bearing: it lets one domain api mount at
// n slot keys with no verb-name collisions.
export const createEventDocWorkspace = <TSlots extends EventDocWorkspaceSlotsConfig>(
  definition: EventDocWorkspaceDefinition<TSlots>,
): EventDocWorkspace<EventDocWorkspaceResolvedSlots<TSlots>> => {
  const slots = resolveWorkspaceSlots(definition.slots);

  if ('workspace' in slots) {
    throw new Error("'workspace' is a reserved slot key (it holds the built-in init/save/cancel/refresh verbs) - rename the slot.");
  }

  const slotEntries = Object.entries(slots as EventDocWorkspaceSlotsConfig);
  const documentSlotKeys = slotEntries.filter(([, slot]) => slot.kind === EventDocWorkspaceSlotKind.document).map(([slotKey]) => slotKey);

  const coalesceRulesBySlot = Object.fromEntries(slotEntries.map(([slotKey, slot]) => [slotKey, getSlotCoalesceRules(slot)]));

  const boundApis = Object.fromEntries(
    slotEntries.map(([slotKey, slot]) => [slotKey, bindEventDocWorkspaceApi(getSlotBinding(slotKey, slot), slot.api)]),
  );

  return {
    api: {
      ...boundApis,
      workspace: createEventDocWorkspaceBuiltInApi(definition.transport, documentSlotKeys),
    } as EventDocWorkspace<EventDocWorkspaceResolvedSlots<TSlots>>['api'],
    reducer: createEventDocWorkspaceReducer(coalesceRulesBySlot),
    createInitialState: () => createInitialEventDocWorkspaceState(Object.keys(slots)),
    selectors: createEventDocWorkspaceSelectors(slots),
  };
};
