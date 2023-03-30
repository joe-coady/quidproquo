import {
  UserDirectoryCreateUserActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  AuthenticateUserResponse,
} from 'quidproquo-core';
import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../awsNamingUtils';

import { createUser } from '../../../logic/cognito/createUser';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getUserDirectoryCreateUserActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryCreateUserActionProcessor => {
  return async (payload) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(payload.userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(payload.userDirectoryName, qpqConfig),
      region,
    );

    const authResponse: AuthenticateUserResponse = await createUser(
      userPoolId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      userPoolClientId,
      payload.createUserRequest,
    );

    return actionResult(authResponse);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.CreateUser]: getUserDirectoryCreateUserActionProcessor(qpqConfig),
  };
};
