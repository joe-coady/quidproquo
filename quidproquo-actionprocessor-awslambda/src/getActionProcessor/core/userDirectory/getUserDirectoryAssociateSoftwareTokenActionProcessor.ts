import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  UserDirectoryActionType,
  UserDirectoryAssociateSoftwareTokenActionProcessor,
} from 'quidproquo-core';

import { associateSoftwareToken } from '../../../logic/cognito/associateSoftwareToken';

const getProcessAssociateSoftwareToken = (qpqConfig: QPQConfig): UserDirectoryAssociateSoftwareTokenActionProcessor => {
  return async ({ session }) => {
    const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);

    const response = await associateSoftwareToken(region, session);

    return actionResult(response);
  };
};

export const getUserDirectoryAssociateSoftwareTokenActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [UserDirectoryActionType.AssociateSoftwareToken]: getProcessAssociateSoftwareToken(qpqConfig),
});
