import {
  UserDirectoryAuthenticateUserActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultError,
  ErrorTypeEnum,
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

    const username = await authenticateUser(
      userPoolId,
      userPoolClientId,
      payload.username,
      payload.password,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    return actionResult(username);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.AuthenticateUser]:
      getUserDirectoryAuthenticateUserActionProcessor(qpqConfig),
  };
};
