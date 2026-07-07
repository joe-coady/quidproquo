import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesByUserIdActionProcessor,
  UserDirectoryGetUserAttributesByUserIdErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getUserAttributesBySub } from '../../../logic/cognito/getUserAttributesBySub';

const getProcessGetUserAttributesByUserId = (qpqConfig: QPQConfig): UserDirectoryGetUserAttributesByUserIdActionProcessor => {
  return async ({ userDirectoryName, userId }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    try {
      const userAttributes = await getUserAttributesBySub(userPoolId, region, userId);

      return actionResult(userAttributes);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        USER_NOT_FOUND: () => actionResultError(UserDirectoryGetUserAttributesByUserIdErrorTypeEnum.UserNotFound, 'No user found for this userId'),
      });
    }
  };
};

export const getUserDirectoryGetUserAttributesByUserIdActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributesByUserId]: getProcessGetUserAttributesByUserId(qpqConfig),
});
