import { Effect } from 'quidproquo-core';

import { VolatileEffect } from './VolatileEffect';

export type VolatileChatPendingReplyChangedPayload = {
  correlationId: string;
  delta: number;
};

export type VolatileChatPendingReplyChangedEffect = Effect<VolatileEffect.chatPendingReplyChanged, VolatileChatPendingReplyChangedPayload>;
