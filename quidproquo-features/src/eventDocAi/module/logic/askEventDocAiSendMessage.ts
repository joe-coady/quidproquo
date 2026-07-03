import { askCatch, AskResponse, askStateRead } from 'quidproquo-core';

import { askUIEventDocAiAppendChatMessage } from '../actionCreators/askUIEventDocAiAppendChatMessage';
import { askUIEventDocAiClearStream } from '../actionCreators/askUIEventDocAiClearStream';
import { askUIEventDocAiSetError } from '../actionCreators/askUIEventDocAiSetError';
import { askUIEventDocAiSetSending } from '../actionCreators/askUIEventDocAiSetSending';
import type { EventDocAiState } from '../EventDocAiState';
import { askEventDocAiChatSendRequest } from '../requests/askEventDocAiChatSendRequest';
import { makeEventDocAiMessageFromText } from '../utils/makeEventDocAiMessageFromText';
import { askEventDocAiNewChat } from './askEventDocAiNewChat';

export function* askEventDocAiSendMessage(message: string): AskResponse<void> {
  const { activeChatId } = yield* askStateRead<EventDocAiState>();

  // First message with no chat selected — create one implicitly.
  let chatId = activeChatId;
  if (!chatId) {
    const chat = yield* askEventDocAiNewChat();
    if (!chat) {
      return;
    }
    chatId = chat.chatId;
  }

  yield* askUIEventDocAiSetError(null);

  yield* askUIEventDocAiAppendChatMessage(
    makeEventDocAiMessageFromText('user', message)
  );

  yield* askUIEventDocAiClearStream();
  yield* askUIEventDocAiSetSending(true);

  // The assistant's reply streams in via AppendStreamChunk dispatches while
  // this request is in flight; the finalized message is dispatched by the
  // backend before the request resolves.
  const result = yield* askCatch(
    askEventDocAiChatSendRequest({ chatId, message }),
    askUIEventDocAiSetSending(false)
  );

  yield* askUIEventDocAiClearStream();

  if (!result.success) {
    yield* askUIEventDocAiSetError(result.error.errorText);
  }
}
