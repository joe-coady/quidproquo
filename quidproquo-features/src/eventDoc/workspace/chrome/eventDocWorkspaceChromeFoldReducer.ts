import { buildEffectReducer, Effect, QpqReducer } from 'quidproquo-core';

import { EventDocEvent, EventDocEventPayload } from '../../models';
import { EventDocWorkspaceChromeSetHistorySlotKeyData } from './types/EventDocWorkspaceChromeSetHistorySlotKeyData';
import { EventDocWorkspaceChromeSetOpenData } from './types/EventDocWorkspaceChromeSetOpenData';
import { EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';
import { EventDocWorkspaceChromeEvent } from './EventDocWorkspaceChromeEvent';

type EventDocWorkspaceChromeEffects =
  | Effect<EventDocWorkspaceChromeEvent.setHistoryOpen, EventDocEventPayload<EventDocWorkspaceChromeSetOpenData>>
  | Effect<EventDocWorkspaceChromeEvent.setHelpOpen, EventDocEventPayload<EventDocWorkspaceChromeSetOpenData>>
  | Effect<EventDocWorkspaceChromeEvent.setHistorySlotKey, EventDocEventPayload<EventDocWorkspaceChromeSetHistorySlotKeyData>>;

// The slice reducer speaks its own effect union; slots speak the generic
// EventDocEvent, hence the cast at the registration boundary (same convention as the
// version-routed document folds).
export const eventDocWorkspaceChromeFoldReducer = buildEffectReducer<EventDocWorkspaceChromeState, EventDocWorkspaceChromeEffects>({
  [EventDocWorkspaceChromeEvent.setHistoryOpen]: (state, payload) => ({ ...state, historyOpen: payload.data.open }),
  [EventDocWorkspaceChromeEvent.setHelpOpen]: (state, payload) => ({ ...state, helpOpen: payload.data.open }),
  [EventDocWorkspaceChromeEvent.setHistorySlotKey]: (state, payload) => ({ ...state, historySlotKey: payload.data.slotKey }),
}) as QpqReducer<EventDocWorkspaceChromeState, EventDocEvent>;
