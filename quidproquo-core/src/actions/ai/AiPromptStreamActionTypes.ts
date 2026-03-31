import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { StreamHandle } from '../../types/StreamRegistry';
import { AiActionType } from './AiActionType';
import { AiMessage } from './AiMessage';
import { AiModel } from './AiModel';
import { AiStreamPart } from './AiStreamPart';

export interface AiPromptStreamActionPayload {
  model: AiModel;
  prompt: string;
  messages?: AiMessage[];
  system?: string;
  aiName?: string;
}

export interface AiPromptStreamAction extends Action<AiPromptStreamActionPayload> {
  type: AiActionType.PromptStream;
  payload: AiPromptStreamActionPayload;
}

export type AiPromptStreamActionProcessor = ActionProcessor<AiPromptStreamAction, StreamHandle<'json'>>;
export type AiPromptStreamActionRequester = ActionRequester<AiPromptStreamAction, StreamHandle<'json', AiStreamPart>>;
