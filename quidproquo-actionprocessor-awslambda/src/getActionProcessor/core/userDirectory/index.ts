import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryAuthenticateUserActionProcessor from './getUserDirectoryAuthenticateUserActionProcessor';
import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';
import getUserDirectoryForgetPasswordActionProcessor from './getUserDirectoryForgetPasswordActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
  ...getUserDirectoryForgetPasswordActionProcessor(qpqConfig),
});
