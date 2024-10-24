import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryChangePasswordActionProcessor,
} from 'quidproquo-core';

import { changePassword } from '../../../logic/cognito/changePassword';

const getProcessChangePassword = (qpqConfig: QPQConfig): UserDirectoryChangePasswordActionProcessor => {
  return async ({ oldPassword, newPassword }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    await changePassword(session.accessToken!, oldPassword, newPassword, region);

    return actionResult(void 0);
  };
};

export const getUserDirectoryChangePasswordActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ChangePassword]: getProcessChangePassword(qpqConfig),
});
