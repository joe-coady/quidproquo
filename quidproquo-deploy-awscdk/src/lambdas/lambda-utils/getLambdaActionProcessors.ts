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
    ...getConfigGetGlobalActionProcessor(qpqConfig),
    ...getConfigSetParameterActionProcessor(qpqConfig),
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
    ...getContextActionProcessor(qpqConfig),

    ...qpqCustomActionProcessors(),
  };

  return storyActionProcessor;
};
