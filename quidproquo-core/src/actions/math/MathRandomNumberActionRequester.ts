import MathActionTypeEnum from './MathActionType';
import { MathRandomNumberActionRequester } from './MathRandomNumberActionRequesterTypes';

export function* askRandomNumber(): MathRandomNumberActionRequester {
  return yield { type: MathActionTypeEnum.RandomNumber };
}
