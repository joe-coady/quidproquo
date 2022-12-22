import { ConfigGetParameterActionRequester } from './ConfigGetParameterActionTypes';
import { ConfigActionType } from './ConfigActionType';

export function* askConfigGetParameter(parameterName: string): ConfigGetParameterActionRequester {
  return yield { type: ConfigActionType.GetParameter, payload: { parameterName } };
}
