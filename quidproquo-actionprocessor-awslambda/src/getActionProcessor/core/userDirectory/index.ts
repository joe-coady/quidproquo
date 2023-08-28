import { QPQConfig } from 'quidproquo-core';

import getUserDirectoryAuthenticateUserActionProcessor from './getUserDirectoryAuthenticateUserActionProcessor';
import getUserDirectoryChangePasswordActionProcessor from './getUserDirectoryChangePasswordActionProcessor';
import getUserDirectoryConfirmEmailVerificationActionProcessor from './getUserDirectoryConfirmEmailVerificationActionProcessor';
import getUserDirectoryConfirmForgetPasswordActionProcessor from './getUserDirectoryConfirmForgetPasswordActionProcessor';
import getUserDirectoryCreateUserActionProcessor from './getUserDirectoryCreateUserActionProcessor';
import getUserDirectoryDecodeAccessTokenActionProcessor from './getUserDirectoryDecodeAccessTokenActionProcessor';
import getUserDirectoryForgetPasswordActionProcessor from './getUserDirectoryForgetPasswordActionProcessor';
import getUserDirectoryGetUserAttributesActionProcessor from './getUserDirectoryGetUserAttributesActionProcessor';
import getUserDirectoryGetUserAttributesByUserIdActionProcessor from './getUserDirectoryGetUserAttributesByUserIdActionProcessor';
import getUserDirectoryReadAccessTokenActionProcessor from './getUserDirectoryReadAccessTokenActionProcessor';
import getUserDirectoryRefreshTokenActionProcessor from './getUserDirectoryRefreshTokenActionProcessor';
import getUserDirectoryRequestEmailVerificationActionProcessor from './getUserDirectoryRequestEmailVerificationActionProcessor';
import getUserDirectoryRespondToAuthChallengeActionProcessor from './getUserDirectoryRespondToAuthChallengeActionProcessor';
import getUserDirectorySetAccessTokenActionProcessor from './getUserDirectorySetAccessTokenActionProcessor';
import getUserDirectorySetPasswordActionProcessor from './getUserDirectorySetPasswordActionProcessor';
import getUserDirectorySetUserAttributesActionProcessor from './getUserDirectorySetUserAttributesActionProcessor';

export default (qpqConfig: QPQConfig) => ({
  ...getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  ...getUserDirectoryChangePasswordActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmEmailVerificationActionProcessor(qpqConfig),
  ...getUserDirectoryConfirmForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryCreateUserActionProcessor(qpqConfig),
  ...getUserDirectoryDecodeAccessTokenActionProcessor(qpqConfig),
  ...getUserDirectoryForgetPasswordActionProcessor(qpqConfig),
  ...getUserDirectoryGetUserAttributesActionProcessor(qpqConfig),
  ...getUserDirectoryGetUserAttributesByUserIdActionProcessor(qpqConfig),
  ...getUserDirectoryReadAccessTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRefreshTokenActionProcessor(qpqConfig),
  ...getUserDirectoryRequestEmailVerificationActionProcessor(qpqConfig),
  ...getUserDirectoryRespondToAuthChallengeActionProcessor(qpqConfig),
  ...getUserDirectorySetAccessTokenActionProcessor(qpqConfig),
  ...getUserDirectorySetPasswordActionProcessor(qpqConfig),
  ...getUserDirectorySetUserAttributesActionProcessor(qpqConfig),
});
