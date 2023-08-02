import { askLogCreate } from '../actions';
import {
  askEventTransformEventParams,
  askEventAutoRespond,
  askEventTransformResponseResult,
  askEventMatchStory
} from '../actions/event';

import { askExecuteStory } from '../actions/system';
import { LogLevelEnum } from '../types';

export function* askProcessEvent(...eventArguments: any) {  
  // Transform event params
  const transformedEventParams = yield* askEventTransformEventParams(...eventArguments);

  // Try and match a story to execute
  const matchResult = yield* askEventMatchStory(transformedEventParams);

  //  See if we want to exit early (validation / auth etc)
  const earlyExitResponse = yield* askEventAutoRespond(transformedEventParams, matchResult);

  // Log the early exit response
  yield* askLogCreate(LogLevelEnum.Info, `earlyExitResponse [${earlyExitResponse}]`);

  if (earlyExitResponse) {
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse, transformedEventParams);
  }

  // Execute the story
  const result = yield* askExecuteStory('route', matchResult.src!, matchResult.runtime!, [
    transformedEventParams,
    matchResult.runtimeOptions,
  ]);

  // return the result of the story back to the event caller
  return yield* askEventTransformResponseResult(result, transformedEventParams);
}
