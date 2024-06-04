import { QPQConfig } from 'quidproquo-core';

import {
  coreActionProcessor,
  webserverActionProcessor,
  getConfigActionProcessor,
  getContextActionProcessor,
} from 'quidproquo-actionprocessor-node';

import {
  getSystemActionProcessor,
  getFileActionProcessor,
  getQueueActionProcessor,
  getEventBusActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  getConfigGetParametersActionProcessor,
  getConfigGetGlobalActionProcessor,
  getConfigSetParameterActionProcessor,
  getUserDirectoryActionProcessor,
  getWebEntryActionProcessor,
  getServiceFunctionActionProcessor,
  getWebsocketActionProcessor,
  getAdminActionProcessor,
  getKeyValueStoreActionProcessor,
  dynamicModuleLoader
} from 'quidproquo-actionprocessor-awslambda';

export const getLambdaActionProcessors = (qpqConfig: QPQConfig) => {
  const storyActionProcessor = {
    ...coreActionProcessor,
    ...webserverActionProcessor,

    ...getConfigGetSecretActionProcessor(qpqConfig),
    ...getConfigGetParameterActionProcessor(qpqConfig),
    ...getConfigGetParametersActionProcessor(qpqConfig),
    ...getConfigGetGlobalActionProcessor(qpqConfig),
    ...getConfigSetParameterActionProcessor(qpqConfig),
    ...getFileActionProcessor(qpqConfig),
    ...getConfigActionProcessor(qpqConfig),
    ...getQueueActionProcessor(qpqConfig),
    ...getEventBusActionProcessor(qpqConfig),
    ...getUserDirectoryActionProcessor(qpqConfig),
    ...getWebEntryActionProcessor(qpqConfig),
    ...getServiceFunctionActionProcessor(qpqConfig),
    ...getAdminActionProcessor(qpqConfig),
    ...getKeyValueStoreActionProcessor(qpqConfig),
    ...getWebsocketActionProcessor(qpqConfig),
    ...getContextActionProcessor(qpqConfig),

    ...getSystemActionProcessor(qpqConfig, dynamicModuleLoader),
  };

  return storyActionProcessor;
};
