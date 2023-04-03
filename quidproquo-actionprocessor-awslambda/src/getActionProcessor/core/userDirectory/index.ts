import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryAuthenticateUserActionProcessor from './getUserDirectoryAuthenticateUserActionProcessor';
import getUserDirectoryConfirmForgetPasswordActionProcessor from './getUserDirectoryConfirmForgetPasswordActionProcessor';
import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';
import getUserDirectoryForgetPasswordActionProcessor from './getUserDirectoryForgetPasswordActionProcessor';
import getUserDirectoryRefreshTokenActionProcessor from './getUserDirectoryRefreshTokenActionProcessor';
import getUserDirectoryRequestEmailVerificationActionProcessor from './getUserDirectoryRequestEmailVerificationActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
  ...getUserDirectoryForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryRefreshTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRequestEmailVerificationActionProcessor(qpqConfig),
});
