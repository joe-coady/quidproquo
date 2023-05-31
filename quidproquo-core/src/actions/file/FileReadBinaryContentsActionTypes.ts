import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { QPQBinaryData } from '../../types/QPQBinaryData';
import { FileActionType, DriveName } from './FileActionType';

// Payload
export interface FileReadBinaryContentsActionPayload {
  drive: DriveName;
  filepath: string;
}

// Action
export interface FileReadBinaryContentsAction extends Action<FileReadBinaryContentsActionPayload> {
  type: FileActionType.ReadBinaryContents;
  payload: FileReadBinaryContentsActionPayload;
}

// Function Types
export type FileReadBinaryContentsActionProcessor = ActionProcessor<
  FileReadBinaryContentsAction,
  QPQBinaryData
>;
export type FileReadBinaryContentsActionRequester = ActionRequester<
  FileReadBinaryContentsAction,
  QPQBinaryData
>;
