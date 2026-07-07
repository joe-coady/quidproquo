import { VolatileChatPendingReplyChangedPayload } from '../../effects/volatile/VolatileChatPendingReplyChangedEffect';
import { VolatileState } from '../../VolatileState';

export const chatPendingReplyChanged = (state: VolatileState, payload: VolatileChatPendingReplyChangedPayload): VolatileState => {
  const current = state.chatByCorrelation[payload.correlationId] ?? { messages: [], pendingReplies: 0 };

  return {
    ...state,
    chatByCorrelation: {
      ...state.chatByCorrelation,
      [payload.correlationId]: {
        ...current,
        pendingReplies: Math.max(0, current.pendingReplies + payload.delta),
      },
    },
  };
};
