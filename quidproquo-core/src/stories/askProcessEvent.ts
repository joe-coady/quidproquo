import {
  askEventTransformEventParams,
  askEventAutoRespond,
  askEventTransformResponseResult,
  askEventMatchStory,
} from '../actions/event/EventActionRequester';

import { askExecuteStory } from '../actions/system/SystemActionRequester';

export function* askProcessEvent(...args: any) {
  // Transform event params
  const http = yield* askEventTransformEventParams(...args);

  // See if we want to exit early (validation / auth etc)
  const earlyExitResponse = yield* askEventAutoRespond(http);
  if (earlyExitResponse) {
    // Transform the early exit response if needed
    return yield* askEventTransformResponseResult(earlyExitResponse);
  }

  // Try and match a story to execute
  const { src, runtime } = yield* askEventMatchStory(http);

  // Execute the story
  const result = yield* askExecuteStory('route', src, runtime, [http]);

  // return the result of the story back to the event caller
  return yield* askEventTransformResponseResult(result);
}
