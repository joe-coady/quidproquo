import { StoryResult } from './types';
import { createRuntime } from './qpqRuntime';
import { defineApplicationModule } from './config';

export const qpqExecuteLog = async (
  storyResult: StoryResult<any>,
  runtime: any,
): Promise<StoryResult<any>> => {
  // Create a proxy that just resolves all actions to reading from the history
  var logIndex = 0;
  const storyActionProcessor = new Proxy(
    {},
    {
      get: (target: any, property: any) => {
        return async () => {
          const res = storyResult.history[logIndex].res;
          logIndex = logIndex + 1;
          return res;
        };
      },
    },
  );

  // Generate an empty story resolver
  const resolveStory = createRuntime(
    [defineApplicationModule('Debugger', storyResult.moduleName, 'development', __dirname)],
    {
      correlation: storyResult.fromCorrelation,
      depth: storyResult.session.depth,
      context: storyResult.session.context,
    },
    storyActionProcessor,
    () => new Date().toISOString(),
    {
      log: async () => {},
      waitToFinishWriting: async () => {},
      moveToPermanentStorage: async () => {},
    },
    storyResult.correlation,
    storyResult.runtimeType,
  );

  // Execute it with the initial input
  debugger;
  const result = await resolveStory(runtime, storyResult.input);

  return result;
};
