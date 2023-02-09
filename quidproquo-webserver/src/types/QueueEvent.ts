import { QueueMessage } from 'quidproquo-core';

export interface QueueEventParams<T extends QueueMessage<any>> {
  message: T;
}

export type QueueEventResponse = boolean;
