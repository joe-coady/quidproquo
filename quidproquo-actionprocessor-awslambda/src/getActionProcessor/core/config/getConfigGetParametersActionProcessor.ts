import { qpqConfigAwsUtils } from 'quidproquo-config-aws';
import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  ConfigGetParametersErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

import { getParameters } from '../../../logic/parametersManager/getParameters';
import { resolveParameterKey } from '../../../runtimeConfig/qpqAwsLambdaRuntimeConfigUtils';

const getProcessConfigGetParameters = (qpqConfig: QPQConfig): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    const awsParameterKeys = parameterNames.map((pn) => resolveParameterKey(pn, qpqConfig));

    try {
      const parameterValues = await getParameters(awsParameterKeys, qpqConfigAwsUtils.getApplicationModuleDeployRegion(qpqConfig));
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
