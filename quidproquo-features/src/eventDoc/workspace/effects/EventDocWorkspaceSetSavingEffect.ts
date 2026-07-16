import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetSavingPayload = {
  slotKey: string;
  isSaving: boolean;
};

export type EventDocWorkspaceSetSavingEffect = Effect<EventDocWorkspaceEffect.setSaving, EventDocWorkspaceSetSavingPayload>;
