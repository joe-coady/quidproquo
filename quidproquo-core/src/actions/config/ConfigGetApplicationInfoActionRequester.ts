import { ConfigActionType } from './ConfigActionType';
import { ConfigGetApplicationInfoActionRequester } from './ConfigGetApplicationInfoActionTypes';

export function* askConfigGetApplicationInfo(): ConfigGetApplicationInfoActionRequester {
  return yield { type: ConfigActionType.GetApplicationInfo };
}
