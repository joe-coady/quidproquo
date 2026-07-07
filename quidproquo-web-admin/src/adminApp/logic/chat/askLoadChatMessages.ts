import { AskResponse, QpqPagedData } from 'quidproquo-core';

import { askPlatformRequest } from '../../../platformLogic/network/askPlatformRequest';
import { ListLogChatMessages } from '../../../types/ListLogChatMessages';
import { LogChatMessage } from '../../../types/LogChatMessage';
import { askUIVolatileChatMessagesLoaded } from '../../actionCreators/volatile/askUIVolatileChatMessagesLoaded';

// Loads the chat history for a correlation into the volatile cache (server
// data incl. AI replies — not session intent).
export function* askLoadChatMessages(correlationId: string): AskResponse<void> {
  const body: ListLogChatMessages = { correlationId };

  const response = yield* askPlatformRequest<ListLogChatMessages, QpqPagedData<LogChatMessage>>('POST', '/log/chat', { body });

  if (response.status < 200 || response.status >= 300) {
    return;
  }

  yield* askUIVolatileChatMessagesLoaded(correlationId, response.data.items, response.data.nextPageKey);
}
