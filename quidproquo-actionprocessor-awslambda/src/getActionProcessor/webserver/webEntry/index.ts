import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getWebEntryInvalidateCacheActionProcessor } from './getWebEntryInvalidateCacheActionProcessor';

export const getWebEntryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getWebEntryInvalidateCacheActionProcessor(qpqConfig)),
});
