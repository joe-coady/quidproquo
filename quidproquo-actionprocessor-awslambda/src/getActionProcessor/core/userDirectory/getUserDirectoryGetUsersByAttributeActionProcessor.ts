import { UserDirectoryGetUsersByAttributeActionProcessor, actionResult, QPQConfig, qpqCoreUtils, UserDirectoryActionType } from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';

import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsersByAttribute } from '../../../logic/cognito/listPagedUsersByAttribute';

const getUserDirectoryGetUsersByAttributeActionProcessor = (qpqConfig: QPQConfig): UserDirectoryGetUsersByAttributeActionProcessor => {
  return async ({ userDirectoryName, attribueName, attribueValue, limit, nextPageKey }, _session) => {
    const region = qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    const userAttributes = await listPagedUsersByAttribute(userPoolId, region, attribueName, attribueValue, limit, nextPageKey);

    return actionResult(userAttributes);
  };
};

export default (qpqConfig: QPQConfig) => {
  return {
    [UserDirectoryActionType.GetUsersByAttribute]: getUserDirectoryGetUsersByAttributeActionProcessor(qpqConfig),
  };
};
