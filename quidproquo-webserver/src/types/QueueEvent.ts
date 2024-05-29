import { QueueMessage } from 'quidproquo-core';

export interface QueueEventTypeParams {
  [key: string]: string;
}

export interface QueueEvent<T extends QueueMessage<any>> {
  message: T;
  id: string;
}

export type QueueEventResponse = boolean;
