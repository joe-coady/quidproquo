import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

// The routed commit, always into the slot's pending buffer: coalesce + renumber happen
// in the reducer so it lands atomically.
export type EventDocWorkspaceApplyEventPayload = {
  slotKey: string;
  event: EventDocEvent;
};

export type EventDocWorkspaceApplyEventEffect = Effect<EventDocWorkspaceEffect.ApplyEvent, EventDocWorkspaceApplyEventPayload>;
