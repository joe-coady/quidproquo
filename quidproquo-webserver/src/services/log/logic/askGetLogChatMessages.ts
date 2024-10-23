import { AskResponse, QpqPagedData } from 'quidproquo-core';

import * as logChatMessageData from '../entry/data/logChatMessageData';
import { LogChatMessage } from '../entry/domain';

export function* askGetLogChatMessages(correlationId: string, nextPageKey?: string): AskResponse<QpqPagedData<LogChatMessage>> {
  const messages = yield* logChatMessageData.askGetAllLogChatMessages(correlationId, nextPageKey);

  return messages;
}
