import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiPromptStreamActionRequester } from './AiPromptStreamActionTypes';

export interface AskAiPromptStreamOptions {
  system?: string;
  aiName?: string;
  messages?: AiMessage[];
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
      messages: options?.messages,
      system: options?.system,
      aiName: options?.aiName,
    },
  };
}
