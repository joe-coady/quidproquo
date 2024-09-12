import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getContextListActionProcessor } from './getContextListActionProcessor';
import { getContextReadActionProcessor } from './getContextReadActionProcessor';

export const getContextActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getContextListActionProcessor(qpqConfig)),
  ...(await getContextReadActionProcessor(qpqConfig)),
});
