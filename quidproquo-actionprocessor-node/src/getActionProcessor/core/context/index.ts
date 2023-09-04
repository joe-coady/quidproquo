import { QPQConfig } from 'quidproquo-core';

import getContextListActionProcessor from './getContextListActionProcessor';
import getContextReadActionProcessor from './getContextReadActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getContextListActionProcessor(qpqConfig),
  ...getContextReadActionProcessor(qpqConfig),
});
