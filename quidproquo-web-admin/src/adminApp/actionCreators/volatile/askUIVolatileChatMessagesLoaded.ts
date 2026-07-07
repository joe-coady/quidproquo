import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { LogChatMessage } from '../../../types/LogChatMessage';
import { VolatileChatMessagesLoadedEffect } from '../../effects/volatile/VolatileChatMessagesLoadedEffect';
import { VolatileEffect } from '../../effects/volatile/VolatileEffect';

export function* askUIVolatileChatMessagesLoaded(correlationId: string, messages: LogChatMessage[], nextPageKey?: string): AskResponse<void> {
  yield* askStateDispatchEffect<VolatileChatMessagesLoadedEffect>(VolatileEffect.chatMessagesLoaded, { correlationId, messages, nextPageKey });
}
