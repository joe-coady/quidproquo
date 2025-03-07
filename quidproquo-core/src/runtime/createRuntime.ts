import { QPQConfig } from '../config';
import { QpqLogger } from '../types';
import { ActionProcessorListResolver } from '../types';
import { QpqRuntimeType, Story, StorySession } from '../types/StorySession';
import { resolveStoryWithLogs } from './resolveStoryWithLogs';

export const createRuntime = (
  qpqConfig: QPQConfig,
  callerSession: StorySession,
  getActionProcessors: ActionProcessorListResolver,
  getTimeNow: () => string,
  logger: QpqLogger,
  runtimeCorrelation: string,
  runtimeType: QpqRuntimeType,
  dynamicModuleLoader: any,
  initialTags?: string[],
) => {
  // Return a function that wraps resolveStoryWithLogs with the provided runtime context
  return <TArgs extends Array<any>>(story: Story<TArgs, any>, args: TArgs) =>
    resolveStoryWithLogs(
      story,
      args,
      qpqConfig,
      callerSession,
      getActionProcessors,
      getTimeNow,
      logger,
      runtimeCorrelation,
      runtimeType,
      dynamicModuleLoader,
      initialTags,
    );
};
