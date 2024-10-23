import Anthropic from '@anthropic-ai/sdk';

import { ClaudeAiActionType } from './ClaudeAiActionType';
import { ClaudeAiMessagesApiActionRequester } from './ClaudeAiMessagesApiActionTypes';

export function* askClaudeAiMessagesApi(
  body: Anthropic.Messages.MessageCreateParamsNonStreaming,
  apiKey: string,
): ClaudeAiMessagesApiActionRequester {
  return yield {
    type: ClaudeAiActionType.MessagesApi,
    payload: { body, apiKey },
  };
}
