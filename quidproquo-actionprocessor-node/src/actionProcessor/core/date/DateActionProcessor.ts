import { DateActionType } from 'quidproquo-core';

const processNow = async (payload: any, session: any) => {
  return new Date().toISOString();
};

export default {
  [DateActionType.Now]: processNow,
};
