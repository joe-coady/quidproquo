import {
  UserDirectoryGetUserAttributesActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getUserAttributes } from '../../../logic/cognito/getUserAttributes';

const getUserDirectoryGetUserAttributesActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryGetUserAttributesActionProcessor => {
  return async ({ userDirectoryName, username }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userAttributes = await getUserAttributes(userPoolId, region, username);

    return actionResult(userAttributes);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.GetUserAttributes]:
      getUserDirectoryGetUserAttributesActionProcessor(qpqConfig),
  };
};
