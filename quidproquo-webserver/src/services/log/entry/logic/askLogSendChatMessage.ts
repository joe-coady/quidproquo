import {
  AskResponse,
  askDateNow,
  askDelay,
  askClaudeAiMessagesApi,
  askConfigGetGlobal,
  askConfigGetSecret,
  askCatch,
  askThrowError,
  ErrorTypeEnum,
} from 'quidproquo-core';
import { LogChatMessage } from '../domain';
import { systemPrompt } from '../constants';

import * as logChatMessageData from '../data/logChatMessageData';
import * as logData from '../data/logData';
import Anthropic from '@anthropic-ai/sdk';

export function* askClaudeSendChatMessage(correlationId: string): AskResponse<LogChatMessage> {
  const apiKeySecretName = yield* askConfigGetGlobal('claudeAi-api-key');
  if (!apiKeySecretName) {
    // We need to delay because the messages are keyed off timestamp.
    yield* askDelay(1);

    return yield* askThrowError(ErrorTypeEnum.NotFound, 'Claude API key not found.');
  }

  const allMessages = yield* logChatMessageData.askGetAllLogChatMessages(correlationId);
  const apiKey = yield* askConfigGetSecret(apiKeySecretName);

  const log = yield* logData.askGetByCorrelation(correlationId);
  const logJson = JSON.stringify(log);

  const result = yield* askClaudeAiMessagesApi(
    {
      // model: 'claude-3-opus-20240229',
      model: 'claude-3-haiku-20240307',
      system: systemPrompt,
      max_tokens: 4096,
      temperature: 0,
      messages: allMessages.items.map((msg, index) => {
        const baseMessasges: Anthropic.TextBlock[] =
          index === 0 && logJson
            ? [
                {
                  type: 'text',
                  text: 'Here is my log file:',
                },
                {
                  type: 'text',
                  text: logJson,
                },
              ]
            : [];

        return {
          role: msg.isAi ? 'assistant' : 'user',
          content: [
            ...baseMessasges,
            {
              type: 'text',
              // if its the last message request a response in markdown
              text:
                index === allMessages.items.length - 1 ? `<markdown>${msg.message}` : msg.message,
            },
          ],
        };
      }),
    },

    apiKey,
  );

  return yield* logChatMessageData.askUpsert({
    correlationId: correlationId,
    isAi: true,
    message: result.content[0].text,
    timestamp: yield* askDateNow(),
  });
}

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

  const result = yield* askCatch(askClaudeSendChatMessage(correlationId));

  if (result.success) {
    return result.result;
  } else {
    return yield* logChatMessageData.askUpsert({
      correlationId: correlationId,
      isAi: true,
      message: result.error.errorText,
      timestamp: yield* askDateNow(),
    });
  }
}
