import { ExecuteServiceFunctionEvent, StorageDriveEvent, StorageDriveEventResponse } from 'quidproquo-webserver';

import { S3Event, Context } from 'aws-lambda';
import { MatchStoryResult, QpqSourceEntry, StorySession } from 'quidproquo-core';

// Customs
export const GLOBAL_STORAGE_DRIVE_NAME = process.env.storageDriveName!;
export const GLOBAL_STORAGE_DRIVE_RUNTIME = JSON.parse(process.env.storageDriveEntry || '{}') as QpqSourceEntry;

type AnyExecuteServiceFunctionEventWithSession = ExecuteServiceFunctionEvent<any[]> & {
  storySession: StorySession;
};

// Externals - The ins and outs of the external event
export type EventInput = [AnyExecuteServiceFunctionEventWithSession, Context];
export type EventOutput = any;

// Internals - the ins and outs of each record in the event
export type InternalEventRecord = StorageDriveEvent;
export type InternalEventOutput = StorageDriveEventResponse;

export type MatchResult = MatchStoryResult<any, any>;
