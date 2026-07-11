import { askProcessEvent, askProcessEventWithGroupOrdering, DynamicModuleLoader, QPQConfig, QpqRuntimeType, QueueEvent } from 'quidproquo-core';

import { SQSEvent } from 'aws-lambda';

import { getSqsQueueEventProcessor } from '../getActionProcessor';
import { getQueueConfigSetting } from '../getActionProcessor/core/event/sqs/queue/getEventMatchStoryActionProcessor';
import { getQpqLambdaRuntimeForEvent } from './helpers/getQpqLambdaRuntimeForEvent';

const getProcessEventStory = (qpqConfig: QPQConfig): typeof askProcessEvent => {
  // FIFO queues must process records one group at a time, blocking a group once a record fails
  if (getQueueConfigSetting(qpqConfig).isFifo) {
    return function* askProcessQueueEventWithGroupOrdering(...eventArguments) {
      return yield* askProcessEventWithGroupOrdering((record: QueueEvent<any>) => record.groupId, ...eventArguments);
    };
  }

  return askProcessEvent;
};

export const getSqsEvent_queueEvent = (dynamicModuleLoader: DynamicModuleLoader, qpqConfig: QPQConfig) =>
  getQpqLambdaRuntimeForEvent<SQSEvent>(
    QpqRuntimeType.QUEUE_EVENT,
    (event) => {
      return {
        depth: 0,
        context: {},
      };
    },
    getSqsQueueEventProcessor,
    dynamicModuleLoader,
    qpqConfig,
    () => getProcessEventStory(qpqConfig),
  );
