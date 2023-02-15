import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryAuthenticateUserActionProcessor from './getUserDirectoryAuthenticateUserActionProcessor';
import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
});
