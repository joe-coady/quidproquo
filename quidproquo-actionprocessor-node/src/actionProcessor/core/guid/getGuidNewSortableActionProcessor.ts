import { uuidv7 } from 'uuidv7';

import {
  ActionProcessorList,
  ActionProcessorListResolver,
  GuidActionType,
  GuidNewSortableActionProcessor,
  QPQConfig,
  actionResult,
} from 'quidproquo-core';

const getProcessGuidNewSortable = (qpqConfig: QPQConfig): GuidNewSortableActionProcessor => {
  return async () => {
    return actionResult(uuidv7());
  };
};

export const getGuidNewSortableActionProcessor: ActionProcessorListResolver = async (qpqConfig: QPQConfig): Promise<ActionProcessorList> => ({
  [GuidActionType.NewSortable]: getProcessGuidNewSortable(qpqConfig),
});
