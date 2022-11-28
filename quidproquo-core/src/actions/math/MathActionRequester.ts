import MathActionTypeEnum from './MathActionTypeEnum';

export function* askRandomNumber(): Generator<any, number, number> {
  return yield { type: MathActionTypeEnum.RandomNumber }
}