import { QPQConfig } from 'quidproquo-core';

import getServiceFunctionActionProcessor from './getServiceFunctionActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getServiceFunctionActionProcessor(qpqConfig),
});
