import { buildEffectReducer, QpqReducer } from 'quidproquo-core';

import { EventDocFoldEffects } from '../../fold/EventDocFoldEffects';
import { EventDocEvent } from '../../models';
import { EventDocWorkspaceChromeEffect } from './effects/EventDocWorkspaceChromeEffect';
import { EventDocWorkspaceChromeEffects } from './effects/EventDocWorkspaceChromeEffects';
import { setHelpOpen } from './stateUpdaters/setHelpOpen';
import { setHistoryOpen } from './stateUpdaters/setHistoryOpen';
import { setHistorySlotKey } from './stateUpdaters/setHistorySlotKey';
import { EventDocWorkspaceChromeState } from './types/EventDocWorkspaceChromeState';

// The slice reducer speaks its own effect union (wrapped to the stored-event shape by
// EventDocFoldEffects); slots speak the generic EventDocEvent, hence the cast at the
// registration boundary (same convention as the version-routed document folds).
export const eventDocWorkspaceChromeFoldReducer = buildEffectReducer<
  EventDocWorkspaceChromeState,
  EventDocFoldEffects<EventDocWorkspaceChromeEffects>
>({
  [EventDocWorkspaceChromeEffect.SetHistoryOpen]: setHistoryOpen,
  [EventDocWorkspaceChromeEffect.SetHelpOpen]: setHelpOpen,
  [EventDocWorkspaceChromeEffect.SetHistorySlotKey]: setHistorySlotKey,
}) as QpqReducer<EventDocWorkspaceChromeState, EventDocEvent>;
