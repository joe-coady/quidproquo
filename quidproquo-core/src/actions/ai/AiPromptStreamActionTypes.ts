import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { StreamHandle } from '../../types/StreamRegistry';
import { AiActionType } from './AiActionType';
import { AiModel } from './AiModel';

export interface AiPromptStreamActionPayload {
  model: AiModel;
  prompt: string;
  system?: string;
  aiName?: string;
}

export interface AiPromptStreamAction extends Action<AiPromptStreamActionPayload> {
  type: AiActionType.PromptStream;
  payload: AiPromptStreamActionPayload;
}

export type AiPromptStreamActionProcessor = ActionProcessor<AiPromptStreamAction, StreamHandle<'text'>>;
export type AiPromptStreamActionRequester = ActionRequester<AiPromptStreamAction, StreamHandle<'text'>>;
