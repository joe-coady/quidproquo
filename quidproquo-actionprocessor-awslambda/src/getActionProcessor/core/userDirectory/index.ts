import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
});
