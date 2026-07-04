import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  AuthenticationDeliveryDetails,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryForgotPasswordActionProcessor,
  UserDirectoryForgotPasswordErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { forgotPassword } from '../../../logic/cognito/forgotPassword';
import { resolveUsernameByPreferredUsername } from '../../../logic/cognito/resolveUsernameByPreferredUsername';

const getProcessForgotPassword = (qpqConfig: QPQConfig): UserDirectoryForgotPasswordActionProcessor => {
  return async ({ username, userDirectoryName }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    const resolvedUsername = await resolveUsernameByPreferredUsername(userPoolId, region, username);

    try {
      const authResponse: AuthenticationDeliveryDetails = await forgotPassword(userPoolId, userPoolClientId, region, resolvedUsername);

      return actionResult(authResponse);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        UserNotFoundException: () => actionResultError(UserDirectoryForgotPasswordErrorTypeEnum.UserNotFound, 'No account found for this user'),
        LimitExceededException: () =>
          actionResultError(UserDirectoryForgotPasswordErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryForgotPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ForgotPassword]: getProcessForgotPassword(qpqConfig),
});
