import {
  EventActionType,
  QPQConfig,
  MatchStoryResult,
  EventMatchStoryActionProcessor,
  EventTransformEventParamsActionProcessor,
  EventTransformResponseResultActionProcessor,
  EventAutoRespondActionProcessor,
  actionResult,
  QpqSourceEntry,
} from 'quidproquo-core';

import {
  StorageDriveEvent,
  StorageDriveEventResponse,
  StorageDriveEventType,
  WebSocketEventType,
  qpqWebServerUtils,
} from 'quidproquo-webserver';

import { S3Event, Context } from 'aws-lambda';

type EventInput = [S3Event, Context];
type EventOutput = void;

// Internals
type InternalEventInput = StorageDriveEvent;
type InternalEventOutput = StorageDriveEventResponse;

type AutoRespondResult = boolean;
type MatchResult = MatchStoryResult<any, any>;

const GLOBAL_STORAGE_DRIVE_NAME = process.env.storageDriveName!;
const GLOBAL_STORAGE_DRIVE_RUNTIME = JSON.parse(
  process.env.storageDriveEntry || '{}',
) as QpqSourceEntry;

const getProcessTransformEventParams = (): EventTransformEventParamsActionProcessor<
  EventInput,
  InternalEventInput
> => {
  return async ({ eventParams: [s3Event, context] }) => {
    const transformedEventParams: InternalEventInput = {
      driveName: GLOBAL_STORAGE_DRIVE_NAME,
      // TODO: Fix this to work for create delete for each record in one set?
      filePaths: s3Event.Records.map((r) => decodeURIComponent(r.s3.object.key)),
      eventType: s3Event.Records[0].eventName.startsWith('ObjectCreated')
        ? StorageDriveEventType.Create
        : StorageDriveEventType.Delete,
    };

    return actionResult(transformedEventParams);
  };
};

const getProcessTransformResponseResult = (
  qpqConfig: QPQConfig,
): EventTransformResponseResultActionProcessor<
  InternalEventOutput,
  InternalEventInput,
  EventOutput
> => {
  // We might need to JSON.stringify the body.
  return async (payload) => {
    // always success
    return actionResult<EventOutput>(void 0);
  };
};

const getProcessAutoRespond = (
  qpqConfig: QPQConfig,
): EventAutoRespondActionProcessor<InternalEventInput, MatchResult, AutoRespondResult> => {
  return async (payload) => {
    // always allow
    return actionResult(false);
  };
};

const getProcessMatchStory = (
  qpqConfig: QPQConfig,
): EventMatchStoryActionProcessor<InternalEventInput, MatchResult> => {
  return async () => {
    return actionResult<MatchResult>(GLOBAL_STORAGE_DRIVE_RUNTIME);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.TransformEventParams]: getProcessTransformEventParams(),
    [EventActionType.TransformResponseResult]: getProcessTransformResponseResult(qpqConfig),
    [EventActionType.AutoRespond]: getProcessAutoRespond(qpqConfig),
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
