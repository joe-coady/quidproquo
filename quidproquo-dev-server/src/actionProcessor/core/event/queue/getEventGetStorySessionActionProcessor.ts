import {
  actionResult,
  askEventGetStorySessionBase,
  createActionProcessor,
  EventActionType,
  ProcessorFor,
  QPQConfig,
  StorySession,
} from 'quidproquo-core';

import { EventInput, InternalEventRecord, MatchResult } from './types';

const getProcessGetStorySession = (qpqConfig: QPQConfig): ProcessorFor<typeof askEventGetStorySessionBase> => {
  return async ({ eventParams }, session) => {
    // Registered for one event source only, so the base requester's
    // source-agnostic payload is narrowed to this source's types here.
    const [event] = eventParams as EventInput;

    const res: StorySession = {
      ...event.storySession,

      correlation: session.correlation || event.storySession.correlation,
    };

    return actionResult(res);
  };
};

export const getEventGetStorySessionActionProcessor = createActionProcessor(askEventGetStorySessionBase, getProcessGetStorySession);
