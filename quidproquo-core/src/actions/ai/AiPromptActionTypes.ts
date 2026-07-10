import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
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

export interface AiPromptAction extends Action<AiPromptActionPayload> {
  type: AiActionType.Prompt;
  payload: AiPromptActionPayload;
}

export type AiPromptActionProcessor = ActionProcessor<AiPromptAction, AiPromptActionResult>;
export type AiPromptActionRequester = ActionRequester<AiPromptAction, AiPromptActionResult>;
