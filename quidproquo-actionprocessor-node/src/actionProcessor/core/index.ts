import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader, QPQConfig } from 'quidproquo-core';

import { getClaudeAiActionProcessor } from './claudeAi';
import { getDateActionProcessor } from './date';
import { getErrorActionProcessor } from './error';
import { getGuidProcessor } from './guid';
import { getLogActionProcessor } from './log';
import { getMathActionProcessor } from './math';
import { getNetworkActionProcessor } from './network';
import { getPlatformActionProcessor } from './platform';
import { getSystemActionProcessor } from './system';
import { getConfigActionProcessor } from './config';
import { getContextActionProcessor } from './context';

export * from './claudeAi';
export * from './date';
export * from './error';
export * from './guid';
export * from './log';
export * from './math';
export * from './network';
export * from './platform';
export * from './system';
export * from './config';
export * from './context';

// Custom actions is not done here, as it has to be done last after all
export * from './customActions';

export const getCoreActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getConfigActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getContextActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getClaudeAiActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getDateActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getErrorActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getGuidProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getLogActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getMathActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getNetworkActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getPlatformActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getSystemActionProcessor(qpqConfig, dynamicModuleLoader)),
});
