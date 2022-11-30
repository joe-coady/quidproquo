import GuidActionTypeEnum from './GuidActionTypeEnum';
import { GuidNewAction } from './GuidActionRequesterTypes';

export function* askNewGuid(): Generator<GuidNewAction, string, string> {
  return yield { type: GuidActionTypeEnum.New };
}
