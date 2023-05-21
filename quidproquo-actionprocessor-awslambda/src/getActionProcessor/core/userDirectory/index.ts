import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryAuthenticateUserActionProcessor from './getUserDirectoryAuthenticateUserActionProcessor';
import getUserDirectoryConfirmEmailVerificationActionProcessor from './getUserDirectoryConfirmEmailVerificationActionProcessor';
import getUserDirectoryConfirmForgetPasswordActionProcessor from './getUserDirectoryConfirmForgetPasswordActionProcessor';
import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';
import getUserDirectoryForgetPasswordActionProcessor from './getUserDirectoryForgetPasswordActionProcessor';
import getUserDirectoryGetUserAttributesActionProcessor from './getUserDirectoryGetUserAttributesActionProcessor';
import getUserDirectoryReadAccessTokenActionProcessor from './getUserDirectoryReadAccessTokenActionProcessor';
import getUserDirectoryRefreshTokenActionProcessor from './getUserDirectoryRefreshTokenActionProcessor';
import getUserDirectoryRequestEmailVerificationActionProcessor from './getUserDirectoryRequestEmailVerificationActionProcessor';
import getUserDirectoryRespondToAuthChallengeActionProcessor from './getUserDirectoryRespondToAuthChallengeActionProcessor';
import getUserDirectorySetUserAttributesActionProcessor from './getUserDirectorySetUserAttributesActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmEmailVerificationActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
  ...getUserDirectoryForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryGetUserAttributesActionProcessor(qpqConfig),
  ...getUserDirectoryReadAccessTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRefreshTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRequestEmailVerificationActionProcessor(qpqConfig),
  ...getUserDirectoryRespondToAuthChallengeActionProcessor(qpqConfig),
  ...getUserDirectorySetUserAttributesActionProcessor(qpqConfig),
});
