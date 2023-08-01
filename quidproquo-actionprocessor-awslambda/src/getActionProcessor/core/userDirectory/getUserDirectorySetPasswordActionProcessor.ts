import {
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  UserDirectorySetPasswordActionProcessor,
} from 'quidproquo-core';
import {
  getCFExportNameUserPoolIdFromConfig,
} from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { setUserPassword } from '../../../logic/cognito/setUserPassword';

const getUserDirectorySetPasswordActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectorySetPasswordActionProcessor => {
  return async ({ userDirectoryName, newPassword, username }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );
    
    await setUserPassword(region, userPoolId, username, newPassword);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.SetPassword]:
      getUserDirectorySetPasswordActionProcessor(qpqConfig),
  };
};
