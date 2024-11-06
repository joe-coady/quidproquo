import { getAwsActionProcessors } from 'quidproquo-actionprocessor-awslambda';
import { getCustomActionActionProcessor } from 'quidproquo-actionprocessor-node';
import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getCoreActionProcessor } from './core';
import { getWebserverActionProcessor } from './webserver';

export * from './core';
export * from './webserver';

export const getDevServerActionProcessors: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => {
  const storyActionProcessor = {
    // Start with all the aws action processors..
    ...(await getAwsActionProcessors(qpqConfig, dynamicModuleLoader)),

    // Override with custom ones
    ...(await getCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
    ...(await getWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),

    // Always done last, so they can ovveride the default ones if the user wants.
    ...(await getCustomActionActionProcessor(qpqConfig, dynamicModuleLoader)),
  };

  return storyActionProcessor;
};
