import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryChangePasswordActionProcessor,
  UserDirectoryChangePasswordErrorTypeEnum,
} from 'quidproquo-core';

import { changePassword } from '../../../logic/cognito/changePassword';

const getProcessChangePassword = (qpqConfig: QPQConfig): UserDirectoryChangePasswordActionProcessor => {
  return async ({ oldPassword, newPassword, accessToken }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      await changePassword(accessToken, oldPassword, newPassword, region);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        NotAuthorizedException: () => actionResultError(UserDirectoryChangePasswordErrorTypeEnum.IncorrectPassword, 'Current password is incorrect'),
        InvalidPasswordException: () =>
          actionResultError(UserDirectoryChangePasswordErrorTypeEnum.InvalidNewPassword, 'New password does not meet the password policy'),
        LimitExceededException: () =>
          actionResultError(UserDirectoryChangePasswordErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryChangePasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ChangePassword]: getProcessChangePassword(qpqConfig),
});
