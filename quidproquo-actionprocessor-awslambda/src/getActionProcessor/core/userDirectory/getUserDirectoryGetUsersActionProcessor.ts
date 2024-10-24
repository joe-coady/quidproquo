import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsers } from '../../../logic/cognito/listPagedUsers';

const getProcessGetUsers = (qpqConfig: QPQConfig): UserDirectoryGetUsersActionProcessor => {
  return async ({ userDirectoryName, nextPageKey }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userAttributes = await listPagedUsers(userPoolId, region, nextPageKey);

    return actionResult(userAttributes);
  };
};

export const getUserDirectoryGetUsersActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUsers]: getProcessGetUsers(qpqConfig),
});
