import { MathActionTypeEnum } from "quidproquo-core";

const processRandomNumber = async (payload: any, session: any) => {
  return Math.random();
};

export default {
  [MathActionTypeEnum.RandomNumber]: processRandomNumber,
};
