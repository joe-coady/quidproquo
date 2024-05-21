import {
  UserDirectoryGetUserAttributesActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  actionResultError,
  UserDirectoryGetUserAttributesErrorTypeEnum,
  actionResultErrorFromCaughtError,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getUserAttributes } from '../../../logic/cognito/getUserAttributes';

const getUserDirectoryGetUserAttributesActionProcessor = (qpqConfig: QPQConfig): UserDirectoryGetUserAttributesActionProcessor => {
  return async ({ userDirectoryName, username }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    try {
      const userAttributes = await getUserAttributes(userPoolId, region, username);

      return actionResult(userAttributes);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        UserNotFoundException: () => actionResultError(UserDirectoryGetUserAttributesErrorTypeEnum.UserNotFound, 'User not found'),
      });
    }
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.GetUserAttributes]: getUserDirectoryGetUserAttributesActionProcessor(qpqConfig),
  };
};
