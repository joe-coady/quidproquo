import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceClearErrorPayload = {
  slotKey: string;
};

export type EventDocWorkspaceClearErrorEffect = Effect<EventDocWorkspaceEffect.ClearError, EventDocWorkspaceClearErrorPayload>;
