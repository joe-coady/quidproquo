import { MathActionType, MathRandomNumberActionProcessor, actionResult } from 'quidproquo-core';

const processMathRandomNumber: MathRandomNumberActionProcessor = async () => {
  return actionResult(Math.random());
};

export default {
  [MathActionType.RandomNumber]: processMathRandomNumber,
};
