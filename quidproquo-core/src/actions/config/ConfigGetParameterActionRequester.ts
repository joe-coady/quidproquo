import { createErrorEnumForAction } from '../../types';
import { ConfigActionType } from './ConfigActionType';
import { ConfigGetParameterActionRequester } from './ConfigGetParameterActionTypes';

export const ConfigGetParameterErrorTypeEnum = createErrorEnumForAction(ConfigActionType.GetParameter, ['Throttling']);

export function* askConfigGetParameter(parameterName: string): ConfigGetParameterActionRequester {
  return yield {
    type: ConfigActionType.GetParameter,
    payload: { parameterName },
  };
}
