import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getWebsocketSendMessageActionProcessor } from './getWebsocketSendMessageActionProcessor';

export const getWebsocketActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getWebsocketSendMessageActionProcessor(qpqConfig)),
});
