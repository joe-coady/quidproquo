import {
  UserDirectoryForgotPasswordActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  AuthenticateUserResponse,
  AuthenticationDeliveryDetails,
} from 'quidproquo-core';
import {
  getCFExportNameUserPoolIdFromConfig,
  getCFExportNameUserPoolClientIdFromConfig,
} from '../../../awsNamingUtils';

import { forgotPassword } from '../../../logic/cognito/forgotPassword';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getUserDirectoryForgotPasswordActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryForgotPasswordActionProcessor => {
  return async ({ username, userDirectoryName }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userPoolClientId = await getExportedValue(
      getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const authResponse: AuthenticationDeliveryDetails = await forgotPassword(
      userPoolId,
      userPoolClientId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      username,
    );

    return actionResult(authResponse);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.ForgotPassword]:
      getUserDirectoryForgotPasswordActionProcessor(qpqConfig),
  };
};
