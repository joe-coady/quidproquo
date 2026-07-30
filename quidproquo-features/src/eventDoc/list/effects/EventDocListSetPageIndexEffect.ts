import { Effect, Nullable } from 'quidproquo-core';

import { EventDocListEffect } from './EventDocListEffect';

export type EventDocListSetPageIndexPayload = {
  pageIndex: number;
  // The cursor that loads this page. Recorded so Previous can come back to it later.
  cursor: Nullable<string>;
};

export type EventDocListSetPageIndexEffect = Effect<EventDocListEffect.SetPageIndex, EventDocListSetPageIndexPayload>;
