import { askLogCreate } from '../actions';
import { askEventAutoRespond, askEventTransformResponseResult, askEventMatchStory, askEventGetRecords, AnyMatchStoryResult } from '../actions/event';

import { askMapParallel } from './array';

import { askExecuteStory } from '../actions/system';
import { AskResponse, EitherActionResult, LogLevelEnum, QPQError, StoryResult } from '../types';

import { askGetApplicationVersion } from './askGetApplicationVersion';
import { askCatch } from './system/askCatch';

const getSuccessfulEitherActionResult = <T>(result: T): EitherActionResult<T> => ({
  success: true,
  result,
});

const getUnsuccessfulEitherActionResult = (error: QPQError): EitherActionResult<any> => ({
  success: false,
  error: error,
});

function* askProcessEventRecord<QpqEventRecord, MSR extends AnyMatchStoryResult, QpqEventRecordResponse>(
  qpqEventRecord: QpqEventRecord,
): AskResponse<EitherActionResult<QpqEventRecordResponse>> {
  // Try and match a story to execute
  const matchResultResult = yield* askCatch(askEventMatchStory<QpqEventRecord, MSR>(qpqEventRecord));
  if (!matchResultResult.success) {
    return getUnsuccessfulEitherActionResult(matchResultResult.error);
  }

  // See if we want to exit early (validation / auth etc)
  const earlyExitQpqEventRecordResponse = yield* askEventAutoRespond<QpqEventRecord, MSR, QpqEventRecordResponse>(
    qpqEventRecord,
    matchResultResult.result,
  );

  // Return
  if (earlyExitQpqEventRecordResponse != null) {
    // Log the early exit response
    yield* askLogCreate(LogLevelEnum.Info, 'earlyExitResponse', earlyExitQpqEventRecordResponse);

    // return the result
    return getSuccessfulEitherActionResult(earlyExitQpqEventRecordResponse);
  }

  // Execute the story
  const executeStoryResponse = yield* askCatch(
    askExecuteStory<[QpqEventRecord, MSR['runtimeOptions']], QpqEventRecordResponse>(
      matchResultResult.result.src!,
      matchResultResult.result.runtime!,
      [qpqEventRecord, matchResultResult.result.runtimeOptions],
    ),
  );

  if (executeStoryResponse.success) {
    // return the result of the story back to the event caller
    return getSuccessfulEitherActionResult(executeStoryResponse.result.result!);
  }

  return getUnsuccessfulEitherActionResult(executeStoryResponse.error);
}

export function* askProcessEvent<
  EventParams extends Array<unknown> = any[],
  QpqEventRecord = any,
  QpqEventRecordResponse = any,
  MSR extends AnyMatchStoryResult = AnyMatchStoryResult,
  EventResponse = any,
>(...eventArguments: any): AskResponse<EventResponse> {
  // Try and get the app version
  // This should be something the developer knows how to get to the code version
  // like the git sha, we don't need to do anything with the global, it will be in the logs
  yield* askGetApplicationVersion();

  const records = yield* askEventGetRecords<EventParams, QpqEventRecord>(...eventArguments);

  const processedRecords = yield* askMapParallel(records, askProcessEventRecord<QpqEventRecord, MSR, QpqEventRecordResponse>);

  return yield* askEventTransformResponseResult<EventParams, QpqEventRecordResponse, EventResponse>(processedRecords, ...eventArguments);
}
