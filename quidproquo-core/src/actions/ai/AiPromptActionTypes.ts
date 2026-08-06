import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiReasoningConfig } from './AiReasoningConfig';

export interface AiPromptActionPayload {
  model: AiModel;
  prompt: string;
  messages?: AiMessage[];
  system?: string;
  aiName?: string;
  reasoning?: AiReasoningConfig;
  caching?: boolean;
}

export interface AiPromptActionResult {
  text: string;
}
