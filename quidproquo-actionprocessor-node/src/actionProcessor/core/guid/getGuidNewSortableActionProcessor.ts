import {
  ActionProcessorList,
  ActionProcessorListResolver,
  actionResult,
  GuidActionType,
  GuidNewSortableActionProcessor,
  QPQConfig,
} from 'quidproquo-core';

import { uuidv7 } from 'uuidv7';

const getProcessGuidNewSortable = (qpqConfig: QPQConfig): GuidNewSortableActionProcessor => {
  return async () => {
    return actionResult(uuidv7());
  };
};

export const getGuidNewSortableActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [GuidActionType.NewSortable]: getProcessGuidNewSortable(qpqConfig),
});
