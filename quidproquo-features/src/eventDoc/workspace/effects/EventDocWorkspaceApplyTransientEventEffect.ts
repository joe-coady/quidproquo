import { Effect } from 'quidproquo-core';

import { EventDocEvent } from '../../models';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

// The routed transient commit: into the slot's transient group under `transientKey`
// (the drop unit), never into pending, never saved. Coalescing happens in the reducer
// so it lands atomically, same as the ordinary apply.
export type EventDocWorkspaceApplyTransientEventPayload = {
  slotKey: string;
  transientKey: string;
  event: EventDocEvent;
};

export type EventDocWorkspaceApplyTransientEventEffect = Effect<
  EventDocWorkspaceEffect.ApplyTransientEvent,
  EventDocWorkspaceApplyTransientEventPayload
>;
