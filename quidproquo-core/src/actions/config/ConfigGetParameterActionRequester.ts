import { ConfigGetParameterActionRequester } from './ConfigGetParameterActionTypes';
import { ConfigActionType } from './ConfigActionType';
import { createErrorEnumForAction } from '../../types';

export const ConfigGetParameterErrorTypeEnum = createErrorEnumForAction(ConfigActionType.GetParameter, ['Throttling']);

export function* askConfigGetParameter(parameterName: string): ConfigGetParameterActionRequester {
  return yield { type: ConfigActionType.GetParameter, payload: { parameterName } };
}
