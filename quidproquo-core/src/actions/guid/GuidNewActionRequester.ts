import GuidActionType from './GuidActionType';
import { GuidNewActionRequester } from './GuidNewActionRequesterTypes';

export function* askNewGuid(): GuidNewActionRequester {
  return yield { type: GuidActionType.New };
}
