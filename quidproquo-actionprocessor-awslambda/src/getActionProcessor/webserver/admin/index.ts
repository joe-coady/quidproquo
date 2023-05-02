import { QPQConfig } from 'quidproquo-core';

import getAdminActionProcessor from './getAdminActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getAdminActionProcessor(qpqConfig),
});
