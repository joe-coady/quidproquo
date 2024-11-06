import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getServiceFunctionActionProcessor } from './serviceFunctionOverride';

export const getWebserverActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getServiceFunctionActionProcessor(qpqConfig, dynamicModuleLoader)),
});
