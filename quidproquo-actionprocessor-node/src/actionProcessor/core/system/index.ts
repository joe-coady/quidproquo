import { QPQConfig, ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader } from 'quidproquo-core';

import { getSystemBatchActionProcessor } from './getSystemBatchActionProcessor';

export const getSystemActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getSystemBatchActionProcessor(qpqConfig, dynamicModuleLoader)),
});