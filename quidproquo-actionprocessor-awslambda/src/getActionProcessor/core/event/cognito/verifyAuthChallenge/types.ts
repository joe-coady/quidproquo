import { VerifyAuthChallengeEvent, VerifyAuthChallengeEventResponse, MatchStoryResult } from 'quidproquo-core';

import { VerifyAuthChallengeResponseTriggerEvent, Context } from 'aws-lambda';

export const GLOBAL_USER_DIRECTORY_NAME = process.env.userDirectoryName!;

// Externals - The ins and outs of the external event
export type EventInput = [VerifyAuthChallengeResponseTriggerEvent, Context];
export type EventOutput = VerifyAuthChallengeResponseTriggerEvent;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = VerifyAuthChallengeEvent;
export type InternalEventOutput = VerifyAuthChallengeEventResponse;

export type MatchResult = MatchStoryResult<any, any>;
