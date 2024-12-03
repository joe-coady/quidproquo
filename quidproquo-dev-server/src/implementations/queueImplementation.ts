import { QPQConfig, qpqCoreUtils, QpqFunctionRuntime, QpqRuntimeType, QueueActionType } from 'quidproquo-core';

import { getQueueEventProcessor } from '../actionProcessor/core/event/queue';
import { AnyQueueMessageWithSession } from '../actionProcessor/core/event/queue/types';
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
  if ((!!payload.targetFeature || !!feature) && payload.targetFeature !== qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig)) {
    return;
  }

  console.log('Ready to process: ', JSON.stringify(payload, null, 2));

  await processEvent<AnyQueueMessageWithSession, any>(
    payload,
    qpqConfig,
    getDynamicModuleLoader(qpqConfig, devServerConfig),
    getQueueEventProcessor,
    QpqRuntimeType.QUEUE_EVENT,
  );
};

export const queueImplementation = async (devServerConfig: DevServerConfig) => {
  eventBus.on(QueueActionType.SendMessages, async (payload: AnyQueueMessageWithSession, correlation: string) => {
    console.log('Got QUEUE send message event');
    for (const qpqConfig of devServerConfig.qpqConfigs) {
      await processQueueMessages(qpqConfig, payload, devServerConfig);
    }
  });

  // Never ends
  await new Promise(() => {});
};
