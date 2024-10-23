import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  UserDirectoryConfirmEmailVerificationActionProcessor,
} from 'quidproquo-core';

import { verifyUserEmail } from '../../../logic/cognito/verifyUserEmail';

const getProcessConfirmEmailVerification = (qpqConfig: QPQConfig): UserDirectoryConfirmEmailVerificationActionProcessor => {
  return async ({ code, accessToken }) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    await verifyUserEmail(region, accessToken, code);

    return actionResult(void 0);
  };
};

export const getUserDirectoryConfirmEmailVerificationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.ConfirmEmailVerification]: getProcessConfirmEmailVerification(qpqConfig),
});
