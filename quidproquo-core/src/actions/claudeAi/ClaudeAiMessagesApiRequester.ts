import Anthropic from '@anthropic-ai/sdk';

import { createErrorEnumForAction } from '../../types';
import { ClaudeAiActionType } from './ClaudeAiActionType';
import { ClaudeAiMessagesApiActionRequester } from './ClaudeAiMessagesApiActionTypes';

export const ClaudeAiMessagesApiErrorTypeEnum = createErrorEnumForAction(ClaudeAiActionType.MessagesApi, [
  'Unauthorized', // the API key is missing or invalid (401)
  'PermissionDenied', // the API key lacks permission for this request (403)
  'InvalidRequest', // the request body was rejected as malformed or invalid (400 / 422)
  'RateLimited', // the Anthropic API is rate limiting; the caller should back off and retry later (429)
  'ServerError', // the Anthropic API returned a server error; a retry may succeed (5xx)
  'ConnectionError', // could not reach the Anthropic API (network failure or timeout)
]);

export function* askClaudeAiMessagesApi(
  body: Anthropic.Messages.MessageCreateParamsNonStreaming,
  apiKey: string,
): ClaudeAiMessagesApiActionRequester {
  return yield {
    type: ClaudeAiActionType.MessagesApi,
    payload: { body, apiKey },
  };
}
