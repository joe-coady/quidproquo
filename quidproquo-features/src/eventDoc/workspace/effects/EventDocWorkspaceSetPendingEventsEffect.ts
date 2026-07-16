import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetPendingEventsPayload = {
  slotKey: string;
  events: EventDocEvent[];
};

export type EventDocWorkspaceSetPendingEventsEffect = Effect<EventDocWorkspaceEffect.setPendingEvents, EventDocWorkspaceSetPendingEventsPayload>;
