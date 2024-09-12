import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getConfigGetGlobalActionProcessor } from './getConfigGetGlobalActionProcessor';
import { getConfigGetParameterActionProcessor } from './getConfigGetParameterActionProcessor';
import { getConfigGetParametersActionProcessor } from './getConfigGetParametersActionProcessor';
import { getConfigGetSecretActionProcessor } from './getConfigGetSecretActionProcessor';
import { getConfigSetParameterActionProcessor } from './getConfigSetParameterActionProcessor';

export const getConfigActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getConfigGetGlobalActionProcessor(qpqConfig)),
  ...(await getConfigGetParameterActionProcessor(qpqConfig)),
  ...(await getConfigGetParametersActionProcessor(qpqConfig)),
  ...(await getConfigGetSecretActionProcessor(qpqConfig)),
  ...(await getConfigSetParameterActionProcessor(qpqConfig)),
});
