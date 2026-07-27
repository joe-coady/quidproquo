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
    // window.localStorage (not the bare global): Node exposes a non-functional
    // localStorage global that shadows jsdom's in tests.
    const parameterValue = window.localStorage.getItem(parameterName);

    if (parameterValue === null) {
      return actionResultError(ErrorTypeEnum.NotFound, `Parameter '${parameterName}' not found in Local Storage`);
    }

    return actionResult(parameterValue);
  };
};

export const getConfigGetParameterActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [ConfigActionType.GetParameter]: getProcessConfigGetParameter(qpqConfig),
});
