import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetPasswordActionProcessor,
  UserDirectorySetPasswordErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { resolveUsernameByPreferredUsername } from '../../../logic/cognito/resolveUsernameByPreferredUsername';
import { setUserPassword } from '../../../logic/cognito/setUserPassword';

const getProcessSetPassword = (qpqConfig: QPQConfig): UserDirectorySetPasswordActionProcessor => {
  return async ({ userDirectoryName, newPassword, username }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const resolvedUsername = await resolveUsernameByPreferredUsername(userPoolId, region, username);

    try {
      await setUserPassword(region, userPoolId, resolvedUsername, newPassword);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        UserNotFoundException: () => actionResultError(UserDirectorySetPasswordErrorTypeEnum.UserNotFound, 'No account found for this user'),
        InvalidPasswordException: () =>
          actionResultError(UserDirectorySetPasswordErrorTypeEnum.InvalidNewPassword, 'Password does not meet the password policy'),
        LimitExceededException: () =>
          actionResultError(UserDirectorySetPasswordErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
        TooManyRequestsException: () =>
          actionResultError(UserDirectorySetPasswordErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectorySetPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetPassword]: getProcessSetPassword(qpqConfig),
});
