import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getQueueSendMessagesActionProcessor } from './getQueueSendMessageActionProcessor';

export const getQueueActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getQueueSendMessagesActionProcessor(qpqConfig)),
});
