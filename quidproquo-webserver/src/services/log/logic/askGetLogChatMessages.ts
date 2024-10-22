import { AskResponse, QpqPagedData } from 'quidproquo-core';
import { LogChatMessage } from '../entry/domain';

import * as logChatMessageData from '../entry/data/logChatMessageData';

export function* askGetLogChatMessages(correlationId: string, nextPageKey?: string): AskResponse<QpqPagedData<LogChatMessage>> {
  const messages = yield* logChatMessageData.askGetAllLogChatMessages(correlationId, nextPageKey);

  return messages;
}
