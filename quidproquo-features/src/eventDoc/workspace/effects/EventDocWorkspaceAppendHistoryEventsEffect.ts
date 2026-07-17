import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

// Append a fetched TAIL of server events (refresh) so the reducer folds only the tail
// into the stored history view, never the whole log.
export type EventDocWorkspaceAppendHistoryEventsPayload = {
  slotKey: string;
  events: EventDocEvent[];
};

export type EventDocWorkspaceAppendHistoryEventsEffect = Effect<
  EventDocWorkspaceEffect.AppendHistoryEvents,
  EventDocWorkspaceAppendHistoryEventsPayload
>;
