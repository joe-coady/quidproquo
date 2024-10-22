import { ClaudeAiMessagesApiActionRequester } from './ClaudeAiMessagesApiActionTypes';
import { ClaudeAiActionType } from './ClaudeAiActionType';
import Anthropic from '@anthropic-ai/sdk';

export function* askClaudeAiMessagesApi(
  body: Anthropic.Messages.MessageCreateParamsNonStreaming,
  apiKey: string,
): ClaudeAiMessagesApiActionRequester {
  return yield {
    type: ClaudeAiActionType.MessagesApi,
    payload: { body, apiKey },
  };
}
