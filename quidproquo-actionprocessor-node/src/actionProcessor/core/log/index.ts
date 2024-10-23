import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader,QPQConfig } from 'quidproquo-core';

import { getLogCreateActionProcessor } from './getLogCreateActionProcessor';

export const getLogActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getLogCreateActionProcessor(qpqConfig, dynamicModuleLoader)),
});
