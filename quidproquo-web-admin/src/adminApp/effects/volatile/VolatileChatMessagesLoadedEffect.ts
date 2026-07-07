import { Effect } from 'quidproquo-core';

import { LogChatMessage } from '../../../types/LogChatMessage';
import { VolatileEffect } from './VolatileEffect';

export type VolatileChatMessagesLoadedPayload = {
  correlationId: string;
  messages: LogChatMessage[];
  nextPageKey?: string;
};

export type VolatileChatMessagesLoadedEffect = Effect<VolatileEffect.chatMessagesLoaded, VolatileChatMessagesLoadedPayload>;
