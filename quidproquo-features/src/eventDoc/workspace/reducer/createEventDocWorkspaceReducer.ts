import { buildEffectReducer, QpqReducer } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from '../effects/EventDocWorkspaceEffect';
import { EventDocWorkspaceEffects } from '../effects/EventDocWorkspaceEffects';
import { EventDocWorkspaceCoalesceRules } from '../types/EventDocWorkspaceCoalesceRules';
import { EventDocWorkspaceState } from '../types/EventDocWorkspaceState';
import { appendHistoryEvent } from './stateUpdaters/appendHistoryEvent';
import { createApplyEventUpdater } from './stateUpdaters/createApplyEventUpdater';
import { removePendingEvent } from './stateUpdaters/removePendingEvent';
import { reset } from './stateUpdaters/reset';
import { setDocumentIdentity } from './stateUpdaters/setDocumentIdentity';
import { setError } from './stateUpdaters/setError';
import { setHistoryEvents } from './stateUpdaters/setHistoryEvents';
import { setLoading } from './stateUpdaters/setLoading';
import { setPendingEvents } from './stateUpdaters/setPendingEvents';
import { setSaving } from './stateUpdaters/setSaving';

// One dumb runtime reducer: route workspace effects into the right keyed slot. The
// per-slot fold reducers never run here; they fold streams into views in selectors.
// Built per workspace (closured over each slot's coalesce rules) by
// createEventDocWorkspace.
export const createEventDocWorkspaceReducer = (
  coalesceRulesBySlot: Record<string, EventDocWorkspaceCoalesceRules>,
): QpqReducer<EventDocWorkspaceState, EventDocWorkspaceEffects> =>
  buildEffectReducer<EventDocWorkspaceState, EventDocWorkspaceEffects>({
    [EventDocWorkspaceEffect.ApplyEvent]: createApplyEventUpdater(coalesceRulesBySlot),
    [EventDocWorkspaceEffect.SetHistoryEvents]: setHistoryEvents,
    [EventDocWorkspaceEffect.AppendHistoryEvent]: appendHistoryEvent,
    [EventDocWorkspaceEffect.SetPendingEvents]: setPendingEvents,
    [EventDocWorkspaceEffect.RemovePendingEvent]: removePendingEvent,
    [EventDocWorkspaceEffect.SetDocumentIdentity]: setDocumentIdentity,
    [EventDocWorkspaceEffect.SetLoading]: setLoading,
    [EventDocWorkspaceEffect.SetSaving]: setSaving,
    [EventDocWorkspaceEffect.SetError]: setError,
    [EventDocWorkspaceEffect.Reset]: reset,
  });
