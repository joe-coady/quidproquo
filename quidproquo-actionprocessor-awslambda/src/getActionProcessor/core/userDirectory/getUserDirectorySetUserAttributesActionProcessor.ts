import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetUserAttributesActionProcessor,
  UserDirectorySetUserAttributesErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { resolveUsernameByPreferredUsername } from '../../../logic/cognito/resolveUsernameByPreferredUsername';
import { setUserAttributes } from '../../../logic/cognito/setUserAttributes';

const getProcessSetUserAttributes = (qpqConfig: QPQConfig): UserDirectorySetUserAttributesActionProcessor => {
  return async ({ userDirectoryName, username, userAttributes }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const resolvedUsername = await resolveUsernameByPreferredUsername(userPoolId, region, username);

    try {
      await setUserAttributes(userPoolId, region, resolvedUsername, userAttributes);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        UserNotFoundException: () => actionResultError(UserDirectorySetUserAttributesErrorTypeEnum.UserNotFound, 'No account found for this user'),
        InvalidParameterException: () =>
          actionResultError(UserDirectorySetUserAttributesErrorTypeEnum.InvalidAttributes, 'One or more attributes are invalid'),
        AliasExistsException: () =>
          actionResultError(UserDirectorySetUserAttributesErrorTypeEnum.AliasExists, 'That email or phone number is already in use'),
        LimitExceededException: () =>
          actionResultError(UserDirectorySetUserAttributesErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
        TooManyRequestsException: () =>
          actionResultError(UserDirectorySetUserAttributesErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectorySetUserAttributesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetUserAttributes]: getProcessSetUserAttributes(qpqConfig),
});
