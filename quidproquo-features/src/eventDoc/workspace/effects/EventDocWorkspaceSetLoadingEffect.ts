import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetLoadingPayload = {
  slotKey: string;
  isLoading: boolean;
};

export type EventDocWorkspaceSetLoadingEffect = Effect<EventDocWorkspaceEffect.SetLoading, EventDocWorkspaceSetLoadingPayload>;
