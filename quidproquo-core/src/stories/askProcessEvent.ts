import {
  askEventTransformEventParams,
  askEventAutoRespond,
  askEventTransformResponseResult,
  askEventMatchStory,
  MatchStoryResult,
} from '../actions/event';

import { askExecuteStory } from '../actions/system';

export function* askProcessEvent(...eventArguments: any) {
  // Transform event params
  const transformedEventParams = yield* askEventTransformEventParams(...eventArguments);

  // Try and match a story to execute
  const { src, runtime, runtimeOptions, config } = yield* askEventMatchStory(
    transformedEventParams,
  );

  //  See if we want to exit early (validation / auth etc)
  const earlyExitResponse = yield* askEventAutoRespond(transformedEventParams, config);

  if (earlyExitResponse) {
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse, transformedEventParams);
  }

  // Execute the story
  const result = yield* askExecuteStory('route', src!, runtime!, [
    transformedEventParams,
    runtimeOptions,
  ]);

  // return the result of the story back to the event caller
  return yield* askEventTransformResponseResult(result, transformedEventParams);
}
