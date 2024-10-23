import { ConfigActionType } from './ConfigActionType';
import { ConfigSetParameterActionRequester } from './ConfigSetParameterActionTypes';

export function* askConfigSetParameter(parameterName: string, parameterValue: string): ConfigSetParameterActionRequester {
  return yield {
    type: ConfigActionType.SetParameter,
    payload: { parameterName, parameterValue },
  };
}
