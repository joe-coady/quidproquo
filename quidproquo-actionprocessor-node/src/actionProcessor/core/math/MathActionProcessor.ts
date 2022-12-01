import { MathActionType } from 'quidproquo-core';

const processRandomNumber = async (payload: any, session: any) => {
  return Math.random();
};

export default {
  [MathActionType.RandomNumber]: processRandomNumber,
};
