import { EventDocWorkspaceSelectors } from '../types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotConfig } from '../types/EventDocWorkspaceSlotConfig';
import { EventDocWorkspaceSlotsConfig } from '../types/EventDocWorkspaceSlotsConfig';
import { createSlotLiveEventsSelector } from './createSlotLiveEventsSelector';
import { createSlotStateSelector } from './createSlotStateSelector';
import { createSlotViewSelector } from './createSlotViewSelector';
import { selectEventDocWorkspaceError } from './selectEventDocWorkspaceError';
import { selectEventDocWorkspaceIsDirty } from './selectEventDocWorkspaceIsDirty';
import { selectEventDocWorkspaceIsLoading } from './selectEventDocWorkspaceIsLoading';
import { selectEventDocWorkspaceIsSaving } from './selectEventDocWorkspaceIsSaving';

const mapSlots = <T>(
  slots: EventDocWorkspaceSlotsConfig,
  createSelector: (slotKey: string, slot: EventDocWorkspaceSlotConfig) => T,
): Record<string, T> => Object.fromEntries(Object.entries(slots).map(([slotKey, slot]) => [slotKey, createSelector(slotKey, slot)]));

// Assembles the keyed per-slot selectors plus the workspace aggregates. Built per
// workspace so each slot's view selector owns its own fold cache.
export const createEventDocWorkspaceSelectors = <TSlots extends EventDocWorkspaceSlotsConfig>(slots: TSlots): EventDocWorkspaceSelectors<TSlots> =>
  ({
    liveEvents: mapSlots(slots, createSlotLiveEventsSelector),
    view: mapSlots(slots, createSlotViewSelector),
    slotState: mapSlots(slots, createSlotStateSelector),
    isDirty: selectEventDocWorkspaceIsDirty,
    isLoading: selectEventDocWorkspaceIsLoading,
    isSaving: selectEventDocWorkspaceIsSaving,
    error: selectEventDocWorkspaceError,
  }) as EventDocWorkspaceSelectors<TSlots>;
