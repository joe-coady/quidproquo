import { DateActionTypeEnum } from "quidproquo-core";

const processNow = async (payload: any, session: any) => {
  return new Date().toISOString();
};

export default {
  [DateActionTypeEnum.Now]: processNow,
};
