import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectorySetUserAttributesActionProcessor,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { setUserAttributes } from '../../../logic/cognito/setUserAttributes';

const getProcessSetUserAttributes = (qpqConfig: QPQConfig): UserDirectorySetUserAttributesActionProcessor => {
  return async ({ userDirectoryName, username, userAttributes }, session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    await setUserAttributes(userPoolId, region, username, userAttributes);

    return actionResult(void 0);
  };
};

export const getUserDirectorySetUserAttributesActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.SetUserAttributes]: getProcessSetUserAttributes(qpqConfig),
});
