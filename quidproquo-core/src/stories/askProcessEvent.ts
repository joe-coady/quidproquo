import { askLogCreate } from '../actions';
import {
  AnyMatchStoryResult,
  askEventAutoRespond,
  askEventGetRecords,
  askEventGetStorySession,
  askEventMatchStory,
  askEventTransformResponseResult,
} from '../actions';
import { askExecuteStory } from '../actions/system';
import { getSuccessfulEitherActionResult, getUnsuccessfulEitherActionResult } from '../logic/actionLogic';
import { AskResponse, EitherActionResult, LogLevelEnum } from '../types';
import { askCatch } from './system/askCatch';
import { askMapParallel } from './array';
import { askGetApplicationVersion } from './askGetApplicationVersion';

function* askProcessEventRecord<QpqEventRecord, MSR extends AnyMatchStoryResult, QpqEventRecordResponse, EventParams extends Array<unknown> = any[]>(
  qpqEventRecord: QpqEventRecord,
  eventArguments: EventParams,
): AskResponse<EitherActionResult<QpqEventRecordResponse>> {
  // Try and match a story to execute
  const matchResultResult = yield* askCatch(askEventMatchStory<QpqEventRecord, MSR, EventParams>(qpqEventRecord, eventArguments));
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

  const messageSession = yield* askEventGetStorySession<EventParams, QpqEventRecord, MSR>(eventArguments, qpqEventRecord, matchResultResult.result);

  // Execute the story
  const executeStoryResponse = yield* askCatch(
    askExecuteStory<[QpqEventRecord, MSR['runtimeOptions']], QpqEventRecordResponse>(
      matchResultResult.result.runtime!,
      [qpqEventRecord, matchResultResult.result.runtimeOptions],
      messageSession,
    ),
  );

  if (executeStoryResponse.success) {
    // return the result of the story back to the event caller
    return getSuccessfulEitherActionResult(executeStoryResponse.result);
  }

  return getUnsuccessfulEitherActionResult(executeStoryResponse.error);
}

export function* askProcessEvent<
  EventParams extends Array<unknown> = any[],
  QpqEventRecord = any,
  QpqEventRecordResponse = any,
  MSR extends AnyMatchStoryResult = AnyMatchStoryResult,
  EventResponse = any,
>(...eventArguments: EventParams): AskResponse<EventResponse> {
  // Try and get the app version
  // This should be something the developer knows how to get to the code version
  // like the git sha, we don't need to do anything with the global, it will be in the logs
  yield* askGetApplicationVersion();

  const records = yield* askEventGetRecords<EventParams, QpqEventRecord>(...eventArguments);

  const processedRecords = yield* askMapParallel(records, function* askProcessEventRecordWithEvent(record) {
    return yield* askProcessEventRecord<QpqEventRecord, MSR, QpqEventRecordResponse, EventParams>(record, eventArguments);
  });

  return yield* askEventTransformResponseResult<EventParams, QpqEventRecordResponse, EventResponse>(processedRecords, ...eventArguments);
}
