import {
  UserDirectoryForgotPasswordActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  AuthenticateUserResponse,
  AuthenticationDeliveryDetails,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';
import { getCFExportNameUserPoolIdFromConfig, getCFExportNameUserPoolClientIdFromConfig } from '../../../awsNamingUtils';

import { forgotPassword } from '../../../logic/cognito/forgotPassword';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getProcessForgotPassword = (qpqConfig: QPQConfig): UserDirectoryForgotPasswordActionProcessor => {
  return async ({ username, userDirectoryName }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    const authResponse: AuthenticationDeliveryDetails = await forgotPassword(
      userPoolId,
      userPoolClientId,
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
      username,
    );

    return actionResult(authResponse);
  };
};

export const getUserDirectoryForgotPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ForgotPassword]: getProcessForgotPassword(qpqConfig),
});
