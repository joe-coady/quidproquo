import { v4 as uuidV4 } from 'uuid';

import { GuidActionType, GuidNewActionProcessor, actionResult } from 'quidproquo-core';

const processGuidNew: GuidNewActionProcessor = async () => {
  return actionResult(uuidV4());
};

export default {
  [GuidActionType.New]: processGuidNew,
};
