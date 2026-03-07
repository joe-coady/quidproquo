import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getRouteAuthValidationDecodeActionProcessor } from './getRouteAuthValidationDecodeActionProcessor';

export const getRouteAuthValidationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getRouteAuthValidationDecodeActionProcessor(qpqConfig, dynamicModuleLoader)),
});
