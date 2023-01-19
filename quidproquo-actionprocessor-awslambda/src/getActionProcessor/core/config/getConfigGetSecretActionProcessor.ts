import {
  ConfigActionType,
  ConfigGetSecretActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';

import { QPQAWSResourceMap } from '../../../runtimeConfig/QPQAWSResourceMap';
import { resolveSecretKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getSecret } from '../../../logic/secretsManager/getSecret';

const getProcessConfigActionType = (
  qpqConfig: QPQConfig,
  awsResourceMap: QPQAWSResourceMap,
): ConfigGetSecretActionProcessor => {
  return async ({ secretName }) => {
    const awsSecretKey = resolveSecretKey(secretName, awsResourceMap);
    const secretValue = await getSecret(awsSecretKey, qpqCoreUtils.getDeployRegion(qpqConfig));

    return actionResult(secretValue);
  };
};

export default (qpqConfig: QPQConfig, awsResourceMap: QPQAWSResourceMap) => {
  return {
    [ConfigActionType.GetSecret]: getProcessConfigActionType(qpqConfig, awsResourceMap),
  };
};
