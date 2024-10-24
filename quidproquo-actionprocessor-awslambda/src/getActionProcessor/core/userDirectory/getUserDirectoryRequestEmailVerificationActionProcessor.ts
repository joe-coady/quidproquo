import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryRequestEmailVerificationActionProcessor,
} from 'quidproquo-core';

import { requestEmailVerificationCode } from '../../../logic/cognito/requestEmailVerificationCode';

const getProcessRequestEmailVerification = (qpqConfig: QPQConfig): UserDirectoryRequestEmailVerificationActionProcessor => {
  return async ({ userDirectoryName, accessToken }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    await requestEmailVerificationCode(region, accessToken);

    return actionResult(void 0);
  };
};

export const getUserDirectoryRequestEmailVerificationActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.RequestEmailVerification]: getProcessRequestEmailVerification(qpqConfig),
});
