import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  GuidActionType,
  GuidNewSortableManyActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { uuidv7 } from 'uuidv7';

// Sequential uuidv7() calls are monotonic within a process (the generator's
// counter bits order same-millisecond mints), so array order IS sort order.
const getProcessGuidNewSortableMany = (qpqConfig: QPQConfig): GuidNewSortableManyActionProcessor => {
  return async ({ count }) => {
    return actionResult(Array.from({ length: count }, () => uuidv7()));
  };
};

export const getGuidNewSortableManyActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [GuidActionType.NewSortableMany]: getProcessGuidNewSortableMany(qpqConfig),
});
