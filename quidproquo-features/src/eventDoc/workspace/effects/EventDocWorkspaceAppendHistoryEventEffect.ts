import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceAppendHistoryEventPayload = {
  slotKey: string;
  event: EventDocEvent;
};

export type EventDocWorkspaceAppendHistoryEventEffect = Effect<
  EventDocWorkspaceEffect.appendHistoryEvent,
  EventDocWorkspaceAppendHistoryEventPayload
>;
