import { createActionRequester } from '../../types';
import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiReasoningConfig } from './AiReasoningConfig';

export type AskAiPromptOptions = {
  system?: string;
  aiName?: string;
  messages?: AiMessage[];
  reasoning?: AiReasoningConfig;
  caching?: boolean;
};

export interface AiPromptActionResult {
  text: string;
}

export const askAiPrompt = createActionRequester<AiPromptActionResult>()({
  actionType: AiActionType.Prompt,
  getPayload: (model: AiModel, prompt: string, options?: AskAiPromptOptions) => ({
    model,
    prompt,
    messages: options?.messages,
    system: options?.system,
    aiName: options?.aiName,
    reasoning: options?.reasoning,
    caching: options?.caching,
  }),
});
