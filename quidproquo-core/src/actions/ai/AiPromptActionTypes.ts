import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { AiActionType } from './AiActionType';
import { AiModel } from './AiModel';

export interface AiPromptActionPayload {
  model: AiModel;
  prompt: string;
  system?: string;
  aiName?: string;
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
