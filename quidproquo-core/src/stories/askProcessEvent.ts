import { askLogCreate } from '../actions';
import {
  askEventTransformEventParams,
  askEventAutoRespond,
  askEventTransformResponseResult,
  askEventMatchStory,
  MatchStoryResult,
} from '../actions/event';

import { askExecuteStory } from '../actions/system';
import { LogLevelEnum } from '../types';

export function* askProcessEvent(...eventArguments: any) {
  console.log("Test: 1");
  // Transform event params
  const transformedEventParams = yield* askEventTransformEventParams(...eventArguments);
  console.log("Test: 2", transformedEventParams);
  // Try and match a story to execute
  const matchResult = yield* askEventMatchStory(transformedEventParams);
  console.log("Test: 3", matchResult);
  //  See if we want to exit early (validation / auth etc)
  const earlyExitResponse = yield* askEventAutoRespond(transformedEventParams, matchResult);
  console.log("Test: 4", earlyExitResponse);
  // Log the early exit response
  yield* askLogCreate(LogLevelEnum.Info, `earlyExitResponse [${earlyExitResponse}]`);
  console.log("Test: 5");
  if (earlyExitResponse) {
    console.log("Test: 6");
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse, transformedEventParams);
  }
  console.log("Test: 7");
  // Execute the story
  const result = yield* askExecuteStory('route', matchResult.src!, matchResult.runtime!, [
    transformedEventParams,
    matchResult.runtimeOptions,
  ]);
  console.log("Test: 8", result);
  // return the result of the story back to the event caller
  return yield* askEventTransformResponseResult(result, transformedEventParams);
}
