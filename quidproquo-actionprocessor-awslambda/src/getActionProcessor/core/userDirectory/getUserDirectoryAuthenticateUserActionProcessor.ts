import {
  UserDirectoryAuthenticateUserActionProcessor,
  actionResult,
  actionResultError,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultErrorFromCaughtError,
  UserDirectoryAuthenticateUserErrorTypeEnum,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig, getCFExportNameUserPoolClientIdFromConfig } from '../../../awsNamingUtils';

import { authenticateUser } from '../../../logic/cognito/authenticateUser';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getProcessAuthenticateUser = (qpqConfig: QPQConfig): UserDirectoryAuthenticateUserActionProcessor => {
  return async (payload) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);
    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(payload.userDirectoryName, qpqConfig), region);
    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(payload.userDirectoryName, qpqConfig), region);

    try {
      const authResponse = await authenticateUser(
        userPoolId,
        userPoolClientId,
        qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
        payload.authenticateUserRequest.isCustom,
        payload.authenticateUserRequest.email,
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
