import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  ConfigActionType,
  ConfigSetParameterActionProcessor,
  ErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

const getProcessConfigSetParameter = (qpqConfig: QPQConfig): ConfigSetParameterActionProcessor => {
  return async ({ parameterName, parameterValue }) => {
    try {
      localStorage.setItem(parameterName, parameterValue);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultError(ErrorTypeEnum.GenericError, `Failed to save parameter '${parameterName}' to Local Storage.`);
    }
  };
};

export const getConfigSetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.SetParameter]: getProcessConfigSetParameter(qpqConfig),
});
