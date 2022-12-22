import { ConfigGetParametersActionRequester } from './ConfigGetParametersActionTypes';
import { ConfigActionType } from './ConfigActionType';

export function* askConfigGetParameters(
  parameterNames: string[],
): ConfigGetParametersActionRequester {
  return yield { type: ConfigActionType.GetParameters, payload: { parameterNames } };
}
