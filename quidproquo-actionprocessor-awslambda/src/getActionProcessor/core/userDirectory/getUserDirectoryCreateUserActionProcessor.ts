import {
  UserDirectoryCreateUserActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
} from 'quidproquo-core';
import { getCFExportNameUserPoolId } from '../../../awsNamingUtils';

import { createUser } from '../../../logic/cognito/createUser';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';

const getUserDirectoryCreateUserActionProcessor = (
  qpqConfig: QPQConfig,
): UserDirectoryCreateUserActionProcessor => {
  return async (payload) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(
      getCFExportNameUserPoolId(payload.userDirectoryName, qpqConfig),
      region,
    );

    const username = await createUser(
      userPoolId,
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
