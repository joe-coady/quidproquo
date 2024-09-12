import {
  UserDirectoryGetUsersByAttributeActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  UserDirectoryActionType,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsersByAttribute } from '../../../logic/cognito/listPagedUsersByAttribute';

const getProcessGetUsersByAttribute = (qpqConfig: QPQConfig): UserDirectoryGetUsersByAttributeActionProcessor => {
  return async ({ userDirectoryName, attribueName, attribueValue, limit, nextPageKey }, _session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userAttributes = await listPagedUsersByAttribute(userPoolId, region, attribueName, attribueValue, limit, nextPageKey);

    return actionResult(userAttributes);
  };
};

export const getUserDirectoryGetUsersByAttributeActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUsersByAttribute]: getProcessGetUsersByAttribute(qpqConfig),
});
