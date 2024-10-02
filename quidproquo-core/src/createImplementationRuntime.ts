import { QPQConfig } from './config';
import { getApplicationModuleName } from './qpqCoreUtils';
import { ActionProcessorList, DynamicModuleLoader, QpqLogger, QpqRuntimeType, StorySession } from './types';
import { createRuntime } from './qpqRuntime';

// export const getDateNow = () => new Date().toISOString();
// export const randomGuid = () => new Date().toISOString();

// export type ActionProcessorReturnType<AP extends ActionProcessor<any, any>> =
//   ReturnType<AP> extends AsyncActionProcessorResult<infer TReturn> ? TReturn : never;

// export type ActionProcessorPayloadType<AP extends ActionProcessor<any, any>> = Parameters<AP>[0];

// export type ActionProcessorNative<AP extends ActionProcessor<any, any>> = (
//   payload: ActionProcessorPayloadType<AP>,
// ) => Promise<ActionProcessorReturnType<AP>>;

// export const resolveActionProcessorToNative = <AP extends ActionProcessor<any, any>>(actionProcessor: AP): ActionProcessorNative<AP> => {
//   // return null as TReturn;
//   return null as never;
// };

export const createImplementationRuntime = (
  qpqConfig: QPQConfig,
  tag: string,

  getDateNow: Parameters<typeof createRuntime>[3],
  randomGuid: () => string,

  session: StorySession,
  actionProcessors: ActionProcessorList,
  logger: QpqLogger,
  dynamicModuleLoader: DynamicModuleLoader,
): ReturnType<typeof createRuntime> => {
  const moduleName = getApplicationModuleName(qpqConfig);

  const resolveStory = createRuntime(
    qpqConfig,
    {
      context: session.context,
      depth: (session.depth || 0) + 1,
      accessToken: session.accessToken,
      correlation: session.correlation,
    },
    async () => actionProcessors,
    getDateNow,
    logger,
    // TODO: Share this logic.
    `${moduleName}::${randomGuid()}`,
    QpqRuntimeType.EXECUTE_IMPLEMENTATION_STORY,
    dynamicModuleLoader,
    [tag],
  );

  return resolveStory;
};
