import { QPQConfig } from 'quidproquo-core';

import getWebsocketSendMessageActionProcessor from './getWebsocketSendMessageActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getWebsocketSendMessageActionProcessor(qpqConfig),
});