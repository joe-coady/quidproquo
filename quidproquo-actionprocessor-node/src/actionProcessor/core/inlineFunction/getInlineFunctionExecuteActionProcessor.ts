import {
  actionResult,
  actionResultError,
  askInlineFunctionExecuteBase,
  createActionProcessor,
  createRuntime,
  ErrorTypeEnum,
  ProcessorFor,
  QPQConfig,
  qpqCoreUtils,
  QpqRuntimeType,
} from 'quidproquo-core';

import { randomUUID } from 'crypto';

const getDateNow = () => new Date().toISOString();

const getProcessExecute = (qpqConfig: QPQConfig): ProcessorFor<typeof askInlineFunctionExecuteBase> => {
  const moduleName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  return async (payload, session, actionProcessors, logger, updateSession, dynamicModuleLoader, streamRegistry) => {
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
        localContext: session.localContext,
        depth: (session.depth || 0) + 1,
        decodedAccessToken: session.decodedAccessToken,
        correlation: session.correlation,
        // Inline functions run WITHIN the caller's function - carry its globals
        // so stories like the tenant scope resolver can read route config (the
        // runtime merges these under the inline function's own registration).
        functionGlobals: session.functionGlobals,
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

    return actionResult(storyResult.result);
  };
};

export const getInlineFunctionExecuteActionProcessor = createActionProcessor(askInlineFunctionExecuteBase, getProcessExecute);
