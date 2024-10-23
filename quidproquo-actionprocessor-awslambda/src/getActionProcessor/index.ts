import {
  getCoreActionProcessor as getNodeCoreActionProcessor,
  getWebserverActionProcessor as getNodeWebserverActionProcessor,
} from 'quidproquo-actionprocessor-node';
import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader,QPQConfig } from 'quidproquo-core';

import { getCoreActionProcessor as getAwsCoreActionProcessor } from './core';
import { getWebserverActionProcessor as getAwsWebserverActionProcessor } from './webserver';

export const getAwsActionProcessors: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => {
  const storyActionProcessor = {
    ...(await getNodeCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getNodeWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),

    ...(await getAwsCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getAwsWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),
  };

  return storyActionProcessor;
};

export * from './core';
export * from './webserver';
