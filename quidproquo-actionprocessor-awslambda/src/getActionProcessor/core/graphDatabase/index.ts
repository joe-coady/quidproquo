import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getGraphDatabaseGetEndpointsActionProcessor } from './getGraphDatabaseGetEndpointsActionProcessor';

export const getGraphDatabaseActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getGraphDatabaseGetEndpointsActionProcessor(qpqConfig, dynamicModuleLoader)),
});
