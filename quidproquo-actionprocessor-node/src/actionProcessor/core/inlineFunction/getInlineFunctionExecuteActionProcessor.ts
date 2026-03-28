import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  createRuntime,
  DynamicModuleLoader,
  ErrorTypeEnum,
  InlineFunctionActionType,
  InlineFunctionExecuteActionPayload,
  InlineFunctionExecuteActionProcessor,
  QPQConfig,
  qpqCoreUtils,
  QpqLogger,
  QpqRuntimeType,
  StorySession,
  StorySessionUpdater,
  StreamRegistry,
} from 'quidproquo-core';

import { randomUUID } from 'crypto';

const getDateNow = () => new Date().toISOString();

const getProcessExecute = <R, T>(qpqConfig: QPQConfig): InlineFunctionExecuteActionProcessor<R, T> => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async (
    payload: InlineFunctionExecuteActionPayload<T>,
    session: StorySession,
    actionProcessors: ActionProcessorList,
    logger: QpqLogger,
    updateSession: StorySessionUpdater,
    dynamicModuleLoader: DynamicModuleLoader,
    streamRegistry: StreamRegistry,
  ): Promise<any> => {
    const inlineFunctions = qpqCoreUtils.getAllInlineFunctions(qpqConfig);
    const inlineFunction = inlineFunctions.find((f) => f.functionName === payload.functionName);

    if (!inlineFunction) {
      return actionResultError(ErrorTypeEnum.NotFound, `Inline function not found: [${payload.functionName}]`);
    }

    const story = await dynamicModuleLoader(inlineFunction.runtime);

    if (!story) {
      return actionResultError(ErrorTypeEnum.NotFound, `Unable to dynamically load inline function: [${payload.functionName}]`);
    }

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
      `${moduleName}::${randomUUID()}`,
      QpqRuntimeType.EXECUTE_STORY,
      dynamicModuleLoader,
      inlineFunction.runtime,
      [],
      streamRegistry,
    );

    const storyResult = await resolveStory(story, [payload.payload]);

    if (storyResult.error) {
      return actionResultError(
        storyResult.error.errorType,
        storyResult.error.errorText,
        storyResult.error.errorStack ? `${payload.functionName} -> [${storyResult.error.errorStack}]` : payload.functionName,
      );
    }

    return actionResult<R>(storyResult.result);
  };
};

export const getInlineFunctionExecuteActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [InlineFunctionActionType.Execute]: getProcessExecute(qpqConfig),
});
