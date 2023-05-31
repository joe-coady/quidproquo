import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType, DriveName } from './FileActionType';

// Payload
export interface FileWriteTextContentsActionPayload {
  drive: DriveName;
  filepath: string;
  data: string;
}

// Action
export interface FileWriteTextContentsAction extends Action<FileWriteTextContentsActionPayload> {
  type: FileActionType.WriteTextContents;
  payload: FileWriteTextContentsActionPayload;
}

// Function Types
export type FileWriteTextContentsActionProcessor = ActionProcessor<
  FileWriteTextContentsAction,
  void
>;
export type FileWriteTextContentsActionRequester = ActionRequester<
  FileWriteTextContentsAction,
  void
>;
