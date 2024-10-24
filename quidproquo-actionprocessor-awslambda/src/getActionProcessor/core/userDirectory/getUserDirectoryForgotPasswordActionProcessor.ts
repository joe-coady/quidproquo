import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  AuthenticationDeliveryDetails,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryForgotPasswordActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { forgotPassword } from '../../../logic/cognito/forgotPassword';

const getProcessForgotPassword = (qpqConfig: QPQConfig): UserDirectoryForgotPasswordActionProcessor => {
  return async ({ username, userDirectoryName }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    const authResponse: AuthenticationDeliveryDetails = await forgotPassword(
      userPoolId,
      userPoolClientId,
      qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig),
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
