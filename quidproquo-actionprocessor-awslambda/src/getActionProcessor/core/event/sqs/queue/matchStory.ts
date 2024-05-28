import {
  ErrorTypeEnum,
  EventActionType,
  EventMatchStoryActionProcessor,
  QPQConfig,
  QueueQPQConfigSetting,
  actionResult,
  actionResultError,
  qpqCoreUtils,
} from 'quidproquo-core';
import { InternalEventRecord, MatchResult } from './types';

import { matchUrl } from '../../../../../awsLambdaUtils';

export const getQueueConfigSetting = (): QueueQPQConfigSetting => {
  const queueQPQConfigSetting: QueueQPQConfigSetting = JSON.parse(process.env.queueQPQConfigSetting as string);

  // TODO: Validate here

  return queueQPQConfigSetting;
};

const getProcessMatchStory = (qpqConfig: QPQConfig): EventMatchStoryActionProcessor<InternalEventRecord, MatchResult> => {
  // TODO: Get this out of the qpqconfig like the other event processors
  const queueQPQConfigSetting = getQueueConfigSetting();

  return async ({ qpqEventRecord }) => {
    const queueQueueProcessors = qpqCoreUtils.getQueueQueueProcessors(queueQPQConfigSetting.name, qpqConfig);

    const queueTypes = Object.keys(queueQueueProcessors).sort();

    // Find the most relevant match
    const matchedQueueType = queueTypes
      .map((qt) => ({
        match: matchUrl(qt, qpqEventRecord.type),
        queueType: qt,
      }))
      .find((m) => m.match.didMatch);

    if (!matchedQueueType) {
      // If we have event bus subscriptions then we don't want to error if we can't match
      // early exit will just exit gracefully
      if (queueQPQConfigSetting.eventBusSubscriptions.length > 0) {
        return actionResult<MatchResult>({});
      }

      return actionResultError(ErrorTypeEnum.NotFound, `queue type not found ${qpqEventRecord.type}`);
    }

    const sourceEntry = queueQueueProcessors[matchedQueueType.queueType];

    return actionResult<MatchResult>({
      src: sourceEntry.src,
      runtime: sourceEntry.runtime,
      runtimeOptions: matchedQueueType.match.params || {},
      config: matchedQueueType.queueType,
    });
  };
};
export default (qpqConfig: QPQConfig) => {
  return {
    [EventActionType.MatchStory]: getProcessMatchStory(qpqConfig),
  };
};
