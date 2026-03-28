import { Action, ActionProcessor, ActionRequester } from '../../types/Action';
import { StreamChunk, StreamDataType, StreamEncoding } from '../../types/StreamRegistry';
import { StreamActionType } from './StreamActionType';

// Payload
export interface StreamReadActionPayload {
  streamId: string;
  noWait?: boolean;
}

// Action
export interface StreamReadAction extends Action<StreamReadActionPayload> {
  type: StreamActionType.Read;
  payload: StreamReadActionPayload;
}

// Processor always returns raw wire data (string)
export type StreamReadActionProcessor = ActionProcessor<StreamReadAction, StreamChunk<string>>;

// Requester: TReturn is the converted type, TQPQReturn is the raw wire type
export type StreamReadActionRequester<E extends StreamEncoding = StreamEncoding> = ActionRequester<
  StreamReadAction,
  StreamChunk<StreamDataType<E>>,
  StreamChunk<string>
>;
