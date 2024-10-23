import { askMapParallelBatch,AskResponse, StoryResultMetadata } from 'quidproquo-core';

import { websocketConnectionData } from '../../data';
import { askSendMessage } from './askSendMessage';
import { WebSocketAdminServerEventMessageLogMetadata, WebsocketAdminServerMessageEventType } from './serverMessages';

export function* askSendLogToAdmins(log: StoryResultMetadata) {
  const logMessage: WebSocketAdminServerEventMessageLogMetadata = {
    type: WebsocketAdminServerMessageEventType.LogMetadata,
    payload: {
      log,
    },
  };

  const connections = yield* websocketConnectionData.askGetAdminConnections();

  yield* askMapParallelBatch(connections, 10, function* askSendLogOnConnection(connection): AskResponse<void> {
    yield* askSendMessage(connection.id, logMessage);
  });
}
