import { createErrorEnumForAction } from '../../types';
import { ConfigActionType } from './ConfigActionType';
import { ConfigSetParameterActionRequester } from './ConfigSetParameterActionTypes';

export const ConfigSetParameterErrorTypeEnum = createErrorEnumForAction(ConfigActionType.SetParameter, [
  'Throttling', // request rate exceeded
  'QuotaExceeded', // parameter store / storage limit hit
]);

export function* askConfigSetParameter(parameterName: string, parameterValue: string): ConfigSetParameterActionRequester {
  return yield {
    type: ConfigActionType.SetParameter,
    payload: { parameterName, parameterValue },
  };
}
