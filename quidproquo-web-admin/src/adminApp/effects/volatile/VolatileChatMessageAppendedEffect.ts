import { Effect } from 'quidproquo-core';

import { LogChatMessage } from '../../../types/LogChatMessage';
import { VolatileEffect } from './VolatileEffect';

export type VolatileChatMessageAppendedPayload = {
  correlationId: string;
  message: LogChatMessage;
};

export type VolatileChatMessageAppendedEffect = Effect<VolatileEffect.chatMessageAppended, VolatileChatMessageAppendedPayload>;
