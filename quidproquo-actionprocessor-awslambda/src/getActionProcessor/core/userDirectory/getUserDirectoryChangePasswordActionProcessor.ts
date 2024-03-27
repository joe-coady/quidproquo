import {
  UserDirectoryChangePasswordActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';

import { changePassword } from '../../../logic/cognito/changePassword';

const getUserDirectoryChangePasswordActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryChangePasswordActionProcessor => {
  return async ({ oldPassword, newPassword }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await changePassword(session.accessToken!, oldPassword, newPassword, region);

    return actionResult(void 0);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.ChangePassword]:
      getUserDirectoryChangePasswordActionProcessor(qpqConfig),
  };
};
