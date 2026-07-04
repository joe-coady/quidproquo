import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryConfirmEmailVerificationActionProcessor,
  UserDirectoryConfirmEmailVerificationErrorTypeEnum,
} from 'quidproquo-core';

import { verifyUserEmail } from '../../../logic/cognito/verifyUserEmail';

const getProcessConfirmEmailVerification = (qpqConfig: QPQConfig): UserDirectoryConfirmEmailVerificationActionProcessor => {
  return async ({ code, accessToken }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      await verifyUserEmail(region, accessToken, code);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        CodeMismatchException: () =>
          actionResultError(UserDirectoryConfirmEmailVerificationErrorTypeEnum.InvalidCode, 'Verification code is incorrect'),
        ExpiredCodeException: () =>
          actionResultError(UserDirectoryConfirmEmailVerificationErrorTypeEnum.ExpiredCode, 'Verification code has expired'),
        LimitExceededException: () =>
          actionResultError(UserDirectoryConfirmEmailVerificationErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryConfirmEmailVerificationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmEmailVerification]: getProcessConfirmEmailVerification(qpqConfig),
});
