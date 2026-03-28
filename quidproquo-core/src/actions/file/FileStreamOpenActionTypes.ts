import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { StreamEncoding, StreamHandle } from '../../types/StreamRegistry';
import { FileActionType } from './FileActionType';

// Payload
export interface FileStreamOpenActionPayload {
  drive: string;
  filepath: string;
  encoding: StreamEncoding;
  chunkSize?: number;
}

// Action
export interface FileStreamOpenAction extends Action<FileStreamOpenActionPayload> {
  type: FileActionType.StreamOpen;
  payload: FileStreamOpenActionPayload;
}

// Function Types
export type FileStreamOpenActionProcessor = ActionProcessor<FileStreamOpenAction, StreamHandle>;
export type FileStreamOpenActionRequester<E extends StreamEncoding = StreamEncoding> = ActionRequester<
  FileStreamOpenAction,
  StreamHandle<E>
>;
