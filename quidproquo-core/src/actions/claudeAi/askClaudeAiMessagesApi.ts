import Anthropic from '@anthropic-ai/sdk';

import { createActionRequester } from '../../types';
import { ClaudeAiActionType } from './ClaudeAiActionType';

export const askClaudeAiMessagesApi = createActionRequester<Anthropic.Message>()({
  actionType: ClaudeAiActionType.MessagesApi,
  errorTypes: [
    'Unauthorized', // the API key is missing or invalid (401)
    'PermissionDenied', // the API key lacks permission for this request (403)
    'InvalidRequest', // the request body was rejected as malformed or invalid (400 / 422)
    'RateLimited', // the Anthropic API is rate limiting; the caller should back off and retry later (429)
    'ServerError', // the Anthropic API returned a server error; a retry may succeed (5xx)
    'ConnectionError', // could not reach the Anthropic API (network failure or timeout)
  ],
  getPayload: (body: Anthropic.Messages.MessageCreateParamsNonStreaming, apiKey: string) => ({ body, apiKey }),
});
