import { StreamChunk, StreamDataType, StreamEncoding } from '../../types/StreamRegistry';
import { StreamActionType } from './StreamActionType';

// Payload
export interface StreamReadActionPayload {
  streamId: string;
  noWait?: boolean;
}

// Processor always returns raw wire data (string)

// Requester: TReturn is the converted type, TQPQReturn is the raw wire type
