import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiPromptActionRequester } from './AiPromptActionTypes';

export interface AskAiPromptOptions {
  system?: string;
  aiName?: string;
  messages?: AiMessage[];
}

export function* askAiPrompt(
  model: AiModel,
  prompt: string,
  options?: AskAiPromptOptions,
): AiPromptActionRequester {
  return yield {
    type: AiActionType.Prompt,
    payload: {
      model,
      prompt,
      messages: options?.messages,
      system: options?.system,
      aiName: options?.aiName,
    },
  };
}
