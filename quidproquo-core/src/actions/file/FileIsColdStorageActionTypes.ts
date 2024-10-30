import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { FileActionType } from './FileActionType';

// Payload
export interface FileIsColdStorageActionPayload {
  drive: string;
  filepath: string;
}

// Action
export interface FileIsColdStorageAction extends Action<FileIsColdStorageActionPayload> {
  type: FileActionType.IsColdStorage;
  payload: FileIsColdStorageActionPayload;
}

// Function Types
export type FileIsColdStorageActionProcessor = ActionProcessor<FileIsColdStorageAction, boolean>;
export type FileIsColdStorageActionRequester = ActionRequester<FileIsColdStorageAction, boolean>;
