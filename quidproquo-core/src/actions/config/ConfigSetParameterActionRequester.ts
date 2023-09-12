import { ConfigSetParameterActionRequester } from './ConfigSetParameterActionTypes';
import { ConfigActionType } from './ConfigActionType';

export function* askConfigSetParameter(parameterName: string, parameterValue: string): ConfigSetParameterActionRequester {
  return yield { type: ConfigActionType.SetParameter, payload: { parameterName, parameterValue } };
}
