import { MathActionType } from './MathActionType';
import { MathRandomNumberActionRequester } from './MathRandomNumberActionRequesterTypes';

export function* askRandomNumber(): MathRandomNumberActionRequester {
  return yield { type: MathActionType.RandomNumber };
}
