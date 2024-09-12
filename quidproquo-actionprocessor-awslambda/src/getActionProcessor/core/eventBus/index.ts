import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getEventBusSendMessagesActionProcessor } from './getEventBusSendMessagesActionProcessor';

export const getEventBusActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getEventBusSendMessagesActionProcessor(qpqConfig)),
});
