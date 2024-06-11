import { QpqRuntimeType, StorySession, ActionProcessorList, QpqLogger, AskResponse, AskResponseReturnType } from './types';
import { QPQConfig } from './config';
import { createRuntime } from './qpqRuntime';

export const getQpqRuntimeForStory = <Story extends (...eventParams: any[]) => AskResponse<any>>(
  runtimeType: QpqRuntimeType,
  qpqConfig: QPQConfig,
  getStorySession: (...eventParams: Parameters<Story>) => StorySession,
  getActionProcessorList: (qpqConfig: QPQConfig) => ActionProcessorList,
  getLogger: (qpqConfig: QPQConfig) => QpqLogger,
  getRuntimeCorrelation: (qpqConfig: QPQConfig) => string,
  isWarmEvent: (...eventParms: Parameters<Story>) => boolean,
  hasNonWarmEventRecords: (...eventParms: Parameters<Story>) => boolean,
  askStoryToRun: Story,
) => {
  return async (...eventParams: Parameters<Story>): Promise<AskResponseReturnType<ReturnType<Story>>> => {
    console.log('Received eventParams!: ', eventParams);
    const logger = getLogger(qpqConfig);
    const resolveStory = createRuntime(
      qpqConfig,
      getStorySession(...eventParams),
      getActionProcessorList(qpqConfig),
      () => new Date().toISOString(),
      logger,
      getRuntimeCorrelation(qpqConfig),
      runtimeType,
    );

    const processEvent = async () => {
      const result = await resolveStory(askStoryToRun, eventParams);
      await logger.waitToFinishWriting();
      if (result.error) {
        throw new Error(result.error.errorText);
      }
      console.log('Finished, returning: ', result.result);
      return result.result;
    };

    if (isWarmEvent(...eventParams)) {
      // Non warmer records
      const hasNormalRecords = hasNonWarmEventRecords(...eventParams);

      // if we have found some warmers - then we need to warm the lambda
      if (!hasNormalRecords) {
        console.log('Found SNS warmer');
        // TODO: Warm qpq things with dynamic functions
        // federate in dynamic modules
        // await dynamicModuleLoaderWarmer();
        // Might as well move the logs to permanent storage

        await logger.moveToPermanentStorage();

        return 'Warmed up!' as any;
      }

      // If we have events that are not warmers, then we should execute them
      if (hasNormalRecords) {
        return await processEvent();
      }
    }

    return await processEvent();
  };
};
