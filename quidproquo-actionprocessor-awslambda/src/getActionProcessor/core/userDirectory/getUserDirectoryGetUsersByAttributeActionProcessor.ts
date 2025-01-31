import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersByAttributeActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsersByAttribute } from '../../../logic/cognito/listPagedUsersByAttribute';

const getProcessGetUsersByAttribute = (qpqConfig: QPQConfig): UserDirectoryGetUsersByAttributeActionProcessor => {
  return async ({ userDirectoryName, attribueName, attribueValue, limit, nextPageKey }, _session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

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
