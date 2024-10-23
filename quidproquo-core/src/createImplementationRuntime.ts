import { actionResult, actionResultError } from './logic/actionLogic';
import { QPQConfig } from './config';
import { getApplicationModuleName } from './qpqCoreUtils';
import { createRuntime } from './qpqRuntime';
import {
  ActionProcessor,
  ActionProcessorList,
  ActionProcessorListResolver,
  AnyStory,
  DynamicModuleLoader,
  QpqLogger,
  QpqRuntimeType,
  StorySession,
} from './types';

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
  tags: string[],

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
      decodedAccessToken: session.decodedAccessToken,
      correlation: session.correlation,
    },
    async () => actionProcessors,
    getDateNow,
    logger,
    // TODO: Share this logic.
    `${moduleName}::${randomGuid()}`,
    QpqRuntimeType.EXECUTE_IMPLEMENTATION_STORY,
    dynamicModuleLoader,
    tags,
  );

  return resolveStory;
};

export const getProcessCustomImplementation = <T extends ActionProcessor<any, any>>(
  qpqConfig: QPQConfig,
  story: AnyStory,
  tag: string,
  actionProcessorListResolver: ActionProcessorListResolver | null,
  getDateNow: () => string,
  getNewGuid: () => string,
): T => {
  const actionProcesor: ActionProcessor<any, any> = async (payload, session, actionProcessorList, logger, updateSession, dynamicModuleLoader) => {
    const resolveStory = createImplementationRuntime(
      qpqConfig,
      [tag],
      getDateNow,
      getNewGuid,
      session,
      {
        ...actionProcessorList,
        ...(actionProcessorListResolver ? await actionProcessorListResolver(qpqConfig, dynamicModuleLoader) : {}),
      },
      logger,
      dynamicModuleLoader,
    );

    const storyResult = await resolveStory(story, [payload]);

    if (storyResult.error) {
      return actionResultError(storyResult.error.errorType, storyResult.error.errorText);
    }

    return actionResult(storyResult.result);
  };

  return actionProcesor as T;
};
