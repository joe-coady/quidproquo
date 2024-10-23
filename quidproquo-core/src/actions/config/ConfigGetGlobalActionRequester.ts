import { ConfigActionType } from './ConfigActionType';
import { ConfigGetGlobalActionRequester } from './ConfigGetGlobalActionTypes';

export function* askConfigGetGlobal<T>(globalName: string): ConfigGetGlobalActionRequester<T> {
  return yield { type: ConfigActionType.GetGlobal, payload: { globalName } };
}
