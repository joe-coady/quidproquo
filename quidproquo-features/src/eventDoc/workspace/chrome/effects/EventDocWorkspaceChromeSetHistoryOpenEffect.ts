import { Effect } from 'quidproquo-core';

import { EventDocWorkspaceChromeEffect } from './EventDocWorkspaceChromeEffect';

export type EventDocWorkspaceChromeSetHistoryOpenPayload = {
  open: boolean;
};

export type EventDocWorkspaceChromeSetHistoryOpenEffect = Effect<
  EventDocWorkspaceChromeEffect.SetHistoryOpen,
  EventDocWorkspaceChromeSetHistoryOpenPayload
>;
