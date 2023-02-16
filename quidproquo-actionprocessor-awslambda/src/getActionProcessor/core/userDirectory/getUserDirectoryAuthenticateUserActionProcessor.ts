import {
  UserDirectoryAuthenticateUserActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  AuthenticateUserChallenge,
} from 'quidproquo-core';

import {
  getCFExportNameUserPoolId,
  getCFExportNameUserPoolClientId,
} from '../../../awsNamingUtils';

import { authenticateUser } from '../../../logic/cognito/authenticateUser';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getUserDirectoryAuthenticateUserActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryAuthenticateUserActionProcessor => {
  return async (payload) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolId(payload.userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientId(payload.userDirectoryName, qpqConfig),
      region,
    );

    const authResponse = await authenticateUser(
      userPoolId,
      userPoolClientId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      payload.authenticateUserRequest,
    );

    return actionResult(authResponse);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.AuthenticateUser]:
      getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  };
};
