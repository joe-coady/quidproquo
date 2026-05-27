import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  actionResultError,
  actionResultErrorFromCaughtError,
  ConfigActionType,
  ConfigSetParameterActionProcessor,
  ConfigSetParameterErrorTypeEnum,
  QPQConfig,
} from 'quidproquo-core';

const getProcessConfigSetParameter = (qpqConfig: QPQConfig): ConfigSetParameterActionProcessor => {
  return async ({ parameterName, parameterValue }) => {
    try {
      localStorage.setItem(parameterName, parameterValue);

      return actionResult(void 0);
    } catch (error: unknown) {
      return actionResultErrorFromCaughtError(error, {
        QuotaExceededError: () => actionResultError(ConfigSetParameterErrorTypeEnum.QuotaExceeded, `Local Storage quota exceeded saving parameter '${parameterName}'.`),
      });
    }
  };
};

export const getConfigSetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.SetParameter]: getProcessConfigSetParameter(qpqConfig),
});
