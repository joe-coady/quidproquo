import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryConfirmForgotPasswordActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolClientIdFromConfig, getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { confirmForgotPassword } from '../../../logic/cognito/confirmForgotPassword';

const getProcessConfirmForgotPassword = (qpqConfig: QPQConfig): UserDirectoryConfirmForgotPasswordActionProcessor => {
  return async ({ userDirectoryName, code, username, password }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

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
