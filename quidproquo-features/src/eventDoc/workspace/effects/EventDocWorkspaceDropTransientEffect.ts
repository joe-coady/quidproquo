import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

// Drop one transient key across EVERY slot: the key is the unit you drop (usually a
// websocket connection id), so a dead connection takes all its observations with it
// and the folded views revert reactively.
export type EventDocWorkspaceDropTransientPayload = {
  transientKey: string;
};

export type EventDocWorkspaceDropTransientEffect = Effect<EventDocWorkspaceEffect.DropTransient, EventDocWorkspaceDropTransientPayload>;
