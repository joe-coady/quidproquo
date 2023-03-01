import { QPQConfig } from 'quidproquo-core';

import getQueueSendMessageActionProcessor from './getQueueSendMessageActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getQueueSendMessageActionProcessor(qpqConfig),
});
