import { ActionProcessorList, ActionProcessorListResolver, QPQConfig, DynamicModuleLoader } from 'quidproquo-core';

import { getConfigGetGlobalActionProcessor } from './getConfigGetGlobalActionProcessor';
import { getConfigGetParameterActionProcessor } from './getConfigGetParameterActionProcessor';
import { getConfigGetParametersActionProcessor } from './getConfigGetParametersActionProcessor';
import { getConfigGetSecretActionProcessor } from './getConfigGetSecretActionProcessor';
import { getConfigSetParameterActionProcessor } from './getConfigSetParameterActionProcessor';

export const getConfigActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getConfigGetGlobalActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getConfigGetParameterActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getConfigGetParametersActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getConfigGetSecretActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getConfigSetParameterActionProcessor(qpqConfig, dynamicModuleLoader)),
});
