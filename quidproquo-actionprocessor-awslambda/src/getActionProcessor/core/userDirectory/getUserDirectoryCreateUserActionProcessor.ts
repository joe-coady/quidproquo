import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  AuthenticateUserResponse,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  UserDirectoryCreateUserActionProcessor,
  UserDirectoryCreateUserErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { createUser } from '../../../logic/cognito/createUser';
import { resolveUsernameByPreferredUsername } from '../../../logic/cognito/resolveUsernameByPreferredUsername';

const getProcessCreateUser = (qpqConfig: QPQConfig): UserDirectoryCreateUserActionProcessor => {
  return async (payload) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(payload.userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(payload.userDirectoryName, qpqConfig), region);

    const resolvedUsername = await resolveUsernameByPreferredUsername(userPoolId, region, payload.createUserRequest.email);
    if (resolvedUsername !== payload.createUserRequest.email) {
      return actionResultError(UserDirectoryCreateUserErrorTypeEnum.Conflict, 'An account with this email already exists');
    }

    try {
      const authResponse: AuthenticateUserResponse = await createUser(userPoolId, region, userPoolClientId, payload.createUserRequest);

      return actionResult(authResponse);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        UsernameExistsException: () => actionResultError(UserDirectoryCreateUserErrorTypeEnum.Conflict, 'An account with this email already exists'),
        InvalidPasswordException: () =>
          actionResultError(UserDirectoryCreateUserErrorTypeEnum.InvalidPassword, 'Password does not meet the password policy'),
        LimitExceededException: () =>
          actionResultError(UserDirectoryCreateUserErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectoryCreateUserActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.CreateUser]: getProcessCreateUser(qpqConfig),
});
