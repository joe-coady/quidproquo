import {
  UserDirectoryCreateUserActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';
import { resolveResourceName } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { createUser } from '../../../logic/cognito/createUser';

const getUserDirectoryCreateUserActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryCreateUserActionProcessor => {
  return async (payload) => {
    const userPoolName = resolveResourceName(payload.userDirectoryName, qpqConfig);
    const username = await createUser(
      userPoolName,
      payload.email || '',
      payload.phone || '',
      qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig),
    );

    return actionResult(username);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.CreateUser]: getUserDirectoryCreateUserActionProcessor(qpqConfig),
  };
};
