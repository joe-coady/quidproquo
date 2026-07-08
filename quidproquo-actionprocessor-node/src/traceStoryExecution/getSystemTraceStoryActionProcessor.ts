import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  DynamicModuleLoader,
  ErrorTypeEnum,
  QPQConfig,
  QpqLogger,
  StorySession,
  StorySessionUpdater,
  SystemActionType,
  SystemTraceStoryActionPayload,
  SystemTraceStoryActionProcessor,
} from 'quidproquo-core';

import { traceStoryExecution } from './traceStoryExecution';

// Shared System::TraceStory processor for node runtimes (lambda and the dev server).
// Loads the recorded story's real code through the runtime's dynamicModuleLoader (which
// federates on lambda), then replays it under the tracer. defaultScriptPatterns lets the
// host add environment-specific scripts to trace (e.g. the lambda federated code cache).
const getProcessTraceStory = (qpqConfig: QPQConfig, defaultScriptPatterns: string[]): SystemTraceStoryActionProcessor => {
  return async (
    payload: SystemTraceStoryActionPayload,
    session: StorySession,
    actionProcessors: ActionProcessorList,
    logger: QpqLogger,
    updateSession: StorySessionUpdater,
    dynamicModuleLoader: DynamicModuleLoader,
  ) => {
    const { storyResult, scriptPatterns, onlyOwnCode } = payload;

    if (!storyResult.qpqFunctionRuntimeInfo) {
      return actionResultError(
        ErrorTypeEnum.BadRequest,
        `Story [${storyResult.correlation}] has no qpqFunctionRuntimeInfo - cannot locate its code to trace`,
      );
    }

    const story = await dynamicModuleLoader(storyResult.qpqFunctionRuntimeInfo);
    if (!story) {
      return actionResultError(ErrorTypeEnum.NotFound, `Unable to dynamically load story for [${storyResult.correlation}]`);
    }

    try {
      const { trace } = await traceStoryExecution(storyResult, story, {
        scriptPatterns: [...defaultScriptPatterns, ...(scriptPatterns || [])],
        onlyOwnCode,
      });

      return actionResult(trace);
    } catch (error) {
      return actionResultError(ErrorTypeEnum.GenericError, `Trace failed for [${storyResult.correlation}]: ${(error as Error).message}`);
    }
  };
};

export const getSystemTraceStoryActionProcessor =
  (defaultScriptPatterns: string[] = []): ActionProcessorListResolver =>
  async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
    [SystemActionType.TraceStory]: getProcessTraceStory(qpqConfig, defaultScriptPatterns),
  });
