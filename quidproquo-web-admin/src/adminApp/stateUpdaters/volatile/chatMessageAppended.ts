import { VolatileChatMessageAppendedPayload } from '../../effects/volatile/VolatileChatMessageAppendedEffect';
import { VolatileState } from '../../VolatileState';

export const chatMessageAppended = (state: VolatileState, payload: VolatileChatMessageAppendedPayload): VolatileState => {
  const current = state.chatByCorrelation[payload.correlationId] ?? { messages: [], pendingReplies: 0 };

  return {
    ...state,
    chatByCorrelation: {
      ...state.chatByCorrelation,
      [payload.correlationId]: {
        ...current,
        messages: [...current.messages, payload.message],
      },
    },
  };
};
