import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetHistoryEventsPayload = {
  slotKey: string;
  events: EventDocEvent[];
};

export type EventDocWorkspaceSetHistoryEventsEffect = Effect<EventDocWorkspaceEffect.SetHistoryEvents, EventDocWorkspaceSetHistoryEventsPayload>;
