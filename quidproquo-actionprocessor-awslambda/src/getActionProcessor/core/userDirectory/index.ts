import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryAuthenticateUserActionProcessor from './getUserDirectoryAuthenticateUserActionProcessor';
import getUserDirectoryConfirmEmailVerificationActionProcessor from './getUserDirectoryConfirmEmailVerificationActionProcessor';
import getUserDirectoryConfirmForgetPasswordActionProcessor from './getUserDirectoryConfirmForgetPasswordActionProcessor';
import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';
import getUserDirectoryForgetPasswordActionProcessor from './getUserDirectoryForgetPasswordActionProcessor';
import getUserDirectoryReadAccessTokenActionProcessor from './getUserDirectoryReadAccessTokenActionProcessor';
import getUserDirectoryRefreshTokenActionProcessor from './getUserDirectoryRefreshTokenActionProcessor';
import getUserDirectoryRequestEmailVerificationActionProcessor from './getUserDirectoryRequestEmailVerificationActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmEmailVerificationActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
  ...getUserDirectoryForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryReadAccessTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRefreshTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRequestEmailVerificationActionProcessor(qpqConfig),
});
