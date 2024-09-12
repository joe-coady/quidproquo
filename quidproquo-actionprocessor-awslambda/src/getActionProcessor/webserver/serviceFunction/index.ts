import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getServiceFunctionExecuteActionProcessor } from './getServiceFunctionExecuteActionProcessor';

export const getServiceFunctionActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getServiceFunctionExecuteActionProcessor(qpqConfig)),
});
