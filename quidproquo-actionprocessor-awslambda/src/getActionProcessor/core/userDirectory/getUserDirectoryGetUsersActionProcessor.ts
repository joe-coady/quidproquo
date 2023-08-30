import {
  UserDirectoryGetUsersActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsers } from '../../../logic/cognito/listPagedUsers';

const getUserDirectoryGetUsersActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryGetUsersActionProcessor => {
  return async ({ userDirectoryName, serviceOverride, nextPageKey }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig, serviceOverride),
      region,
    );

    const userAttributes = await listPagedUsers(userPoolId, region, nextPageKey);

    return actionResult(userAttributes);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.GetUsers]:
      getUserDirectoryGetUsersActionProcessor(qpqConfig),
  };
};
