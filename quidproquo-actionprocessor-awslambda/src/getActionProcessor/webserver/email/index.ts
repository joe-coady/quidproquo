import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getEmailSendEmailActionProcessor } from './getEmailSendEmailActionProcessor';

export const getEmailActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getEmailSendEmailActionProcessor(qpqConfig, dynamicModuleLoader)),
});
