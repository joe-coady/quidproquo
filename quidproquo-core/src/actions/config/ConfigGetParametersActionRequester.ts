import { createErrorEnumForAction } from '../../types';
import { ConfigActionType } from './ConfigActionType';
import { ConfigGetParametersActionRequester } from './ConfigGetParametersActionTypes';

export const ConfigGetParametersErrorTypeEnum = createErrorEnumForAction(ConfigActionType.GetParameters, ['Throttling']);

export function* askConfigGetParameters(parameterNames: string[]): ConfigGetParametersActionRequester {
  return yield {
    type: ConfigActionType.GetParameters,
    payload: { parameterNames },
  };
}
