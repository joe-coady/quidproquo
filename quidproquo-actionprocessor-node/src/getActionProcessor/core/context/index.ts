import { QPQConfig } from 'quidproquo-core';

import getContextReadActionProcessor from './getContextReadActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getContextReadActionProcessor(qpqConfig),
});
