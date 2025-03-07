import { QPQConfig } from '../config';
import { QpqLogger } from '../types';
import { ActionProcessorList } from '../types/Action';
import { qpqConsoleLog, QpqRuntimeType, Story, StoryResult, StorySession, StorySessionUpdater } from '../types/StorySession';
import { resolveStory } from './resolveStory';

export async function resolveStoryWithLogs<TArgs extends Array<any>>(
  story: Story<TArgs, any>,
  args: TArgs,
  qpqConfig: QPQConfig,
  callerSession: StorySession,
  getActionProcessors: (config: QPQConfig, dynamicModuleLoader: any) => Promise<ActionProcessorList>,
  getTimeNow: () => string,
  logger: QpqLogger,
  runtimeCorrelation: string,
  runtimeType: QpqRuntimeType,
  dynamicModuleLoader: any,
  initialTags?: string[],
): Promise<StoryResult<any>> {
  const logs: any[] = [];
  const oldConsoleLog = console.log;

  try {
    console.log = (...args: any[]) => {
      const logEntry: qpqConsoleLog = { t: getTimeNow(), a: args };
      logs.push(logEntry);
      return oldConsoleLog(...args);
    };

    const storyResult = await resolveStory(
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

    storyResult.logs = logs;
    await logger.log(storyResult);
    return storyResult;
  } finally {
    console.log = oldConsoleLog;
  }
}
