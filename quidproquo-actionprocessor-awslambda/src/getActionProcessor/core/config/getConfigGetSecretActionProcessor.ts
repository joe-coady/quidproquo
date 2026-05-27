import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigGetSecretActionProcessor,
  ConfigGetSecretErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getSecret } from '../../../logic/secretsManager/getSecret';
import { resolveSecretResourceName } from './utils';

const getProcessConfigGetSecret = (qpqConfig: QPQConfig): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretResourceName(secretName, qpqConfig);

    try {
      const secretValue = await getSecret(awsSecretKey, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig));
      return actionResult(secretValue);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        ResourceNotFoundException: () => actionResultError(ConfigGetSecretErrorTypeEnum.ResourceNotFound, `Secret not found: [${secretName}]`),
        ThrottlingException: () => actionResultError(ConfigGetSecretErrorTypeEnum.Throttling, 'Throttling: Rate exceeded'),
      });
    }
  };
};

export const getConfigGetSecretActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetSecret]: getProcessConfigGetSecret(qpqConfig),
});
