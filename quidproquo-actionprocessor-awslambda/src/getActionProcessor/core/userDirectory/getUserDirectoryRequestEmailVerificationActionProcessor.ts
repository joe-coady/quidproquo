import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRequestEmailVerificationActionProcessor,
  UserDirectoryRequestEmailVerificationErrorTypeEnum,
} from 'quidproquo-core';

import { requestEmailVerificationCode } from '../../../logic/cognito/requestEmailVerificationCode';

const getProcessRequestEmailVerification = (qpqConfig: QPQConfig): UserDirectoryRequestEmailVerificationActionProcessor => {
  return async ({ userDirectoryName, accessToken }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      await requestEmailVerificationCode(region, accessToken);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        NotAuthorizedException: () =>
          actionResultError(UserDirectoryRequestEmailVerificationErrorTypeEnum.Unauthorized, 'Access token is invalid or has expired'),
        LimitExceededException: () =>
          actionResultError(UserDirectoryRequestEmailVerificationErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
        CodeDeliveryFailureException: () =>
          actionResultError(UserDirectoryRequestEmailVerificationErrorTypeEnum.CodeDeliveryFailed, 'Could not deliver the verification code'),
      });
    }
  };
};

export const getUserDirectoryRequestEmailVerificationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RequestEmailVerification]: getProcessRequestEmailVerification(qpqConfig),
});
