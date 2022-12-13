import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileDeleteActionPayload {
  drive: string;
  filepaths: string[];
}

// Action
export interface FileDeleteAction extends Action<FileDeleteActionPayload> {
  type: FileActionType.Delete;
  payload: FileDeleteActionPayload;
}

// Function Types
export type FileDeleteActionProcessor = ActionProcessor<FileDeleteAction, string[]>;
export type FileDeleteActionRequester = ActionRequester<FileDeleteAction, string[]>;
