import { createErrorEnumForAction } from '../../types';
import { ConfigActionType } from './ConfigActionType';
import { ConfigListParametersActionRequester } from './ConfigListParametersActionTypes';

export const ConfigListParametersErrorTypeEnum = createErrorEnumForAction(ConfigActionType.ListParameters, ['Throttling']);

export function* askConfigListParameters(): ConfigListParametersActionRequester {
  return yield {
    type: ConfigActionType.ListParameters,
  };
}
