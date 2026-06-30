import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryConfirmForgotPasswordActionProcessor,
  UserDirectoryConfirmForgotPasswordErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { confirmForgotPassword } from '../../../logic/cognito/confirmForgotPassword';
import { resolveUsernameByPreferredUsername } from '../../../logic/cognito/resolveUsernameByPreferredUsername';

const getProcessConfirmForgotPassword = (qpqConfig: QPQConfig): UserDirectoryConfirmForgotPasswordActionProcessor => {
  return async ({ userDirectoryName, code, username, password }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    const resolvedUsername = await resolveUsernameByPreferredUsername(userPoolId, region, username);

    try {
      const authResponse = await confirmForgotPassword(userPoolId, userPoolClientId, region, code, resolvedUsername, password);

      return actionResult(authResponse);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        CodeMismatchException: () => actionResultError(UserDirectoryConfirmForgotPasswordErrorTypeEnum.InvalidCode, 'Confirmation code is incorrect'),
        ExpiredCodeException: () => actionResultError(UserDirectoryConfirmForgotPasswordErrorTypeEnum.ExpiredCode, 'Confirmation code has expired'),
        InvalidPasswordException: () =>
          actionResultError(UserDirectoryConfirmForgotPasswordErrorTypeEnum.InvalidNewPassword, 'New password does not meet the password policy'),
        LimitExceededException: () => actionResultError(UserDirectoryConfirmForgotPasswordErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryConfirmForgotPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmForgotPassword]: getProcessConfirmForgotPassword(qpqConfig),
});
