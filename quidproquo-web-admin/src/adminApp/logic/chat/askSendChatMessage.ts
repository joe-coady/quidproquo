import { askDateNow, AskResponse } from 'quidproquo-core';

import { askPlatformRequest } from '../../../platformLogic/network/askPlatformRequest';
import { LogChatMessage } from '../../../types/LogChatMessage';
import { SendLogChatMessage } from '../../../types/SendLogChatMessage';
import { askUIVolatileChatMessageAppended } from '../../actionCreators/volatile/askUIVolatileChatMessageAppended';
import { askUIVolatileChatPendingReplyChanged } from '../../actionCreators/volatile/askUIVolatileChatPendingReplyChanged';
import { askApplySessionEvent } from '../../actions/askApplySessionEvent';
import { AdminSessionEventType } from '../../effects/session/AdminSessionEventType';
import { ChatMessageSentData } from '../../effects/session/ChatMessageSentEvent';

// The user's message is session intent (audited); the AI reply is server data
// (volatile). The user message is appended optimistically before the POST.
export function* askSendChatMessage(correlationId: string, message: string): AskResponse<void> {
  if (!message.trim()) {
    return;
  }

  yield* askApplySessionEvent<ChatMessageSentData>(AdminSessionEventType.chatMessageSent, { correlationId, message });

  const timestamp = yield* askDateNow();
  const userMessage: LogChatMessage = { message, timestamp, isAi: false };
  yield* askUIVolatileChatMessageAppended(correlationId, userMessage);

  yield* askUIVolatileChatPendingReplyChanged(correlationId, 1);

  const body: SendLogChatMessage = { correlationId, message };
  const response = yield* askPlatformRequest<SendLogChatMessage, LogChatMessage>('POST', '/log/chat/message', { body });

  yield* askUIVolatileChatPendingReplyChanged(correlationId, -1);

  if (response.status < 200 || response.status >= 300) {
    return;
  }

  yield* askUIVolatileChatMessageAppended(correlationId, response.data);
}
