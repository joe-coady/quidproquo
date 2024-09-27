import {
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  actionResult,
  QPQConfig,
  qpqCoreUtils,
  ActionProcessorListResolver,
  ActionProcessorList,
  actionResultErrorFromCaughtError,
  actionResultError,
  ConfigGetParametersErrorTypeEnum,
} from 'quidproquo-core';

import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

import { getParameters } from '../../../logic/parametersManager/getParameters';

const getProcessConfigGetParameters = (qpqConfig: QPQConfig): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    const awsParameterKeys = parameterNames.map((pn) => resolveParameterKey(pn, qpqConfig));

    try {
      const parameterValues = await getParameters(awsParameterKeys, qpqCoreUtils.getApplicationModuleDeployRegion(qpqConfig));
      return actionResult(parameterValues);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        ThrottlingException: () => actionResultError(ConfigGetParametersErrorTypeEnum.Throttling, 'Throttling: Rate exceeded'),
      });
    }
  };
};

export const getConfigGetParametersActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetParameters]: getProcessConfigGetParameters(qpqConfig),
});
