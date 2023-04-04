import {
  UserDirectoryConfirmEmailVerificationActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { verifyUserEmail } from '../../../logic/cognito/verifyUserEmail';

const getUserDirectoryConfirmEmailVerificationActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryConfirmEmailVerificationActionProcessor => {
  return async ({ code, accessToken }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await verifyUserEmail(region, accessToken, code);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.ConfirmEmailVerification]:
      getUserDirectoryConfirmEmailVerificationActionProcessor(qpqConfig),
  };
};
