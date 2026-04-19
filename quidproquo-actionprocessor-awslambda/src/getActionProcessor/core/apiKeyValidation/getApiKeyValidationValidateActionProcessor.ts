import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { ApiKeyValidationActionType, ApiKeyValidationValidateActionProcessor } from 'quidproquo-webserver';

import { timingSafeEqual } from 'crypto';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';
import { getApiKeys } from '../../../logic/apiGateway/getApiKeys';

// Constant-time string equality. `timingSafeEqual` throws on length mismatch,
// so guard the length check — the length itself isn't secret for API keys.
const safeEqual = (a?: string, b?: string): boolean => {
  if (!a || !b || a.length != b.length) {
    return false;
  }

  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');

  return timingSafeEqual(aBuf, bBuf);
};

const getProcessApiKeyValidationValidate = (qpqConfig: QPQConfig): ApiKeyValidationValidateActionProcessor => {
  const region = qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig);
    const application = qpqCoreUtils.getApplicationName(qpqConfig);
    const service = qpqCoreUtils.getApplicationModuleName(qpqConfig);
    const environment = qpqCoreUtils.getApplicationModuleEnvironment(qpqConfig);
    const feature = qpqCoreUtils.getApplicationModuleFeature(qpqConfig);
  
  return async ({ apiKeyValue, apiKeyReferences }) => {
    

    const realApiKeys = await getApiKeys(
      region,
      ...apiKeyReferences.map((apiKey) => {
        const apiKeyApplication = apiKey.applicationName || application;
        const apiKeyService = apiKey.serviceName || service;

        return getConfigRuntimeResourceName(apiKey.name, apiKeyApplication, apiKeyService, environment, feature);
      }),
    );

    const matched = realApiKeys.some((apiKey) => safeEqual(apiKey.value, apiKeyValue));
    return actionResult(matched);
  };
};

export const getApiKeyValidationValidateActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [ApiKeyValidationActionType.Validate]: getProcessApiKeyValidationValidate(qpqConfig),
});
