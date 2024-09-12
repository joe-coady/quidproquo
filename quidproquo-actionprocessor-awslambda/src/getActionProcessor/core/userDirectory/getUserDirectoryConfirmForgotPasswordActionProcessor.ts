import {
  UserDirectoryConfirmForgotPasswordActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  ActionProcessorList,
  ActionProcessorListResolver,
} from 'quidproquo-core';
import { getCFExportNameUserPoolIdFromConfig, getCFExportNameUserPoolClientIdFromConfig } from '../../../awsNamingUtils';

import { confirmForgotPassword } from '../../../logic/cognito/confirmForgotPassword';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getProcessConfirmForgotPassword = (qpqConfig: QPQConfig): UserDirectoryConfirmForgotPasswordActionProcessor => {
  return async ({ userDirectoryName, code, username, password }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userPoolClientId = await getExportedValue(getCFExportNameUserPoolClientIdFromConfig(userDirectoryName, qpqConfig), region);

    const authResponse = await confirmForgotPassword(userPoolId, userPoolClientId, region, code, username, password);

    return actionResult(authResponse);
  };
};

export const getUserDirectoryConfirmForgotPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmForgotPassword]: getProcessConfirmForgotPassword(qpqConfig),
});
