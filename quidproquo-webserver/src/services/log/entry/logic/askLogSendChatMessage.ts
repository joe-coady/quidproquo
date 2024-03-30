import { AskResponse, askDateNow, askDelay } from 'quidproquo-core';
import { LogChatMessage } from '../domain';

import * as logChatMessageData from '../data/logChatMessageData';

export function* askLogSendChatMessage(
  correlationId: string,
  message: string,
): AskResponse<LogChatMessage> {
  // Write the question to the message history
  yield* logChatMessageData.askUpsert({
    correlationId: correlationId,
    isAi: false,
    message,
    timestamp: yield* askDateNow(),
  });

  yield* askDelay(10);

  return yield* logChatMessageData.askUpsert({
    correlationId: correlationId,
    isAi: true,
    message: `<p>You said: "${message}". I'm just a mock response for now!</p>`,
    timestamp: yield* askDateNow(),
  });
}
