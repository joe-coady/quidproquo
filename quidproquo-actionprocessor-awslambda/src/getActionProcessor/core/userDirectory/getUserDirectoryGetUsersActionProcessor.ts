import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersActionProcessor,
  UserDirectoryGetUsersErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsers } from '../../../logic/cognito/listPagedUsers';

const getProcessGetUsers = (qpqConfig: QPQConfig): UserDirectoryGetUsersActionProcessor => {
  return async ({ userDirectoryName, nextPageKey }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    try {
      const userAttributes = await listPagedUsers(userPoolId, region, nextPageKey);

      return actionResult(userAttributes);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidParameterException: () => actionResultError(UserDirectoryGetUsersErrorTypeEnum.InvalidPageKey, 'The supplied page key is invalid'),
        TooManyRequestsException: () => actionResultError(UserDirectoryGetUsersErrorTypeEnum.LimitExceeded, 'Too many requests, please try again later'),
      });
    }
  };
};

export const getUserDirectoryGetUsersActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUsers]: getProcessGetUsers(qpqConfig),
});
