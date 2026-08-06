import Anthropic from '@anthropic-ai/sdk';

import { ClaudeAiActionType } from './ClaudeAiActionType';

// Payload
export interface ClaudeAiMessagesApiActionPayload {
  body: Anthropic.Messages.MessageCreateParamsNonStreaming;
  apiKey: string;
}
