import { askKeyValueStoreQuery, askKeyValueStoreUpsert, AskResponse, kvsEqual, QpqPagedData } from 'quidproquo-core';
import { LogChatMessage, LogMetadata } from '../domain';

const logChatMessageStoreName = 'qpq-log-messages';

export function* askUpsert(logChatMessage: LogChatMessage): AskResponse<LogChatMessage> {
  yield* askKeyValueStoreUpsert(logChatMessageStoreName, logChatMessage);

  return logChatMessage;
}

export function* askGetAllLogChatMessages(correlationId: string, nextPageKey?: string): AskResponse<QpqPagedData<LogChatMessage>> {
  const logs = yield* askKeyValueStoreQuery<LogChatMessage>(logChatMessageStoreName, kvsEqual('correlationId', correlationId), {
    nextPageKey,
  });

  return logs;
}
