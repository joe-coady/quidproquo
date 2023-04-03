import {
  UserDirectoryConfirmForgotPasswordActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';
import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../awsNamingUtils';

import { confirmForgotPassword } from '../../../logic/cognito/confirmForgotPassword';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getUserDirectoryConfirmForgotPasswordActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryConfirmForgotPasswordActionProcessor => {
  return async ({ userDirectoryName, code, username, password }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const authResponse = await confirmForgotPassword(
      userPoolId,
      userPoolClientId,
      region,
      code,
      username,
      password,
    );

    return actionResult(authResponse);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.ConfirmForgotPassword]:
      getUserDirectoryConfirmForgotPasswordActionProcessor(qpqConfig),
  };
};
