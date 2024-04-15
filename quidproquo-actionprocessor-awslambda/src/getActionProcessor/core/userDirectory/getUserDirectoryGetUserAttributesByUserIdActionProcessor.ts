import {
  UserDirectoryGetUserAttributesByUserIdActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getUserAttributesBySub } from '../../../logic/cognito/getUserAttributesBySub';

const getUserDirectoryGetUserAttributesByUserIdActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryGetUserAttributesByUserIdActionProcessor => {
  return async ({ userDirectoryName, userId }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig),
      region,
    );

    const userAttributes = await getUserAttributesBySub(userPoolId, region, userId);

    return actionResult(userAttributes);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.GetUserAttributesByUserId]:
      getUserDirectoryGetUserAttributesByUserIdActionProcessor(qpqConfig),
  };
};
