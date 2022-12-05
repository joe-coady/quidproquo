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

  console.log(earlyExitResponse);

  if (earlyExitResponse) {
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse);
  }

  console.log('Here');

  // Try and match a story to execute
  const { src, runtime, options } = yield* askEventMatchStory(transformedEventParams);

  // Execute the story
  const result = yield* askExecuteStory('route', src!, runtime!, [transformedEventParams, options]);

  // return the result of the story back to the event caller
  return yield* askEventTransformResponseResult(result);
}
