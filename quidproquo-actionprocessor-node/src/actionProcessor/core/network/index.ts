import { QPQConfig, ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader } from 'quidproquo-core';

import { getNetworkRequestActionProcessor } from './getNetworkRequestActionProcessor';

export const getNetworkActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getNetworkRequestActionProcessor(qpqConfig, dynamicModuleLoader)),
});
