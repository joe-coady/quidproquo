import { buildEffectReducer, QpqReducer } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceEffects } from '../effects/EventDocWorkspaceEffects';
import { EventDocWorkspaceSlotFoldsConfig } from '../types/EventDocWorkspaceSlotFoldsConfig';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';
import { clearError } from './stateUpdaters/clearError';
import { createAppendHistoryEventsUpdater } from './stateUpdaters/createAppendHistoryEventsUpdater';
import { createAppendHistoryEventUpdater } from './stateUpdaters/createAppendHistoryEventUpdater';
import { createApplyEventUpdater } from './stateUpdaters/createApplyEventUpdater';
import { createApplyTransientEventUpdater } from './stateUpdaters/createApplyTransientEventUpdater';
import { createResetUpdater } from './stateUpdaters/createResetUpdater';
import { createSetHistoryEventsUpdater } from './stateUpdaters/createSetHistoryEventsUpdater';
import { dropTransient } from './stateUpdaters/dropTransient';
import { removePendingEvent } from './stateUpdaters/removePendingEvent';
import { setDocumentIdentity } from './stateUpdaters/setDocumentIdentity';
import { setError } from './stateUpdaters/setError';
import { setLoading } from './stateUpdaters/setLoading';
import { setPendingEvents } from './stateUpdaters/setPendingEvents';
import { setSaving } from './stateUpdaters/setSaving';
import { getSlotCoalesceRules } from './getSlotCoalesceRules';

// One runtime reducer: route workspace effects into the right keyed slot. Built per
// workspace (closured over the slot configs) by createEventDocWorkspace. The
// history-writing updaters OWN the historyViews fold: every history mutation folds
// into the stored view here, so no selector ever refolds a saved log at read time.
export const createEventDocWorkspaceReducer = (slots: EventDocWorkspaceSlotFoldsConfig): QpqReducer<EventDocWorkspaceState, EventDocWorkspaceEffects> => {
  const coalesceRulesBySlot = Object.fromEntries(Object.entries(slots).map(([slotKey, slot]) => [slotKey, getSlotCoalesceRules(slot)]));

  return buildEffectReducer<EventDocWorkspaceState, EventDocWorkspaceEffects>({
    [EventDocWorkspaceEffect.ApplyEvent]: createApplyEventUpdater(coalesceRulesBySlot),
    [EventDocWorkspaceEffect.ApplyTransientEvent]: createApplyTransientEventUpdater(coalesceRulesBySlot),
    [EventDocWorkspaceEffect.DropTransient]: dropTransient,
    [EventDocWorkspaceEffect.SetHistoryEvents]: createSetHistoryEventsUpdater(slots),
    [EventDocWorkspaceEffect.AppendHistoryEvent]: createAppendHistoryEventUpdater(slots),
    [EventDocWorkspaceEffect.AppendHistoryEvents]: createAppendHistoryEventsUpdater(slots),
    [EventDocWorkspaceEffect.SetPendingEvents]: setPendingEvents,
    [EventDocWorkspaceEffect.RemovePendingEvent]: removePendingEvent,
    [EventDocWorkspaceEffect.SetDocumentIdentity]: setDocumentIdentity,
    [EventDocWorkspaceEffect.SetLoading]: setLoading,
    [EventDocWorkspaceEffect.SetSaving]: setSaving,
    [EventDocWorkspaceEffect.SetError]: setError,
    [EventDocWorkspaceEffect.ClearError]: clearError,
    [EventDocWorkspaceEffect.Reset]: createResetUpdater(slots),
  });
};
