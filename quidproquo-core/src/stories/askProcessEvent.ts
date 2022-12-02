import { askThrowError } from '../actions/error';
import { ErrorTypeEnum } from '../types/ErrorTypeEnum';
import {
  askEventTransformEventParams,
  askEventAutoRespond,
  askEventTransformResponseResult,
  askEventMatchStory,
} from '../actions/event';

import { askExecuteStory } from '../actions/system';

export function* askProcessEvent(...eventArguments: any) {
  // Transform event params
  const transformedEventParams = yield* askEventTransformEventParams(...eventArguments);

  //  See if we want to exit early (validation / auth etc)
  const earlyExitResponse = yield* askEventAutoRespond(transformedEventParams);

  if (earlyExitResponse) {
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse);
  }

  // Try and match a story to execute
  const { src, runtime, errorResourceNotFound, options } = yield* askEventMatchStory(
    transformedEventParams,
  );

  // If we cant find the story to execute ~ Throw a not found error!
  if (errorResourceNotFound) {
    yield* askThrowError(
      ErrorTypeEnum.NotFound,
      errorResourceNotFound,
      'the specified resource could not be found',
    );
  }

  // Execute the story
  const result = yield* askExecuteStory('route', src!, runtime!, [transformedEventParams, options]);

  // return the result of the story back to the event caller
  return yield* askEventTransformResponseResult(result);
}
