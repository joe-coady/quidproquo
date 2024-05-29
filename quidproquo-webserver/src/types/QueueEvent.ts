import { QueueMessage, StorySession } from 'quidproquo-core';

export interface QueueEventTypeParams {
  [key: string]: string;
}

export interface QueueEvent<T extends QueueMessage<any>> {
  message: T;
  storySession: StorySession;
}

export type QueueEventResponse = boolean;
