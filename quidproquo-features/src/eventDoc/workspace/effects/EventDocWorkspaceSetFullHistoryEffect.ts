import { Effect, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceHistoryPage } from '../types/EventDocWorkspaceHistoryPage';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetFullHistoryPayload = {
  slotKey: string;
  // Replace the on-demand newest-first history wholesale (the latest page, or null to
  // clear). Older pages arrive via AppendFullHistory. A side-channel for consumers that
  // display history (the history dialog) — the slot's working `history` stays base +
  // tail and nothing folds from this.
  history: Nullable<EventDocWorkspaceHistoryPage>;
};

export type EventDocWorkspaceSetFullHistoryEffect = Effect<EventDocWorkspaceEffect.SetFullHistory, EventDocWorkspaceSetFullHistoryPayload>;
