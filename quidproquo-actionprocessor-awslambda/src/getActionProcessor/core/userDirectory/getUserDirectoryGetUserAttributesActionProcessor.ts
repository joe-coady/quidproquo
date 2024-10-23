import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesActionProcessor,
  UserDirectoryGetUserAttributesErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getUserAttributes } from '../../../logic/cognito/getUserAttributes';

const getProcessGetUserAttributes = (qpqConfig: QPQConfig): UserDirectoryGetUserAttributesActionProcessor => {
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

export const getUserDirectoryGetUserAttributesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributes]: getProcessGetUserAttributes(qpqConfig),
});
