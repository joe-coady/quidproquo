import MathActionTypeEnum from './MathActionTypeEnum';
import { MathRandomNumberAction } from './MathActionRequesterTypes';

export function* askRandomNumber(): Generator<MathRandomNumberAction, number, number> {
  return yield { type: MathActionTypeEnum.RandomNumber };
}
