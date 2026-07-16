import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

// The routed commit: coalesce + renumber happen in the reducer so it lands atomically.
export type EventDocWorkspaceApplyEventPayload = {
  slotKey: string;
  isPending: boolean;
  event: EventDocEvent;
};

export type EventDocWorkspaceApplyEventEffect = Effect<EventDocWorkspaceEffect.applyEvent, EventDocWorkspaceApplyEventPayload>;
