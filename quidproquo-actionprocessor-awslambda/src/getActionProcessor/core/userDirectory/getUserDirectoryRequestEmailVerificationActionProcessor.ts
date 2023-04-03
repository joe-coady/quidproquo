import {
  UserDirectoryRequestEmailVerificationActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { requestEmailVerificationCode } from '../../../logic/cognito/requestEmailVerificationCode';

const getUserDirectoryRequestEmailVerificationActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryRequestEmailVerificationActionProcessor => {
  return async ({ userDirectoryName, accessToken }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await requestEmailVerificationCode(region, accessToken);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.RequestEmailVerification]:
      getUserDirectoryRequestEmailVerificationActionProcessor(qpqConfig),
  };
};
