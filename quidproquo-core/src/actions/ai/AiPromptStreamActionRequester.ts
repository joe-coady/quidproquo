import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiPromptStreamActionRequester } from './AiPromptStreamActionTypes';
import { AiReasoningConfig } from './AiReasoningConfig';

export interface AskAiPromptStreamOptions {
  system?: string;
  aiName?: string;
  messages?: AiMessage[];
  reasoning?: AiReasoningConfig;
  caching?: boolean;
}

export function* askAiPromptStream(model: AiModel, prompt: string, options?: AskAiPromptStreamOptions): AiPromptStreamActionRequester {
  return yield {
    type: AiActionType.PromptStream,
    payload: {
      model,
      prompt,
      messages: options?.messages,
      system: options?.system,
      aiName: options?.aiName,
      reasoning: options?.reasoning,
      caching: options?.caching,
    },
  };
}
