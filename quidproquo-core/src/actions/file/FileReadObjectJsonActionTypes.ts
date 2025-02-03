import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileReadObjectJsonActionPayload {
  drive: string;
  filepath: string;
}

// Action
export interface FileReadObjectJsonAction extends Action<FileReadObjectJsonActionPayload> {
  type: FileActionType.ReadObjectJson;
  payload: FileReadObjectJsonActionPayload;
}

// Function Types
export type FileReadObjectJsonActionProcessor<T extends object> = ActionProcessor<FileReadObjectJsonAction, T>;
export type FileReadObjectJsonActionRequester<T extends object> = ActionRequester<FileReadObjectJsonAction, T>;
