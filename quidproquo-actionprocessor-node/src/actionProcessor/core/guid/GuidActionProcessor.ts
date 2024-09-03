import { v4 as uuidV4 } from 'uuid';
import { uuidv7 } from 'uuidv7';

import { GuidActionType, GuidNewActionProcessor, GuidNewSortableActionProcessor, actionResult } from 'quidproquo-core';

const processGuidNew: GuidNewActionProcessor = async () => {
  return actionResult(uuidV4());
};

const processGuidNewSortable: GuidNewSortableActionProcessor = async () => {
  return actionResult(uuidv7());
};

export default {
  [GuidActionType.New]: processGuidNew,
  [GuidActionType.NewSortable]: processGuidNewSortable,
};
