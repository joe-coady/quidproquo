import MathActionTypeEnum from './MathActionTypeEnum';
import { ActionPayload } from '../../types/ActionPayload';

export interface MathRandomNumberActionPayload extends ActionPayload {
  type: MathActionTypeEnum.RandomNumber;
}

export function* askRandomNumber(): Generator<MathRandomNumberActionPayload, number, number> {
  return yield { type: MathActionTypeEnum.RandomNumber };
}
