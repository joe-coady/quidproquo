import { EventBusActionType, QPQConfig, qpqCoreUtils, QpqFunctionRuntime, QpqRuntimeType, QueueActionType } from 'quidproquo-core';

import { v4 as uuidV4 } from 'uuid';

import { getQueueEventProcessor } from '../actionProcessor/core/event/queue';
import { AnyQueueMessageWithSession } from '../actionProcessor/core/event/queue/types';
import { AnyEventBusMessageWithSession } from '../actionProcessor/core/eventBus/getEventBusSendMessagesActionProcessor';
import { eventBus, processEvent } from '../logic';
import { DevServerConfig } from '../types';

const getDynamicModuleLoader = (qpqConfig: QPQConfig, devServerConfig: DevServerConfig) => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (runtime: QpqFunctionRuntime): Promise<any> => devServerConfig.dynamicModuleLoader(serviceName, runtime);
};

const processQueueMessages = async (qpqConfig: QPQConfig, payload: AnyQueueMessageWithSession, devServerConfig: DevServerConfig) => {
  if (payload.targetEnvironment !== qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig)) {
    return;
  }

  if (payload.targetApplication !== qpqCoreUtils.getApplicationName(qpqConfig)) {
    return;
  }

  if (payload.targetModule !== qpqCoreUtils.getApplicationModuleName(qpqConfig)) {
    return;
  }

  const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);
  if ((!!payload.targetFeature || !!feature) && payload.targetFeature !== feature) {
    return;
  }

  await processEvent<AnyQueueMessageWithSession, any>(
    payload,
    qpqConfig,
    getDynamicModuleLoader(qpqConfig, devServerConfig),
    getQueueEventProcessor,
    QpqRuntimeType.QUEUE_EVENT,
  );
};

const processQueueEventBusSubscriptions = async (qpqConfig: QPQConfig, ebMessage: AnyEventBusMessageWithSession) => {
  const thisServiceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);

  const allEventBuses = qpqCoreUtils.getAllEventBusConfigs(qpqConfig).filter((ebc) => {
    const srcApplication = ebc.owner?.application || qpqCoreUtils.getApplicationName(qpqConfig);
    const srcEnvironment = ebc.owner?.environment || qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
    const srcFeature = ebc.owner?.feature || qpqCoreUtils.getApplicationModuleFeature(qpqConfig);
    const srcModule = ebc.owner?.module || qpqCoreUtils.getApplicationModuleName(qpqConfig);

    return (
      srcApplication === ebMessage.targetApplication &&
      srcEnvironment === ebMessage.targetEnvironment &&
      srcModule === ebMessage.targetModule &&
      ((!srcFeature && !ebMessage.targetFeature) || srcFeature === ebMessage.targetFeature)
    );
  });

  // All the queues that we should publish to
  const queues = qpqCoreUtils
    .getQueues(qpqConfig)
    .filter((q) => {
      return !!q.eventBusSubscriptions.find((ebsub) => {
        return allEventBuses.some((eb) => ebsub === eb.name);
      });
    })
    .filter((q) => !q.owner?.module || q.owner?.module === thisServiceName);

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

export const queueImplementation = async (devServerConfig: DevServerConfig) => {
  eventBus.on(QueueActionType.SendMessages, async (payload: AnyQueueMessageWithSession, correlation: string) => {
    for (const qpqConfig of devServerConfig.qpqConfigs) {
      await processQueueMessages(qpqConfig, payload, devServerConfig);
    }
  });

  eventBus.on(EventBusActionType.SendMessages, async (payload: AnyEventBusMessageWithSession, correlation: string) => {
    for (const qpqConfig of devServerConfig.qpqConfigs) {
      await processQueueEventBusSubscriptions(qpqConfig, payload);
    }
  });

  // Never ends
  await new Promise(() => {});
};
