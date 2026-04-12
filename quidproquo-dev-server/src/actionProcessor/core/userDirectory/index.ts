import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getUserDirectoryDecodeAccessTokenActionProcessor } from './getUserDirectoryDecodeAccessTokenActionProcessor';

export const getUserDirectoryActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getUserDirectoryDecodeAccessTokenActionProcessor(qpqConfig, dynamicModuleLoader)),
});
