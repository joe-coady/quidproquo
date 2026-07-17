import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceSlotError } from '../types/EventDocWorkspaceSlotError';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetErrorPayload = {
  slotKey: string;
  error: EventDocWorkspaceSlotError;
};

export type EventDocWorkspaceSetErrorEffect = Effect<EventDocWorkspaceEffect.SetError, EventDocWorkspaceSetErrorPayload>;
