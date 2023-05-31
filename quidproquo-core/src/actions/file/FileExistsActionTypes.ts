import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, DriveName } from './FileActionType';

// Payload
export interface FileExistsActionPayload {
  drive: DriveName;
  filepath: string;
}

// Action
export interface FileExistsAction extends Action<FileExistsActionPayload> {
  type: FileActionType.Exists;
  payload: FileExistsActionPayload;
}

// Function Types
export type FileExistsActionProcessor = ActionProcessor<FileExistsAction, boolean>;
export type FileExistsActionRequester = ActionRequester<FileExistsAction, boolean>;
