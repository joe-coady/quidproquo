import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  qpqCoreUtils,
  QueueQPQConfigSetting,
} from 'quidproquo-core';

import { matchUrl } from '../../../../../awsLambdaUtils';
import { InternalEventRecord, MatchResult } from './types';

export const getQueueConfigSetting = (): QueueQPQConfigSetting => {
  const queueQPQConfigSetting: QueueQPQConfigSetting = JSON.parse(process.env.queueQPQConfigSetting as string);

  // TODO: Validate here

  return queueQPQConfigSetting;
};

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  // TODO: Get this out of the qpqconfig like the other event processors
  const queueQPQConfigSetting = getQueueConfigSetting();
  const queueQueueProcessors = qpqCoreUtils.getQueueQueueProcessors(queueQPQConfigSetting.name, qpqConfig);
  const queueTypes = Object.keys(queueQueueProcessors).sort();

  return async ({ qpqEventRecord }) => {
    console.log('qpqEventRecord', JSON.stringify(qpqEventRecord, null, 2));

    // Find the most relevant match
    const matchedQueueType = queueTypes
      .map((qt) => ({
        match: matchUrl(qt, qpqEventRecord.message.type),
        queueType: qt,
      }))
      .find((m) => m.match.didMatch);

    if (!matchedQueueType) {
      // If we have event bus subscriptions then we don't want to error if we can't match
      // early exit will just exit gracefully
      if (queueQPQConfigSetting.eventBusSubscriptions.length > 0) {
        return actionResult<MatchResult>({});
      }

      return actionResultError(ErrorTypeEnum.NotFound, `queue type not found ${qpqEventRecord.message.type}`);
    }

    const sourceEntry = queueQueueProcessors[matchedQueueType.queueType];

    return actionResult<MatchResult>({
      runtime: sourceEntry,
      runtimeOptions: matchedQueueType.match.params || {},
      config: matchedQueueType.queueType,
    });
  };
};

export const getEventMatchStoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
});
