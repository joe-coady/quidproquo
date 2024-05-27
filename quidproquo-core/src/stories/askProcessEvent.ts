import { askLogCreate } from '../actions';
import {
  askEventTransformEventParams,
  askEventAutoRespond,
  askEventTransformResponseResult,
  askEventMatchStory,
  askEventResolveCaughtError,
} from '../actions/event';

import { askExecuteStory } from '../actions/system';
import { LogLevelEnum } from '../types';

import { askGetApplicationVersion } from './askGetApplicationVersion';
import { askCatch } from './system/askCatch';

export function* askProcessEvent(...eventArguments: any) {
  // Try and get the app version
  // This should be something the developer knows how to get to the code version
  // like the git sha, we don't need to do anything with the global, it will be in the logs
  yield* askGetApplicationVersion();

  // Transform event params
  const transformedEventParams = yield* askEventTransformEventParams(...eventArguments);

  // Try and match a story to execute
  const matchResult = yield* askEventMatchStory(transformedEventParams);

  //  See if we want to exit early (validation / auth etc)
  const earlyExitResponse = yield* askEventAutoRespond(transformedEventParams, matchResult);

  // Log the early exit response
  yield* askLogCreate(LogLevelEnum.Info, 'earlyExitResponse', earlyExitResponse || `[no early exit response]`);

  if (earlyExitResponse) {
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse, transformedEventParams);
  }

  // Execute the story
  const result = yield* askCatch(
    askExecuteStory('route', matchResult.src!, matchResult.runtime!, [transformedEventParams, matchResult.runtimeOptions]),
  );

  if (result.success) {
    // return the result of the story back to the event caller
    return yield* askEventTransformResponseResult(result.result, transformedEventParams);
  }

  const erroredResponse = yield* askEventResolveCaughtError(result.error);

  return yield* askEventTransformResponseResult(erroredResponse, transformedEventParams);
}
