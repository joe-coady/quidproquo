import {
  getCoreActionProcessor as getJsCoreActionProcessor,
  getWebserverActionProcessor as getJsWebserverActionProcessor,
} from 'quidproquo-actionprocessor-js';
import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import {
  getCoreActionProcessor as getWebCoreActionProcessor,
  getWebActionProcessor,
  getWebserverActionProcessor as getWebWebserverActionProcessor,
} from './actionProcessor';

export const getWebActionProcessors: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getJsCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getJsWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),

  ...(await getWebCoreActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getWebWebserverActionProcessor(qpqConfig, dynamicModuleLoader)),

  ...(await getWebActionProcessor(qpqConfig, dynamicModuleLoader)),
});
