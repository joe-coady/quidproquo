import { ConfigGetGlobalActionRequester } from './ConfigGetGlobalActionTypes';
import { ConfigActionType } from './ConfigActionType';

export function* askConfigGetGlobal<T>(globalName: string): ConfigGetGlobalActionRequester<T> {
  return yield { type: ConfigActionType.GetGlobal, payload: { globalName } };
}
