import { AskResponse, askStateDispatchEffect } from 'quidproquo-core';

import { VolatileChatPendingReplyChangedEffect } from '../../effects/volatile/VolatileChatPendingReplyChangedEffect';
import { VolatileEffect } from '../../effects/volatile/VolatileEffect';

export function* askUIVolatileChatPendingReplyChanged(correlationId: string, delta: number): AskResponse<void> {
  yield* askStateDispatchEffect<VolatileChatPendingReplyChangedEffect>(VolatileEffect.chatPendingReplyChanged, { correlationId, delta });
}
