import { QueueEventResponse } from 'quidproquo-webserver';

import { SQSEvent, Context, SQSBatchResponse } from 'aws-lambda';
import { MatchStoryResult, QueueMessage, StorySession } from 'quidproquo-core';

type AnyQueueMessageWithSession = QueueMessage<any> & {
  storySession: StorySession;
};

// Externals - The ins and outs of the external event
export type EventInput = [SQSEvent, Context];
export type EventOutput = SQSBatchResponse;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = AnyQueueMessageWithSession;
export type InternalEventOutput = QueueEventResponse;

export type MatchResult = MatchStoryResult<any, any>;
