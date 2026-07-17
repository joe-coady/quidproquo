import { Effect, Nullable } from 'quidproquo-core';

import { EventDocWorkspaceChromeEffect } from './EventDocWorkspaceChromeEffect';

export type EventDocWorkspaceChromeSetHistorySlotKeyPayload = {
  slotKey: Nullable<string>;
};

export type EventDocWorkspaceChromeSetHistorySlotKeyEffect = Effect<
  EventDocWorkspaceChromeEffect.SetHistorySlotKey,
  EventDocWorkspaceChromeSetHistorySlotKeyPayload
>;
