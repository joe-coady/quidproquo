import { QPQConfig } from 'quidproquo-core';

import {
  coreActionProcessor,
  webserverActionProcessor,
  getConfigActionProcessor,
} from 'quidproquo-actionprocessor-node';

import {
  getSystemActionProcessor,
  getFileActionProcessor,
  getQueueActionProcessor,
  getEventBusActionProcessor,
  getConfigGetSecretActionProcessor,
  getConfigGetParameterActionProcessor,
  getConfigGetParametersActionProcessor,
  getUserDirectoryActionProcessor,
  getWebEntryActionProcessor,
  getServiceFunctionActionProcessor,
  getWebsocketActionProcessor,
  getAdminActionProcessor,
  getKeyValueStoreActionProcessor,
} from 'quidproquo-actionprocessor-awslambda';

import { dynamicModuleLoader } from '../dynamicModuleLoader';

// @ts-ignore - Special webpack loader
import qpqCustomActionProcessors from 'qpq-custom-action-processors-loader!';

export const getLambdaActionProcessors = (qpqConfig: QPQConfig) => {
  const storyActionProcessor = {
    ...coreActionProcessor,
    ...webserverActionProcessor,

    ...getConfigGetSecretActionProcessor(qpqConfig),
    ...getConfigGetParameterActionProcessor(qpqConfig),
    ...getConfigGetParametersActionProcessor(qpqConfig),
    ...getSystemActionProcessor(qpqConfig, dynamicModuleLoader),
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

    ...qpqCustomActionProcessors(),
  };

  return storyActionProcessor;
};
