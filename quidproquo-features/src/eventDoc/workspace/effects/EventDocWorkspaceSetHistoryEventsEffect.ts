import { Effect, Nullable } from 'quidproquo-core';

import { EventDocEvent, EventDocSnapshotBase } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetHistoryEventsPayload = {
  slotKey: string;
  events: EventDocEvent[];
  // The fold base the events follow from — replaced together with the log so the two
  // can never disagree. Absent/null means the events are the whole log from event zero.
  base?: Nullable<EventDocSnapshotBase>;
};

export type EventDocWorkspaceSetHistoryEventsEffect = Effect<EventDocWorkspaceEffect.SetHistoryEvents, EventDocWorkspaceSetHistoryEventsPayload>;
