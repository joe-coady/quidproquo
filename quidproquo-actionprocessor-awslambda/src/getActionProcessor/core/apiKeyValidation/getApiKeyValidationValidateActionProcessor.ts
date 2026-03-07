import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
} from 'quidproquo-core';
import { ApiKeyValidationActionType, ApiKeyValidationValidateActionProcessor } from 'quidproquo-webserver';

import { getConfigRuntimeResourceName } from '../../../awsNamingUtils';
import { getApiKeys } from '../../../logic/apiGateway/getApiKeys';

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

    const index = realApiKeys.findIndex((apiKey) => apiKey.value === apiKeyValue);
    return actionResult(index >= 0);
  };
};

export const getApiKeyValidationValidateActionProcessor: ActionProcessorListResolver = async (
  qpqConfig: QPQConfig,
): Promise<ActionProcessorList> => ({
  [ApiKeyValidationActionType.Validate]: getProcessApiKeyValidationValidate(qpqConfig),
});
