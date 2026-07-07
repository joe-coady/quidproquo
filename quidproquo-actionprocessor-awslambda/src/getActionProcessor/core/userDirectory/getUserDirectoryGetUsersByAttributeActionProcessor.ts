import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryGetUsersByAttributeActionProcessor,
  UserDirectoryGetUsersByAttributeErrorTypeEnum,
} from 'quidproquo-core';

import { getCFExportNameUserPoolIdFromConfig } from '../../../awsNamingUtils';
import { getExportedValue } from '../../../logic/cloudformation/getExportedValue';
import { listPagedUsersByAttribute } from '../../../logic/cognito/listPagedUsersByAttribute';

const getProcessGetUsersByAttribute = (qpqConfig: QPQConfig): UserDirectoryGetUsersByAttributeActionProcessor => {
  return async ({ userDirectoryName, attribueName, attribueValue, limit, nextPageKey }, _session) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const userPoolId = await getExportedValue(getCFExportNameUserPoolIdFromConfig(userDirectoryName, qpqConfig), region);

    try {
      const userAttributes = await listPagedUsersByAttribute(userPoolId, region, attribueName, attribueValue, limit, nextPageKey);

      return actionResult(userAttributes);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        InvalidParameterException: () =>
          actionResultError(
            UserDirectoryGetUsersByAttributeErrorTypeEnum.InvalidSearchParameters,
            'The search attribute, value, limit, or page key is invalid',
          ),
        TooManyRequestsException: () =>
          actionResultError(UserDirectoryGetUsersByAttributeErrorTypeEnum.LimitExceeded, 'Too many requests, please try again later'),
      });
    }
  };
};

export const getUserDirectoryGetUsersByAttributeActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.GetUsersByAttribute]: getProcessGetUsersByAttribute(qpqConfig),
});
