import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

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

export const getCoreActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getConfigActionProcessor(qpqConfig)),
  ...(await getContextActionProcessor(qpqConfig)),
  ...(await getClaudeAiActionProcessor(qpqConfig)),
  ...(await getDateActionProcessor(qpqConfig)),
  ...(await getErrorActionProcessor(qpqConfig)),
  ...(await getGuidProcessor(qpqConfig)),
  ...(await getLogActionProcessor(qpqConfig)),
  ...(await getMathActionProcessor(qpqConfig)),
  ...(await getNetworkActionProcessor(qpqConfig)),
  ...(await getPlatformActionProcessor(qpqConfig)),
  ...(await getSystemActionProcessor(qpqConfig)),
});
