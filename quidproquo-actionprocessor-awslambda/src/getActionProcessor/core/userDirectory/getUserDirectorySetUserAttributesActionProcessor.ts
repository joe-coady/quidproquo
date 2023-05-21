import {
  UserDirectorySetUserAttributesActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { setUserAttributes } from '../../../logic/cognito/setUserAttributes';

const getUserDirectorySetUserAttributesActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectorySetUserAttributesActionProcessor => {
  return async ({ userDirectoryName, serviceOverride, username, userAttributes }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig, serviceOverride),
      region,
    );

    await setUserAttributes(userPoolId, region, username, userAttributes);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.SetUserAttributes]:
      getUserDirectorySetUserAttributesActionProcessor(qpqConfig),
  };
};
