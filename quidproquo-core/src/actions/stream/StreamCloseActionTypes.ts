import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { StreamActionType } from './StreamActionType';

// Payload
export interface StreamCloseActionPayload {
  streamId: string;
}

// Action
export interface StreamCloseAction extends Action<StreamCloseActionPayload> {
  type: StreamActionType.Close;
  payload: StreamCloseActionPayload;
}

// Function Types
export type StreamCloseActionProcessor = ActionProcessor<StreamCloseAction, void>;
export type StreamCloseActionRequester = ActionRequester<StreamCloseAction, void>;
