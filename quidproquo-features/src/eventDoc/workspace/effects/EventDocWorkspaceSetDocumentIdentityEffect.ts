import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceDocumentIdentity } from '../types/EventDocWorkspaceDocumentIdentity';
import { EventDocWorkspaceEffect } from './EventDocWorkspaceEffect';

export type EventDocWorkspaceSetDocumentIdentityPayload = {
  slotKey: string;
  documentIdentity: EventDocWorkspaceDocumentIdentity;
};

export type EventDocWorkspaceSetDocumentIdentityEffect = Effect<
  EventDocWorkspaceEffect.setDocumentIdentity,
  EventDocWorkspaceSetDocumentIdentityPayload
>;
