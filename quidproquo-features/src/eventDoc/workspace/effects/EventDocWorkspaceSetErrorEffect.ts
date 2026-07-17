import { Effect, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetErrorPayload = {
  slotKey: string;
  error: Nullable<string>;
};

export type EventDocWorkspaceSetErrorEffect = Effect<EventDocWorkspaceEffect.SetError, EventDocWorkspaceSetErrorPayload>;
