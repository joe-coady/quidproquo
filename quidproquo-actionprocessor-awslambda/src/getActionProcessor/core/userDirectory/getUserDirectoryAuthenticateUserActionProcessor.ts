import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  UserDirectoryAuthenticateUserActionProcessor,
  UserDirectoryAuthenticateUserErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { authenticateUser } from '../../../logic/cognito/authenticateUser';
import { resolveUsernameByPreferredUsername } from '../../../logic/cognito/resolveUsernameByPreferredUsername';

const getProcessAuthenticateUser = (qpqConfig: QPQConfig): UserDirectoryAuthenticateUserActionProcessor => {
  return async (payload) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(payload.userDirectoryName, qpqConfig), region);
    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(payload.userDirectoryName, qpqConfig), region);

    try {
      const resolvedUsername = await resolveUsernameByPreferredUsername(userPoolId, region, payload.authenticateUserRequest.email);

      const authResponse = await authenticateUser(
        userPoolId,
        userPoolClientId,
        region,
        payload.authenticateUserRequest.isCustom,
        resolvedUsername,
        payload.authenticateUserRequest.password,
      );

      return actionResult(authResponse);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        UserNotFoundException: () => actionResultError(UserDirectoryAuthenticateUserErrorTypeEnum.UserNotFound, 'Incorrect username or password'),
        NotAuthorizedException: () => actionResultError(UserDirectoryAuthenticateUserErrorTypeEnum.UserNotFound, 'Incorrect username or password'),
      });
    }
  };
};

export const getUserDirectoryAuthenticateUserActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.AuthenticateUser]: getProcessAuthenticateUser(qpqConfig),
});
