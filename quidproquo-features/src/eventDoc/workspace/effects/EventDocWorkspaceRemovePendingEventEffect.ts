import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceRemovePendingEventPayload = {
  slotKey: string;
  clientMessageId: string;
};

export type EventDocWorkspaceRemovePendingEventEffect = Effect<
  EventDocWorkspaceEffect.RemovePendingEvent,
  EventDocWorkspaceRemovePendingEventPayload
>;
