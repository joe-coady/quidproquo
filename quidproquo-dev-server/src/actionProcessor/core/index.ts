import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getGraphDatabaseActionProcessor } from './graphDatabaseOverride';
export * from './event';

export const getCoreActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getGraphDatabaseActionProcessor(qpqConfig, dynamicModuleLoader)),
});
