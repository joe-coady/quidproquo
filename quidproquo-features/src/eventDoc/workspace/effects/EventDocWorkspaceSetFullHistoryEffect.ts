import { Effect, Nullable } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetFullHistoryPayload = {
  slotKey: string;
  // The COMPLETE saved log from event zero (null clears it). A side-channel for
  // consumers that need the whole log (the history dialog) — the slot's working
  // `history` stays base + tail and nothing folds from this.
  events: Nullable<EventDocEvent[]>;
};

export type EventDocWorkspaceSetFullHistoryEffect = Effect<EventDocWorkspaceEffect.SetFullHistory, EventDocWorkspaceSetFullHistoryPayload>;
