import { AiActionType } from './AiActionType';
import { AiModel } from './AiModel';
import { AiPromptStreamActionRequester } from './AiPromptStreamActionTypes';

export interface AskAiPromptStreamOptions {
  system?: string;
  aiName?: string;
}

export function* askAiPromptStream(
  model: AiModel,
  prompt: string,
  options?: AskAiPromptStreamOptions,
): AiPromptStreamActionRequester {
  return yield {
    type: AiActionType.PromptStream,
    payload: {
      model,
      prompt,
      system: options?.system,
      aiName: options?.aiName,
    },
  };
}
