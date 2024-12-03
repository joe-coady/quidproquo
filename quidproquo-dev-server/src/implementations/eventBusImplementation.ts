import { EventBusActionType, QPQConfig, qpqCoreUtils, QpqFunctionRuntime, QueueActionType } from 'quidproquo-core';

import { v4 as uuidV4 } from 'uuid';

import { AnyQueueMessageWithSession } from '../actionProcessor/core/event/queue/types';
import { AnyEventBusMessageWithSession } from '../actionProcessor/core/eventBus/getEventBusSendMessagesActionProcessor';
import { eventBus } from '../logic';
import { DevServerConfig } from '../types';

const processQueueEventBusSubscriptions = async (qpqConfig: QPQConfig, ebMessage: AnyEventBusMessageWithSession) => {
  const allEventBuses = qpqCoreUtils.getAllEventBusConfigs(qpqConfig).filter((ebc) => {
    return (
      (!ebc.owner?.application || ebc.owner?.application === ebMessage.targetApplication) &&
      (!ebc.owner?.environment || ebc.owner?.environment === ebMessage.targetEnvironment) &&
      (!ebc.owner?.module || ebc.owner?.module === ebMessage.targetModule) &&
      ((!ebc.owner?.feature && !ebMessage.targetFeature) || ebc.owner?.feature === ebMessage.targetFeature)
    );
  });

  // All the queues that we should publish to
  const queues = qpqCoreUtils.getQueues(qpqConfig).filter((q) => {
    return !!q.eventBusSubscriptions.find((ebsub) => {
      return allEventBuses.some((eb) => ebsub === eb.owner?.resourceNameOverride || (!eb.owner?.resourceNameOverride && ebsub === eb.name));
    });
  });

  for (const queue of queues) {
    const queueMessage: AnyQueueMessageWithSession = {
      payload: ebMessage.payload,
      type: ebMessage.type,

      storySession: ebMessage.storySession,

      queueName: queue.name,

      targetApplication: queue.owner?.application || qpqCoreUtils.getApplicationName(qpqConfig),
      targetEnvironment: queue.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig),
      targetFeature: queue.owner?.feature || qpqCoreUtils.getApplicationModuleFeature(qpqConfig),
      targetModule: queue.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig),

      messageId: uuidV4(),
    };

    eventBus.publish(QueueActionType.SendMessages, queueMessage);
  }
};

export const eventBusImplementation = async (devServerConfig: DevServerConfig) => {
  eventBus.on(EventBusActionType.SendMessages, async (payload: AnyEventBusMessageWithSession, correlation: string) => {
    for (const qpqConfig of devServerConfig.qpqConfigs) {
      await processQueueEventBusSubscriptions(qpqConfig, payload);
    }
  });

  // Never ends
  await new Promise(() => {});
};
