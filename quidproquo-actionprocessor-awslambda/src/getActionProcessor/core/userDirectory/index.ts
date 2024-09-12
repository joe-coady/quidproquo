import { ActionProcessorList, ActionProcessorListResolver, QPQConfig } from 'quidproquo-core';

import { getUserDirectoryAuthenticateUserActionProcessor } from './getUserDirectoryAuthenticateUserActionProcessor';
import { getUserDirectoryChangePasswordActionProcessor } from './getUserDirectoryChangePasswordActionProcessor';
import { getUserDirectoryConfirmEmailVerificationActionProcessor } from './getUserDirectoryConfirmEmailVerificationActionProcessor';
import { getUserDirectoryConfirmForgotPasswordActionProcessor } from './getUserDirectoryConfirmForgotPasswordActionProcessor';
import { getUserDirectoryCreateUserActionProcessor } from './getUserDirectoryCreateUserActionProcessor';
import { getUserDirectoryDecodeAccessTokenActionProcessor } from './getUserDirectoryDecodeAccessTokenActionProcessor';
import { getUserDirectoryForgotPasswordActionProcessor } from './getUserDirectoryForgotPasswordActionProcessor';
import { getUserDirectoryGetUserAttributesActionProcessor } from './getUserDirectoryGetUserAttributesActionProcessor';
import { getUserDirectoryGetUserAttributesByUserIdActionProcessor } from './getUserDirectoryGetUserAttributesByUserIdActionProcessor';
import { getUserDirectoryGetUsersActionProcessor } from './getUserDirectoryGetUsersActionProcessor';
import { getUserDirectoryGetUsersByAttributeActionProcessor } from './getUserDirectoryGetUsersByAttributeActionProcessor';
import { getUserDirectoryReadAccessTokenActionProcessor } from './getUserDirectoryReadAccessTokenActionProcessor';
import { getUserDirectoryRefreshTokenActionProcessor } from './getUserDirectoryRefreshTokenActionProcessor';
import { getUserDirectoryRequestEmailVerificationActionProcessor } from './getUserDirectoryRequestEmailVerificationActionProcessor';
import { getUserDirectoryRespondToAuthChallengeActionProcessor } from './getUserDirectoryRespondToAuthChallengeActionProcessor';
import { getUserDirectorySetAccessTokenActionProcessor } from './getUserDirectorySetAccessTokenActionProcessor';
import { getUserDirectorySetPasswordActionProcessor } from './getUserDirectorySetPasswordActionProcessor';
import { getUserDirectorySetUserAttributesActionProcessor } from './getUserDirectorySetUserAttributesActionProcessor';

export const getUserDirectoryActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  ...(await getUserDirectoryAuthenticateUserActionProcessor(qpqConfig)),
  ...(await getUserDirectoryChangePasswordActionProcessor(qpqConfig)),
  ...(await getUserDirectoryConfirmEmailVerificationActionProcessor(qpqConfig)),
  ...(await getUserDirectoryConfirmForgotPasswordActionProcessor(qpqConfig)),
  ...(await getUserDirectoryCreateUserActionProcessor(qpqConfig)),
  ...(await getUserDirectoryDecodeAccessTokenActionProcessor(qpqConfig)),
  ...(await getUserDirectoryForgotPasswordActionProcessor(qpqConfig)),
  ...(await getUserDirectoryGetUserAttributesActionProcessor(qpqConfig)),
  ...(await getUserDirectoryGetUserAttributesByUserIdActionProcessor(qpqConfig)),
  ...(await getUserDirectoryGetUsersActionProcessor(qpqConfig)),
  ...(await getUserDirectoryGetUsersByAttributeActionProcessor(qpqConfig)),
  ...(await getUserDirectoryReadAccessTokenActionProcessor(qpqConfig)),
  ...(await getUserDirectoryRefreshTokenActionProcessor(qpqConfig)),
  ...(await getUserDirectoryRequestEmailVerificationActionProcessor(qpqConfig)),
  ...(await getUserDirectoryRespondToAuthChallengeActionProcessor(qpqConfig)),
  ...(await getUserDirectorySetAccessTokenActionProcessor(qpqConfig)),
  ...(await getUserDirectorySetPasswordActionProcessor(qpqConfig)),
  ...(await getUserDirectorySetUserAttributesActionProcessor(qpqConfig)),
});
