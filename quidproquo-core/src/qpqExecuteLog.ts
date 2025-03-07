import { defineApplicationModule } from './config';
import { createRuntime } from './runtime';
import { ActionProcessorList, StoryResult } from './types';

export const qpqExecuteLog = async (storyResult: StoryResult<any>, runtime: any, overrides: ActionProcessorList = {}): Promise<StoryResult<any>> => {
  // Create a proxy that just resolves all actions to reading from the history
  let logIndex = 0;
  const storyActionProcessor: ActionProcessorList = new Proxy(
    {},
    {
      get: (target: any, property: any) => {
        if (overrides[property]) {
          return overrides[property];
        }

        // TODO: We wan't a debug version of batch...
        //       but i think we need to move the node imps to core

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
    [defineApplicationModule('Debugger', storyResult.moduleName, 'development', __dirname, './dist')],
    {
      correlation: storyResult.fromCorrelation,
      depth: storyResult.session.depth,
      context: storyResult.session.context,
    },
    async () => storyActionProcessor,
    () => new Date().toISOString(),
    {
      enableLogs: async () => {},
      log: async () => {},
      waitToFinishWriting: async () => {},
      moveToPermanentStorage: async () => {},
    },
    storyResult.correlation,
    storyResult.runtimeType,
    async () => null,
  );

  // Execute it with the initial input
  // We use a debugger here to catch code before it is executed
  // eslint-disable-next-line no-debugger
  debugger;
  const result = await resolveStory(runtime, storyResult.input);

  return result;
};
