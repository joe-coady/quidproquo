import { EventDocWorkspaceSelectors } from '../types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';
import { EventDocWorkspaceSlotsConfig } from '../types/EventDocWorkspaceSlotsConfig';
import { createEventDocWorkspaceIsDirtySelector } from './createEventDocWorkspaceIsDirtySelector';
import { createEventDocWorkspaceIsSavingSelector } from './createEventDocWorkspaceIsSavingSelector';
import { createSlotLiveEventsSelector } from './createSlotLiveEventsSelector';
import { createSlotStateSelector } from './createSlotStateSelector';
import { createSlotViewSelector } from './createSlotViewSelector';
import { selectEventDocWorkspaceError } from './selectEventDocWorkspaceError';
import { selectEventDocWorkspaceIsLoading } from './selectEventDocWorkspaceIsLoading';

const mapSlots = <T>(
  slots: EventDocWorkspaceSlotsConfig,
  createSelector: (slotKey: string, slot: EventDocWorkspaceSlotConfig) => T,
): Record<string, T> => Object.fromEntries(Object.entries(slots).map(([slotKey, slot]) => [slotKey, createSelector(slotKey, slot)]));

// Assembles the keyed per-slot selectors plus the workspace aggregates. Built per
// workspace so each slot's view selector owns its own pending-fold cache, and so the
// dirty/saving aggregates scope to the document slot keys.
export const createEventDocWorkspaceSelectors = <TSlots extends EventDocWorkspaceSlotsConfig>(slots: TSlots): EventDocWorkspaceSelectors<TSlots> => {
  const documentSlotKeys = Object.entries(slots)
    .filter(([, slot]) => slot.kind === EventDocWorkspaceSlotKind.document)
    .map(([slotKey]) => slotKey);

  return {
    liveEvents: mapSlots(slots, createSlotLiveEventsSelector),
    view: mapSlots(slots, createSlotViewSelector),
    slotState: mapSlots(slots, createSlotStateSelector),
    isDirty: createEventDocWorkspaceIsDirtySelector(documentSlotKeys),
    isLoading: selectEventDocWorkspaceIsLoading,
    isSaving: createEventDocWorkspaceIsSavingSelector(documentSlotKeys),
    error: selectEventDocWorkspaceError,
  } as EventDocWorkspaceSelectors<TSlots>;
};
