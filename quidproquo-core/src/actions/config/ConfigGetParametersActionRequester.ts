import { ConfigGetParametersActionRequester } from './ConfigGetParametersActionTypes';
import { ConfigActionType } from './ConfigActionType';
import { createErrorEnumForAction } from '../../types';

export const ConfigGetParametersErrorTypeEnum = createErrorEnumForAction(ConfigActionType.GetParameters, ['Throttling']);

export function* askConfigGetParameters(parameterNames: string[]): ConfigGetParametersActionRequester {
  return yield {
    type: ConfigActionType.GetParameters,
    payload: { parameterNames },
  };
}
