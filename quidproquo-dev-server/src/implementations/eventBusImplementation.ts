import { EventBusActionType, QPQConfig, qpqCoreUtils, QpqFunctionRuntime } from 'quidproquo-core';

import { AnyEventBusMessageWithSession } from '../actionProcessor/core/eventBus/getEventBusSendMessagesActionProcessor';
import { eventBus } from '../logic';
import { DevServerConfig } from '../types';

const getDynamicModuleLoader = (qpqConfig: QPQConfig, devServerConfig: DevServerConfig) => {
  const serviceName = qpqCoreUtils.getApplicationModuleName(qpqConfig);
  return async (runtime: QpqFunctionRuntime): Promise<any> => devServerConfig.dynamicModuleLoader(serviceName, runtime);
};

const processQueueEventBusSubscriptions = async (qpqConfig: QPQConfig, payload: AnyEventBusMessageWithSession) => {
  //
};

export const eventBusImplementation = async (devServerConfig: DevServerConfig) => {
  eventBus.on(EventBusActionType.SendMessages, async (payload: AnyEventBusMessageWithSession, correlation: string) => {
    for (const qpqConfig of devServerConfig.qpqConfigs) {
      await processQueueEventBusSubscriptions(qpqConfig, payload);
    }

    // const eventPromise = await processEvent<AnyEventBusMessageWithSession, any>(
    //   payload,
    //   qpqConfig!,
    //   getDynamicModuleLoader(qpqConfig!, devServerConfig),
    //   getNodeServiceFunctionEventProcessor,
    //   QpqRuntimeType.SERVICE_FUNCTION_EXE,
    // );
  });

  // Never ends
  await new Promise(() => {});
};
