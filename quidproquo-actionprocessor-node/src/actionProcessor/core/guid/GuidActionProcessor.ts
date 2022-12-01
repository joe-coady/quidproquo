import { v4 as uuidV4 } from 'uuid';

import { GuidActionType } from 'quidproquo-core';

const processNew = async (payload: any, session: any) => {
  return uuidV4();
};

export default {
  [GuidActionType.New]: processNew,
};
