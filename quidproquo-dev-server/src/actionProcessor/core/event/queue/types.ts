import { MatchStoryResult, QueueMessage, StorySession } from 'quidproquo-core';
import { QueueEventResponse } from 'quidproquo-webserver';
import { QueueEvent } from 'quidproquo-webserver';

export type AnyQueueMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;

  queueName: string;

  targetApplication: string;
  targetEnvironment: string;
  targetModule: string;
  targetFeature?: string;

  messageId: string;
};

// Externals - The ins and outs of the external event
export type EventInput = [AnyQueueMessageWithSession];
export type EventOutput = void;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = QueueEvent<QueueMessage<any>>;
export type InternalEventOutput = QueueEventResponse;

export type MatchResult = MatchStoryResult<any, any>;
