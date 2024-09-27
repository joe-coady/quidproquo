import {
  ActionProcessorList,
  ActionProcessorListResolver,
  MathActionType,
  MathRandomNumberActionProcessor,
  QPQConfig,
  actionResult,
} from 'quidproquo-core';

const getProcessMathRandomNumber = (qpqConfig: QPQConfig): MathRandomNumberActionProcessor => {
  return async () => {
    return actionResult(Math.random());
  };
};

export const getMathRandomNumberActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [MathActionType.RandomNumber]: getProcessMathRandomNumber(qpqConfig),
});
