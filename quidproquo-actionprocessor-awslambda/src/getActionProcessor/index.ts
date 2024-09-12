import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, DynamicModuleLoader } from 'quidproquo-core';
import { getCoreActionProcessor as getAwsCoreActionProcessor } from './core';
import { getWebserverActionProcessor as getAwsWebserverActionProcessor } from './webserver';

import {
  getCoreActionProcessor as getNodeCoreActionProcessor,
  getWebserverActionProcessor as getNodeWebserverActionProcessor,
  getCustomActionActionProcessor,
} from 'quidproquo-actionprocessor-node';

export const getAwsActionProcessors: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => {
  const storyActionProcessor = {
    ...(await getNodeCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getNodeWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),

    ...(await getAwsCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getAwsWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),

    // Always done last, so they can ovveride the default ones if the user wants.
    ...(await getCustomActionActionProcessor(qpqConfig, dynamicModuleLoader)),
  };

  return storyActionProcessor;
};

export * from './core';
export * from './webserver';
