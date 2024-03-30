import { AskResponse, QpqPagedData, askDateNow } from 'quidproquo-core';
import { LogChatMessage } from '../domain';

import * as logChatMessageData from '../data/logChatMessageData';

export function* askGetLogChatMessages(
  correlationId: string,
  nextPageKey?: string,
): AskResponse<QpqPagedData<LogChatMessage>> {
  const messages = yield* logChatMessageData.askGetAllLogChatMessages(correlationId, nextPageKey);

  return messages;
}
