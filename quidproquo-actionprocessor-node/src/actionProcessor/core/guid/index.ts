import { ActionProcessorList, ActionProcessorListResolver, DynamicModuleLoader,QPQConfig } from 'quidproquo-core';

import { getGuidNewActionProcessor } from './getGuidNewActionProcessor';
import { getGuidNewSortableActionProcessor } from './getGuidNewSortableActionProcessor';

export const getGuidProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
  dynamicModuleLoader: DynamicModuleLoader,
): Promise<ActionProcessorList> => ({
  ...(await getGuidNewActionProcessor(qpqConfig, dynamicModuleLoader)),
  ...(await getGuidNewSortableActionProcessor(qpqConfig, dynamicModuleLoader)),
});
