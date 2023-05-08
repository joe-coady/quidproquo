import { StoryResult } from './types';
import { createRuntime } from './qpqRuntime';
import { defineApplicationModule } from './config';

export const qpqExecuteLog = async (
  storyResult: StoryResult<any>,
  runtime: any,
): Promise<StoryResult<any>> => {
  var logIndex = 0;
  const getLogResultAction = async () => {
    const result = storyResult.history[logIndex++].res;
    console.log(result);
    return result;
  };

  // Create a proxy that just resolves all actions to the getLogResultAction
  const storyActionProcessor = new Proxy(
    {},
    {
      get: (target: any, property: any) => {
        return getLogResultAction;
      },
    },
  );

  // Generate an empty story resolver
  const resolveStory = createRuntime(
    [defineApplicationModule('Debugger', storyResult.moduleName, 'development', __dirname)],
    {},
    storyActionProcessor,
    () => new Date().toISOString(),
    async () => {},
    () => '',
    storyResult.runtimeType,
  );

  // Execute it with the initial input
  debugger;
  const result = await resolveStory(runtime, storyResult.input);

  return result;
};
