import { ConfigGetApplicationInfoActionRequester } from './ConfigGetApplicationInfoActionTypes';
import { ConfigActionType } from './ConfigActionType';

export function* askConfigGetApplicationInfo(): ConfigGetApplicationInfoActionRequester {
  return yield { type: ConfigActionType.GetApplicationInfo };
}
