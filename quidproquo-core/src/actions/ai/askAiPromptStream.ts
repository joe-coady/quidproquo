import { createActionRequester } from '../../types';
import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiReasoningConfig } from './AiReasoningConfig';
import { AiStreamPart } from './AiPromptStreamActionTypes';
import { StreamHandle } from '../../types/StreamRegistry';

export type AskAiPromptStreamOptions = {
  system?: string;
  aiName?: string;
  messages?: AiMessage[];
  reasoning?: AiReasoningConfig;
  caching?: boolean;
};

export const askAiPromptStream = createActionRequester<StreamHandle<'json', AiStreamPart>>()({
  actionType: AiActionType.PromptStream,
  getPayload: (model: AiModel, prompt: string, options?: AskAiPromptStreamOptions) => ({
    model,
    prompt,
    messages: options?.messages,
    system: options?.system,
    aiName: options?.aiName,
    reasoning: options?.reasoning,
    caching: options?.caching,
  }),
});
