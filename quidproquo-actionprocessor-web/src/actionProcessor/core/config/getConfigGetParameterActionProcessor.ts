import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ConfigActionType,
  ConfigGetParameterActionProcessor,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

const getProcessConfigGetParameter = (qpqConfig: QPQConfig): ConfigGetParameterActionProcessor => {
  return async ({ parameterName }) => {
    // Read the value from Local Storage
    const parameterValue = localStorage.getItem(parameterName);

    // If the parameter doesn't exist, return an error
    if (parameterValue === null) {
      return actionResultError(ErrorTypeEnum.NotFound, `Parameter '${parameterName}' not found in Local Storage`);
    }

    return actionResult(parameterValue);
  };
};

export const getConfigGetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetParameter]: getProcessConfigGetParameter(qpqConfig),
});
