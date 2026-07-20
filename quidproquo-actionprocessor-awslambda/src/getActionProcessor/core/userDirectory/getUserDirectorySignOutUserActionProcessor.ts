import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySignOutUserActionProcessor,
  UserDirectorySignOutUserErrorTypeEnum,
} from 'quidproquo-core';

import { globalSignOut } from '../../../logic/cognito/globalSignOut';

const getProcessSignOutUser = (qpqConfig: QPQConfig): UserDirectorySignOutUserActionProcessor => {
  return async ({ accessToken }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    try {
      await globalSignOut(accessToken, region);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        NotAuthorizedException: () => actionResultError(UserDirectorySignOutUserErrorTypeEnum.Unauthorized, 'Access token is invalid or has expired'),
        TooManyRequestsException: () =>
          actionResultError(UserDirectorySignOutUserErrorTypeEnum.LimitExceeded, 'Too many attempts, please try again later'),
      });
    }
  };
};

export const getUserDirectorySignOutUserActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SignOutUser]: getProcessSignOutUser(qpqConfig),
});
