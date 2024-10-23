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

import { getCFExportNameUserPoolClientIdFromConfig,getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { authenticateUser } from '../../../logic/cognito/authenticateUser';

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
