import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getExtractExpenseActionProcessor } from './getExtractExpenseActionProcessor';

export const getExtractActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getExtractExpenseActionProcessor(qpqConfig, dynamicModuleLoader)),
});