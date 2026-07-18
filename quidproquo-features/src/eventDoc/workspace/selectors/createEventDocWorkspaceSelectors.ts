import { eventDocWorkspaceChromeSlotFold } from '../chrome/eventDocWorkspaceChromeSlotFold';
import { EventDocWorkspaceResolvedFoldSlots } from '../types/EventDocWorkspaceResolvedFoldSlots';
import { EventDocWorkspaceSelectors } from '../types/EventDocWorkspaceSelectors';
import { EventDocWorkspaceSlotFoldConfig } from '../types/EventDocWorkspaceSlotFoldConfig';
import { EventDocWorkspaceSlotFoldsConfig } from '../types/EventDocWorkspaceSlotFoldsConfig';
import { EventDocWorkspaceSlotKind } from '../types/EventDocWorkspaceSlotKind';
import { createEventDocWorkspaceIsDirtySelector } from './createEventDocWorkspaceIsDirtySelector';
import { createEventDocWorkspaceIsSavingSelector } from './createEventDocWorkspaceIsSavingSelector';
import { createSlotLiveEventsSelector } from './createSlotLiveEventsSelector';
import { createSlotStateSelector } from './createSlotStateSelector';
import { createSlotViewSelector } from './createSlotViewSelector';
import { selectEventDocWorkspaceError } from './selectEventDocWorkspaceError';
import { selectEventDocWorkspaceIsLoading } from './selectEventDocWorkspaceIsLoading';

const mapSlots = <T>(
  slots: EventDocWorkspaceSlotFoldsConfig,
  createSelector: (slotKey: string, slot: EventDocWorkspaceSlotFoldConfig) => T,
): Record<string, T> => Object.fromEntries(Object.entries(slots).map(([slotKey, slot]) => [slotKey, createSelector(slotKey, slot)]));

// Assembles the keyed per-slot selectors plus the workspace aggregates. Built per
// workspace so each slot's view selector owns its own pending-fold cache, and so the
// dirty/saving aggregates scope to the document slot keys.
//
// Takes the api-free FOLD configs and resolves the default chrome fold slot itself
// (idempotently — createEventDocWorkspace passes already-resolved slots), so an
// editor can build its selectors in a standalone module that imports no api. Verbs
// read live views through that module; the workspace passes the same instance in
// via its definition, so both share one memoized selector set and the workspace
// module keeps zero inbound edges (no import cycles).
export const createEventDocWorkspaceSelectors = <TSlots extends EventDocWorkspaceSlotFoldsConfig>(
  slots: TSlots,
): EventDocWorkspaceSelectors<EventDocWorkspaceResolvedFoldSlots<TSlots>> => {
  const resolvedSlots: EventDocWorkspaceSlotFoldsConfig = 'chrome' in slots ? slots : { chrome: eventDocWorkspaceChromeSlotFold, ...slots };

  const documentSlotKeys = Object.entries(resolvedSlots)
    .filter(([, slot]) => slot.kind === EventDocWorkspaceSlotKind.document)
    .map(([slotKey]) => slotKey);

  return {
    liveEvents: mapSlots(resolvedSlots, createSlotLiveEventsSelector),
    view: mapSlots(resolvedSlots, createSlotViewSelector),
    slotState: mapSlots(resolvedSlots, createSlotStateSelector),
    isDirty: createEventDocWorkspaceIsDirtySelector(documentSlotKeys),
    isLoading: selectEventDocWorkspaceIsLoading,
    isSaving: createEventDocWorkspaceIsSavingSelector(documentSlotKeys),
    error: selectEventDocWorkspaceError,
  } as EventDocWorkspaceSelectors<EventDocWorkspaceResolvedFoldSlots<TSlots>>;
};
