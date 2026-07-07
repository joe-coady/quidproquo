import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { LogChatMessage } from '../../../types/LogChatMessage';
import { VolatileChatMessageAppendedEffect } from '../../effects/volatile/VolatileChatMessageAppendedEffect';
import { VolatileEffect } from '../../effects/volatile/VolatileEffect';

export function* askUIVolatileChatMessageAppended(correlationId: string, message: LogChatMessage): AskResponse<void> {
  yield* askStateDispatchEffect<VolatileChatMessageAppendedEffect>(VolatileEffect.chatMessageAppended, { correlationId, message });
}
