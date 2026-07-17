import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceChromeEffect } from './EventDocWorkspaceChromeEffect';

export type EventDocWorkspaceChromeSetHelpOpenPayload = {
  open: boolean;
};

export type EventDocWorkspaceChromeSetHelpOpenEffect = Effect<EventDocWorkspaceChromeEffect.SetHelpOpen, EventDocWorkspaceChromeSetHelpOpenPayload>;
