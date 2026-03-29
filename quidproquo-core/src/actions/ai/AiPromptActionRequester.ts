import { AiActionType } from './AiActionType';
import { AiModel } from './AiModel';
import { AiPromptActionRequester } from './AiPromptActionTypes';

export interface AskAiPromptOptions {
  system?: string;
  aiName?: string;
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
      system: options?.system,
      aiName: options?.aiName,
    },
  };
}
