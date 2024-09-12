import { QPQConfig, ActionProcessorList, ActionProcessorListResolver } from 'quidproquo-core';

import { getGuidNewActionProcessor } from './getGuidNewActionProcessor';
import { getGuidNewSortableActionProcessor } from './getGuidNewSortableActionProcessor';

export const getGuidProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getGuidNewActionProcessor(qpqConfig)),
  ...(await getGuidNewSortableActionProcessor(qpqConfig)),
});
