import { VolatileChatMessagesLoadedPayload } from '../../effects/volatile/VolatileChatMessagesLoadedEffect';
import { VolatileState } from '../../VolatileState';

// Replace semantics: a load brings the authoritative history for the chat.
export const chatMessagesLoaded = (state: VolatileState, payload: VolatileChatMessagesLoadedPayload): VolatileState => ({
  ...state,
  chatByCorrelation: {
    ...state.chatByCorrelation,
    [payload.correlationId]: {
      messages: payload.messages,
      nextPageKey: payload.nextPageKey,
      pendingReplies: state.chatByCorrelation[payload.correlationId]?.pendingReplies ?? 0,
    },
  },
});
