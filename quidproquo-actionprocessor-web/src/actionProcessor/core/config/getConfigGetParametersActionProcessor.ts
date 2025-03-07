import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ConfigActionType,
  ConfigGetParametersActionProcessor,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

const getProcessConfigGetParameters = (qpqConfig: QPQConfig): ConfigGetParametersActionProcessor => {
  return async ({ parameterNames }) => {
    // Retrieve values from Local Storage for each parameter name
    const parameterValues = parameterNames.map((name) => ({
      name,
      value: localStorage.getItem(name),
      found: localStorage.getItem(name) !== null, // Check if it exists
    }));

    // Find missing parameters
    const missingParameters = parameterValues.filter((param) => !param.found);

    // If any parameters are missing, return an error
    if (missingParameters.length > 0) {
      return actionResultError(
        ErrorTypeEnum.NotFound,
        `Parameters not found in Local Storage: ${missingParameters.map((param) => param.name).join(', ')}`,
      );
    }

    // Return an array of values
    return actionResult(parameterValues.map((param) => param.value));
  };
};

export const getConfigGetParametersActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetParameters]: getProcessConfigGetParameters(qpqConfig),
});
