import {
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameters } from '../../../logic/parametersManager/getParameters';

const getProcessConfigGetParameters = (qpqConfig: QPQConfig): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    const awsParameterKeys = parameterNames.map((pn) => resolveParameterKey(pn, qpqConfig));
    const parameterValues = await getParameters(awsParameterKeys, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig));

    return actionResult(parameterValues);
  };
};

export const getConfigGetParametersActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetParameters]: getProcessConfigGetParameters(qpqConfig),
});
