import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetPasswordActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { setUserPassword } from '../../../logic/cognito/setUserPassword';

const getProcessSetPassword = (qpqConfig: QPQConfig): UserDirectorySetPasswordActionProcessor => {
  return async ({ userDirectoryName, newPassword, username }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    await setUserPassword(region, userPoolId, username, newPassword);

    return actionResult(void 0);
  };
};

export const getUserDirectorySetPasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetPassword]: getProcessSetPassword(qpqConfig),
});
