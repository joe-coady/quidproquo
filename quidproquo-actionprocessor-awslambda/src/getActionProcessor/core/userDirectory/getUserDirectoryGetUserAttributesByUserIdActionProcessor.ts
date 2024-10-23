import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  UserDirectoryGetUserAttributesByUserIdActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { getUserAttributesBySub } from '../../../logic/cognito/getUserAttributesBySub';

const getProcessGetUserAttributesByUserId = (qpqConfig: QPQConfig): UserDirectoryGetUserAttributesByUserIdActionProcessor => {
  return async ({ userDirectoryName, userId }, session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userAttributes = await getUserAttributesBySub(userPoolId, region, userId);

    return actionResult(userAttributes);
  };
};

export const getUserDirectoryGetUserAttributesByUserIdActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUserAttributesByUserId]: getProcessGetUserAttributesByUserId(qpqConfig),
});
