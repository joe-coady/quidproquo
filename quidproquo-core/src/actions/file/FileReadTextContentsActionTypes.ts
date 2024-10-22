import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileReadTextContentsActionPayload {
  drive: string;
  filepath: string;
}

// Action
export interface FileReadTextContentsAction extends Action<FileReadTextContentsActionPayload> {
  type: FileActionType.ReadTextContents;
  payload: FileReadTextContentsActionPayload;
}

// Function Types
export type FileReadTextContentsActionProcessor = ActionProcessor<FileReadTextContentsAction, string>;
export type FileReadTextContentsActionRequester = ActionRequester<FileReadTextContentsAction, string>;
