import GuidActionTypeEnum from './GuidActionTypeEnum';
import { ActionPayload } from '../../types/ActionPayload';

export interface GuidNewActionPayload extends ActionPayload {
  type: GuidActionTypeEnum.New;
}

export function* askNewGuid(): Generator<GuidNewActionPayload, string, string> {
  return yield { type: GuidActionTypeEnum.New };
}
